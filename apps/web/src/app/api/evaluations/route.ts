import { createEvaluationSchema } from "@/features/evaluations/schema";
import { createEvaluation, listEvaluations } from "@/features/evaluations/service";
import { authorizeRequest } from "@/lib/access-control";
import { workerAvailable } from "@/lib/worker-availability";

export async function GET(request: Request) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const evaluations = await listEvaluations();
    return Response.json({ evaluations });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const parsed = createEvaluationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { code: "INVALID_INPUT", issues: parsed.error.issues.map(({ path, message }) => ({ path, message })) },
        { status: 400 },
      );
    }

    if (!(await workerAvailable())) return Response.json({ code: "WORKER_UNAVAILABLE" }, { status: 503 });

    const evaluation = await createEvaluation(parsed.data);
    return Response.json({ evaluationId: evaluation.id, status: evaluation.status }, { status: 201 });
  } catch {
    return Response.json({ code: "EVALUATION_CREATE_FAILED" }, { status: 503 });
  }
}
