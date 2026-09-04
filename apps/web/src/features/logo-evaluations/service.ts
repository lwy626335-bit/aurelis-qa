import "server-only";

import { createHash } from "node:crypto";

import { database } from "@aurelis/database/client";
import { calculateVisualScore, enforceAiAssessmentScope, logoDimensionWeights, logoEvaluationOutputSchema } from "@aurelis/evaluation";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import type { LogoMetadata } from "./schema";

const MODEL_ID = process.env.OPENAI_VISION_EVALUATION_MODEL || "gpt-5.6-luna";
const PROMPT_VERSION = "logo-visual-evaluator-v1.0";

export async function createLogoEvaluation(input: LogoMetadata, bytes: Uint8Array, mediaType: string) {
  if (!process.env.OPENAI_API_KEY) throw new Error("AI_EVALUATION_UNAVAILABLE");

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.parse({
    input: [
      {
        role: "system",
        content: "You are a senior identity designer evaluating one logo for a founder. Judge only visible evidence and the supplied brand context. Return every rubric dimension exactly once with a 0-100 score; do not calculate an overall score. Check legibility at small sizes, silhouette, light/dark versatility, distinctiveness, and brand fit. The AI assessment applies only when aiGenerated is true; never infer provenance. When it is false, use not_applicable and zero risk values. Return exactly three concrete prioritized recommendations in the requested language.",
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              aiGenerated: input.aiGenerated,
              aiGenerator: input.aiGenerator,
              brandKeywords: input.brandKeywords,
              brandName: input.brandName,
              industry: input.industry,
              originalPrompt: input.originalPrompt,
              outputLanguage: input.language,
              rubric: logoDimensionWeights,
              targetLabel: input.targetLabel,
            }),
          },
          { detail: "high", image_url: `data:${mediaType};base64,${Buffer.from(bytes).toString("base64")}`, type: "input_image" },
        ],
      },
    ],
    model: MODEL_ID,
    reasoning: { effort: "low" },
    store: false,
    text: { format: zodTextFormat(logoEvaluationOutputSchema, "logo_evaluation") },
  });

  if (!response.output_parsed) throw new Error("AI_EVALUATION_UNPARSED");
  const result = enforceAiAssessmentScope(logoEvaluationOutputSchema.parse(response.output_parsed), input.aiGenerated);
  const overallScore = calculateVisualScore(result.dimensions, logoDimensionWeights);
  const inputHash = createHash("sha256").update(bytes).digest("hex");

  return database.$transaction(async (transaction) => {
    const project = (await transaction.project.findFirst({ where: { name: input.brandName } }))
      ?? (await transaction.project.create({ data: { name: input.brandName } }));
    return transaction.logoEvaluation.create({
      data: {
        aiAssessment: result.aiAssessment as never,
        aiGenerated: input.aiGenerated,
        aiGenerator: input.aiGenerator,
        brandKeywords: input.brandKeywords,
        brandName: input.brandName,
        dimensionScores: result.dimensions as never,
        industry: input.industry,
        inputHash,
        language: input.language,
        modelId: MODEL_ID,
        originalPrompt: input.originalPrompt,
        overallScore,
        projectId: project.id,
        promptVersion: PROMPT_VERSION,
        recommendations: result.recommendations as never,
        summary: result.summary,
        targetLabel: input.targetLabel,
      },
    });
  });
}

export function getLogoEvaluation(id: string) {
  return database.logoEvaluation.findUnique({ where: { id }, include: { project: true } });
}

export function listLogoEvaluations() {
  return database.logoEvaluation.findMany({ include: { project: true }, orderBy: { createdAt: "desc" } });
}

export async function deleteLogoEvaluation(id: string) {
  const evaluation = await database.logoEvaluation.findUnique({ where: { id }, select: { id: true } });
  if (!evaluation) return false;
  await database.logoEvaluation.delete({ where: { id } });
  return true;
}
