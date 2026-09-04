import { cancelEvaluation, deleteEvaluation, getEvaluation } from "@/features/evaluations/service";
import { authorizeRequest } from "@/lib/access-control";

type EvaluationRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: EvaluationRouteContext) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await context.params;
    const evaluation = await getEvaluation(id);
    if (!evaluation) return Response.json({ code: "NOT_FOUND" }, { status: 404 });
    return Response.json({ evaluation });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}

export async function DELETE(request: Request, context: EvaluationRouteContext) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await context.params;
    if (new URL(request.url).searchParams.get("purge") === "true") {
      const deleted = await deleteEvaluation(id);
      return deleted ? new Response(null, { status: 204 }) : Response.json({ code: "NOT_FOUND" }, { status: 404 });
    }
    const cancelled = await cancelEvaluation(id);
    if (!cancelled) return Response.json({ code: "NOT_CANCELLABLE" }, { status: 409 });
    return Response.json({ status: "CANCELLED" });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}
