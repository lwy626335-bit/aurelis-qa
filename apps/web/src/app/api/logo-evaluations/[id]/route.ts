import { deleteLogoEvaluation } from "@/features/logo-evaluations/service";
import { authorizeRequest } from "@/lib/access-control";

type LogoEvaluationRouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: LogoEvaluationRouteContext) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await context.params;
    const deleted = await deleteLogoEvaluation(id);
    return deleted ? new Response(null, { status: 204 }) : Response.json({ code: "NOT_FOUND" }, { status: 404 });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}
