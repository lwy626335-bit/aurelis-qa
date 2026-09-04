import { getEvaluationStatus } from "@/features/evaluations/service";
import { authorizeRequest } from "@/lib/access-control";

type EvaluationStatusRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: EvaluationStatusRouteContext) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const { id } = await context.params;
    const evaluation = await getEvaluationStatus(id);
    if (!evaluation) return Response.json({ code: "NOT_FOUND" }, { status: 404 });

    return Response.json({
      snapshot: {
        evaluationStatus: evaluation.status,
        jobStatus: evaluation.job?.status ?? null,
        stage: evaluation.job?.stage ?? null,
        attemptCount: evaluation.job?.attemptCount ?? 0,
        maxAttempts: evaluation.job?.maxAttempts ?? 0,
        hasTechnicalResult: Boolean(evaluation.technicalResult),
        hasBrandResult: Boolean(evaluation.brandResult),
        hasBrandTarget: Boolean(evaluation.brandProfileId),
        hasVisualResult: Boolean(evaluation.visualResult),
        failureCode: evaluation.failureCode,
        failureMessage: evaluation.failureMessage,
      },
    });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}
