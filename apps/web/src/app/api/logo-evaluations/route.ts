import { createLogoEvaluation } from "@/features/logo-evaluations/service";
import { detectLogoImageType, logoMetadataSchema, MAX_LOGO_BYTES } from "@/features/logo-evaluations/schema";
import { authorizeRequest } from "@/lib/access-control";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  try {
    const form = await request.formData();
    const logo = form.get("logo");
    if (!(logo instanceof File) || logo.size === 0 || logo.size > MAX_LOGO_BYTES) {
      return Response.json({ code: "INVALID_LOGO_FILE" }, { status: 400 });
    }

    const metadata = logoMetadataSchema.safeParse({
      aiGenerated: form.get("aiGenerated") === "true",
      aiGenerator: String(form.get("aiGenerator") ?? "").trim() || null,
      brandKeywords: String(form.get("brandKeywords") ?? "").split(/[,，]/).map((item) => item.trim()).filter(Boolean),
      brandName: form.get("brandName"),
      industry: form.get("industry"),
      language: form.get("language"),
      originalPrompt: String(form.get("originalPrompt") ?? "").trim() || null,
      targetLabel: form.get("targetLabel"),
    });
    if (!metadata.success) return Response.json({ code: "INVALID_INPUT" }, { status: 400 });

    const bytes = new Uint8Array(await logo.arrayBuffer());
    const mediaType = detectLogoImageType(bytes);
    if (!mediaType) return Response.json({ code: "UNSUPPORTED_LOGO_FORMAT" }, { status: 400 });

    const evaluation = await createLogoEvaluation(metadata.data, bytes, mediaType);
    return Response.json({ evaluationId: evaluation.id }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error && error.message === "AI_EVALUATION_UNAVAILABLE"
      ? "AI_EVALUATION_UNAVAILABLE"
      : "LOGO_EVALUATION_FAILED";
    return Response.json({ code }, { status: code === "AI_EVALUATION_UNAVAILABLE" ? 503 : 502 });
  }
}
