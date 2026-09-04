import { database } from "@aurelis/database/client";
import { brandEvaluationOutputSchema, brandEvaluationStructuredSchema, calculateReliability } from "@aurelis/evaluation";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import { websiteOverallScore } from "./overall.js";

const MODEL_ID = process.env.OPENAI_EVALUATION_MODEL || "gpt-5.6-luna";
const MODEL_DISPLAY_NAME = process.env.OPENAI_EVALUATION_MODEL_DISPLAY_NAME || "GPT-5.6 Luna";
const PROMPT_VERSION = "brand-evaluator-v1.0";
const dimensions = [
  ["tone-consistency", 20], ["vocabulary-alignment", 15], ["brand-personality", 20],
  ["audience-fit", 15], ["message-consistency", 15], ["writing-style", 10], ["cta-consistency", 5],
] as const;

type StageResponse<T> = {
  error: { message: string } | null;
  incomplete_details: { reason?: string } | null;
  output: Array<{ type: string; content?: Array<{ type: string; refusal?: string }> }>;
  output_parsed: T | null;
  status?: string;
};

export function parseStageOutput<T>(response: StageResponse<T>, stage: "evaluator" | "reviewer") {
  const prefix = `AI_${stage.toUpperCase()}`;
  const refusal = response.output.flatMap((item) => item.content ?? []).find((item) => item.type === "refusal")?.refusal;
  if (refusal) throw new Error(`${prefix}_REFUSED:${refusal.replace(/\s+/g, " ").slice(0, 300)}`);
  if (response.status === "incomplete") throw new Error(`${prefix}_INCOMPLETE:${response.incomplete_details?.reason ?? "unknown"}`);
  if (response.status && response.status !== "completed") throw new Error(`${prefix}_${response.status.toUpperCase()}:${response.error?.message ?? "unknown"}`);
  if (!response.output_parsed) throw new Error(`${prefix}_UNPARSED:status=${response.status ?? "unknown"}`);
  return response.output_parsed;
}

function targetText(html: string) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function verifyOutput(output: unknown, sources: Map<string, string>) {
  const parsed = brandEvaluationOutputSchema.parse(output);
  if (parsed.dimensions.length !== dimensions.length) throw new Error("BRAND_DIMENSION_COUNT_INVALID");
  for (const [key, maxScore] of dimensions) {
    const dimension = parsed.dimensions.find((item) => item.dimensionKey === key);
    if (!dimension || dimension.maxScore !== maxScore || dimension.score > maxScore) throw new Error(`BRAND_RUBRIC_INVALID:${key}`);
    for (const evidence of dimension.evidence) {
      const source = sources.get(evidence.sourceId);
      if (!source || !source.includes(evidence.excerpt)) throw new Error(`EVIDENCE_ANCHOR_INVALID:${evidence.sourceId}`);
    }
  }
  return parsed;
}

async function callStage(client: OpenAI, input: string, stage: "evaluator" | "reviewer") {
  const response = await client.responses.parse({
    model: MODEL_ID,
    input: [
      { role: "system", content: `You are the independent ${stage} in an evidence-based brand voice study. Use only supplied sources and rubric. No evidence means insufficient_evidence. Do not calculate an overall score. Return every rubric dimension exactly once. Preserve evidence excerpts verbatim. Respond in the target content language.` },
      { role: "user", content: input },
    ],
    store: false,
    text: { format: zodTextFormat(brandEvaluationStructuredSchema, `brand_${stage}`) },
  });
  return parseStageOutput(response, stage);
}

export async function runBrandEvaluation(evaluationId: string) {
  if (!process.env.OPENAI_API_KEY) throw new Error("AI_EVALUATION_UNAVAILABLE");
  const evaluation = await database.evaluation.findUnique({
    where: { id: evaluationId },
    include: { brandProfile: { include: { examples: true, referenceSources: true } }, website: true },
  });
  if (!evaluation?.brandProfile) return null;
  if (!evaluation.website.htmlContent) throw new Error("BRAND_TARGET_TEXT_UNAVAILABLE");

  const brand = evaluation.brandProfile;
  const target = targetText(evaluation.website.htmlContent);
  const sources = new Map<string, string>([["target", target]]);
  brand.examples.forEach((item) => sources.set(item.id, item.content));
  brand.referenceSources.forEach((item) => sources.set(item.id, item.content));
  const payload = JSON.stringify({
    brand: { description: brand.description, forbiddenVocabulary: brand.forbiddenVocabulary, name: brand.name, personalities: brand.personalities, preferredVocabulary: brand.preferredVocabulary, targetAudience: brand.targetAudience, toneProfile: brand.toneProfile },
    rubric: dimensions.map(([key, maxScore]) => ({ key, maxScore })),
    sources: [...sources].map(([sourceId, content]) => ({ content, sourceId })),
    targetContentLanguage: evaluation.website.language,
  });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const evaluator = verifyOutput(await callStage(client, payload, "evaluator"), sources);
  const reviewerInput = JSON.stringify({ evaluator, instruction: "Verify anchors, reasoning, score/rubric consistency, and return the corrected complete result.", payload: JSON.parse(payload) });
  const reviewer = verifyOutput(await callStage(client, reviewerInput, "reviewer"), sources);
  const brandScore = Math.round(reviewer.dimensions.reduce((total, item) => total + item.score, 0) * 10) / 10;
  const insufficient = reviewer.dimensions.some((item) => item.insufficientEvidence);
  const overallScore = websiteOverallScore({ brand: brandScore, technical: evaluation.technicalScore, visual: evaluation.visualScore });
  const evidenceItems = reviewer.dimensions.flatMap((item) => item.evidence);
  const strengthValue = { insufficient: 0, moderate: 70, strong: 100, weak: 40 } as const;
  const reliabilityComponents = {
    evidenceCompleteness: Math.round(reviewer.dimensions.filter((item) => item.evidence.length > 0).length / reviewer.dimensions.length * 100),
    evidenceStrength: evidenceItems.length ? Math.round(evidenceItems.reduce((total, item) => total + strengthValue[item.strength], 0) / evidenceItems.length) : 0,
    evaluatorReviewerAgreement: Math.max(0, Math.round(100 - reviewer.dimensions.reduce((total, item) => { const original = evaluator.dimensions.find((candidate) => candidate.dimensionKey === item.dimensionKey); return total + Math.abs(item.score - (original?.score ?? 0)) / item.maxScore * 100; }, 0) / reviewer.dimensions.length)),
    reproducibility: 100,
  };
  const reliabilityScore = calculateReliability(reliabilityComponents);

  await database.$transaction(async (transaction) => {
    await transaction.evaluationEvidence.deleteMany({ where: { evaluationId, dimensionKey: { startsWith: "brand:" } } });
    await transaction.recommendation.deleteMany({ where: { evaluationId, dimensionKey: { startsWith: "brand:" } } });
    await transaction.brandResult.upsert({ where: { evaluationId }, create: { dimensionScores: reviewer.dimensions.map(({ dimensionKey, maxScore, score }) => ({ dimensionKey, maxScore, score })), evaluatorOutput: evaluator, evaluationId, insufficientEvidence: insufficient, reviewerOutput: { reliabilityComponents, result: reviewer } }, update: { dimensionScores: reviewer.dimensions.map(({ dimensionKey, maxScore, score }) => ({ dimensionKey, maxScore, score })), evaluatorOutput: evaluator, insufficientEvidence: insufficient, reviewerOutput: { reliabilityComponents, result: reviewer } } });
    await transaction.evaluationEvidence.createMany({ data: reviewer.dimensions.flatMap((item) => item.evidence.map((evidence) => ({ dimensionKey: `brand:${item.dimensionKey}`, evaluationId, excerpt: evidence.excerpt, maxScore: item.maxScore, observation: item.observation, reason: item.reason, score: item.score, strength: evidence.strength.toUpperCase() as "STRONG" | "MODERATE" | "WEAK" | "INSUFFICIENT" }))) });
    await transaction.recommendation.createMany({ data: reviewer.dimensions.filter((item) => item.recommendation.trim()).map((item) => ({ description: item.reason, dimensionKey: `brand:${item.dimensionKey}`, evaluationId, severity: "MEDIUM", suggestedFix: item.recommendation, title: item.observation.slice(0, 120) })) });
    await transaction.evaluation.update({ where: { id: evaluationId }, data: { brandScore, completedAt: new Date(), evaluatorModel: MODEL_DISPLAY_NAME, evaluatorModelId: MODEL_ID, failureCode: evaluation.failureCode === "AI_VISUAL_UNAVAILABLE" ? evaluation.failureCode : null, failureMessage: evaluation.failureCode === "AI_VISUAL_UNAVAILABLE" ? evaluation.failureMessage : null, overallScore, promptVersion: PROMPT_VERSION, referenceCorpusVersion: brand.corpusVersion, reliabilityScore, status: overallScore === null || evaluation.visualScore === null ? "PARTIAL" : "COMPLETED" } });
    await transaction.evaluationVersion.updateMany({ where: { evaluationId }, data: { evaluatorModelId: MODEL_ID, promptVersion: PROMPT_VERSION, referenceCorpusVersion: brand.corpusVersion } });
  });
  return brandScore;
}
