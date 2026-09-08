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
    return Response.json({
      evaluation: {
        brandScore: evaluation.brandScore,
        completedAt: evaluation.completedAt,
        createdAt: evaluation.createdAt,
        evidence: evaluation.evidence,
        failureCode: evaluation.failureCode,
        failureMessage: evaluation.failureMessage,
        id: evaluation.id,
        inputType: evaluation.inputType,
        job: evaluation.job,
        overallScore: evaluation.overallScore,
        project: { id: evaluation.project.id, name: evaluation.project.name },
        recommendations: evaluation.recommendations,
        reliabilityScore: evaluation.reliabilityScore,
        rubricVersion: evaluation.rubricVersion,
        status: evaluation.status,
        technicalResult: evaluation.technicalResult && {
          accessibilityScore: evaluation.technicalResult.accessibilityScore,
          bestPracticesScore: evaluation.technicalResult.bestPracticesScore,
          codeQualityScore: evaluation.technicalResult.codeQualityScore,
          htmlQualityScore: evaluation.technicalResult.htmlQualityScore,
          performanceScore: evaluation.technicalResult.performanceScore,
          responsiveScore: evaluation.technicalResult.responsiveScore,
          seoScore: evaluation.technicalResult.seoScore,
        },
        technicalScore: evaluation.technicalScore,
        updatedAt: evaluation.updatedAt,
        visualScore: evaluation.visualScore,
        website: {
          canonicalUrl: evaluation.website.canonicalUrl,
          id: evaluation.website.id,
          inputType: evaluation.website.inputType,
          label: evaluation.website.label,
          language: evaluation.website.language,
        },
      },
    });
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
