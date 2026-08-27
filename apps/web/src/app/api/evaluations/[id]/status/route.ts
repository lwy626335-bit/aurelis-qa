import { getEvaluationStatus } from "@/features/evaluations/service";

type EvaluationStatusRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: EvaluationStatusRouteContext) {
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
        failureCode: evaluation.failureCode,
        failureMessage: evaluation.failureMessage,
      },
    });
  } catch {
    return Response.json({ code: "DATABASE_UNAVAILABLE" }, { status: 503 });
  }
}
