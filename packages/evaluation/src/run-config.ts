import { z } from "zod";

export const BRAND_PROMPT_VERSION = "brand-evaluator-v1.0";
export const WEB_VISUAL_PROMPT_VERSION = "web-visual-evaluator-v1.0";

export const defaultOverallWeights = {
  brand: 0.2,
  technical: 0.5,
  visual: 0.3,
} as const;

export const overallWeightsSchema = z.object({
  brand: z.number().min(0).max(1),
  technical: z.number().min(0).max(1),
  visual: z.number().min(0).max(1),
}).refine((weights) => Math.abs(weights.brand + weights.technical + weights.visual - 1) < 0.000001, "WEIGHTS_MUST_TOTAL_ONE");

export const evaluationRunConfigSchema = z.object({
  brand: z.object({ modelId: z.string().min(1), promptVersion: z.string().min(1) }),
  visual: z.object({ modelId: z.string().min(1), promptVersion: z.string().min(1), reasoningEffort: z.literal("low") }),
});

export type OverallWeights = z.infer<typeof overallWeightsSchema>;
export type EvaluationRunConfig = z.infer<typeof evaluationRunConfigSchema>;

export function defaultEvaluationRunConfig(environment: NodeJS.ProcessEnv = process.env): EvaluationRunConfig {
  return {
    brand: {
      modelId: environment.OPENAI_EVALUATION_MODEL || "gpt-5.6-luna",
      promptVersion: BRAND_PROMPT_VERSION,
    },
    visual: {
      modelId: environment.OPENAI_VISION_EVALUATION_MODEL || "gpt-5.6-luna",
      promptVersion: WEB_VISUAL_PROMPT_VERSION,
      reasoningEffort: "low",
    },
  };
}

export function rubricOverallWeights(dimensions: readonly { key: string; weight: number }[]): OverallWeights {
  const candidate = Object.fromEntries(dimensions.map(({ key, weight }) => [key, weight]));
  const parsed = overallWeightsSchema.safeParse(candidate);
  return parsed.success ? parsed.data : { ...defaultOverallWeights };
}
