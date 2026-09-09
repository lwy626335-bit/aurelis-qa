import { createEvaluationSchema } from "@/features/evaluations/schema";
import { countEvaluations, createEvaluation, getEvaluationByRequestKey, listEvaluations, queueHasCapacity } from "@/features/evaluations/service";
import { authorizeRequest, validServiceToken } from "@/lib/access-control";
import { rateLimitResponse, withinRateLimit } from "@/lib/rate-limit";
import { workerAvailable } from "@/lib/worker-availability";

export async function GET(request: Request) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const search = new URL(request.url).searchParams;
    const page = Math.max(1, Number.parseInt(search.get("page") ?? "1", 10) || 1);
    const take = Math.min(100, Math.max(1, Number.parseInt(search.get("limit") ?? "25", 10) || 25));
    const requestedStatus = search.get("status");
    const status = ["QUEUED", "RUNNING", "COMPLETED", "PARTIAL", "FAILED", "CANCELLED"].includes(requestedStatus ?? "")
      ? requestedStatus as "QUEUED" | "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED" | "CANCELLED"
      : undefined;
    const options = { query: search.get("q")?.trim() || undefined, status };
    const [evaluations, total] = await Promise.all([
      listEvaluations({ ...options, skip: (page - 1) * take, take }),
      countEvaluations(options),
    ]);
    return Response.json({ evaluations, page, pageSize: take, total });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  if (!validServiceToken(request) && !(await withinRateLimit(request, "evaluation-create", 3, 3_600_000))) return rateLimitResponse();
  try {
    const parsed = createEvaluationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { code: "INVALID_INPUT", issues: parsed.error.issues.map(({ path, message }) => ({ path, message })) },
        { status: 400 },
      );
    }

    const requestKeyHeader = request.headers.get("idempotency-key")?.trim();
    const requestKey = requestKeyHeader && /^[A-Za-z0-9._:-]{8,200}$/.test(requestKeyHeader) ? requestKeyHeader : undefined;
    if (requestKeyHeader && !requestKey) return Response.json({ code: "INVALID_IDEMPOTENCY_KEY" }, { status: 400 });
    if (requestKey) {
      const existing = await getEvaluationByRequestKey(requestKey);
      if (existing) return Response.json({ evaluationId: existing.id, status: existing.status });
    }

    if (!(await workerAvailable())) return Response.json({ code: "WORKER_UNAVAILABLE" }, { status: 503 });
    if (!(await queueHasCapacity())) return Response.json({ code: "QUEUE_CAPACITY_EXCEEDED" }, { status: 429, headers: { "retry-after": "30" } });

    const evaluation = await createEvaluation(parsed.data, requestKey);
    return Response.json({ evaluationId: evaluation.id, status: evaluation.status }, { status: 201 });
  } catch {
    return Response.json({ code: "EVALUATION_CREATE_FAILED" }, { status: 503 });
  }
}
