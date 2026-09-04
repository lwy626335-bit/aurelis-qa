import { getEvaluation } from "@/features/evaluations/service";
import { authorizeRequest } from "@/lib/access-control";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const unauthorized = authorizeRequest(request);
  if (unauthorized) return unauthorized;
  if (!process.env.OPENAI_API_KEY) return Response.json({ code: "AI_REWRITE_UNAVAILABLE" }, { status: 503 });
  const { id } = await context.params;
  const evaluation = await getEvaluation(id).catch(() => null);
  if (!evaluation) return Response.json({ code: "NOT_FOUND" }, { status: 404 });
  if (!evaluation.website.htmlContent || evaluation.recommendations.length === 0) return Response.json({ code: "NO_REWRITE_INPUT" }, { status: 409 });
  const model = process.env.OPENAI_EVALUATION_MODEL || "gpt-5.6-luna";
  const schema = {
    additionalProperties: false,
    properties: {
      suggestions: {
        items: {
          additionalProperties: false,
          properties: { original: { type: "string" }, rationale: { type: "string" }, rewrite: { type: "string" } },
          required: ["original", "rewrite", "rationale"],
          type: "object",
        },
        maxItems: 10,
        type: "array",
      },
    },
    required: ["suggestions"],
    type: "object",
  };
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" }, body: JSON.stringify({ model, input: [{ role: "system", content: "Return rewrite suggestions only. Never claim that source content was changed. Preserve meaning and use the target content language. Each original excerpt must be verbatim from the supplied target." }, { role: "user", content: JSON.stringify({ recommendations: evaluation.recommendations, target: evaluation.website.htmlContent, targetLanguage: evaluation.website.language }) }], text: { format: { type: "json_schema", name: "rewrite_suggestions", strict: true, schema } } }) });
  if (!response.ok) return Response.json({ code: "AI_REWRITE_UNAVAILABLE" }, { status: 503 });
  const payload = await response.json() as { output?: { content?: { type?: string; text?: string }[] }[] };
  const text = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!text) return Response.json({ code: "AI_REWRITE_UNAVAILABLE" }, { status: 503 });
  const result = JSON.parse(text) as { suggestions?: { original: string; rationale: string; rewrite: string }[] };
  if (!Array.isArray(result.suggestions) || result.suggestions.some((item) => !evaluation.website.htmlContent?.includes(item.original))) return Response.json({ code: "AI_REWRITE_INVALID_EVIDENCE" }, { status: 502 });
  return Response.json({ modelId: model, suggestions: result.suggestions });
}
