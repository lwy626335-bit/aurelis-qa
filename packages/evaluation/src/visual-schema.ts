import { z } from "zod";

import { calculateWeightedScore } from "./scoring";

const findingSchema = z.object({
  key: z.string().min(1),
  observation: z.string().min(1).max(600),
  score: z.number().min(0).max(100),
});

const aiAssessmentSchema = z.object({
  applies: z.boolean(),
  artifactRisk: z.number().min(0).max(100),
  consistencyRisk: z.number().min(0).max(100),
  genericness: z.number().min(0).max(100),
  refinementNeed: z.number().min(0).max(100),
  riskLevel: z.enum(["not_applicable", "low", "medium", "high"]),
  summary: z.string().min(1).max(600),
});

const recommendationSchema = z.object({
  action: z.string().min(1).max(600),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string().min(1).max(120),
});

function outputSchema<const Keys extends readonly [string, ...string[]]>(keys: Keys) {
  return z.object({
    aiAssessment: aiAssessmentSchema,
    dimensions: z.array(findingSchema.extend({ key: z.enum(keys) })).length(keys.length),
    recommendations: z.array(recommendationSchema).length(3),
    summary: z.string().min(1).max(800),
  }).superRefine((output, context) => {
    const found = new Set(output.dimensions.map(({ key }) => key));
    for (const key of keys) {
      if (!found.has(key)) context.addIssue({ code: "custom", message: `MISSING_DIMENSION:${key}`, path: ["dimensions"] });
    }
  });
}

export const logoDimensionWeights = {
  "brand-fit": 0.25,
  distinctiveness: 0.2,
  legibility: 0.2,
  scalability: 0.2,
  versatility: 0.15,
} as const;

export const webVisualDimensionWeights = {
  "brand-expression": 0.15,
  "content-clarity": 0.2,
  "responsive-readiness": 0.2,
  "visual-coherence": 0.2,
  "visual-hierarchy": 0.25,
} as const;

export const logoEvaluationOutputSchema = outputSchema([
  "distinctiveness",
  "legibility",
  "scalability",
  "brand-fit",
  "versatility",
]);

export const webVisualEvaluationOutputSchema = outputSchema([
  "visual-hierarchy",
  "content-clarity",
  "visual-coherence",
  "responsive-readiness",
  "brand-expression",
]);

export type LogoEvaluationOutput = z.infer<typeof logoEvaluationOutputSchema>;
export type WebVisualEvaluationOutput = z.infer<typeof webVisualEvaluationOutputSchema>;
type VisualEvaluationOutput = LogoEvaluationOutput | WebVisualEvaluationOutput;

export function enforceAiAssessmentScope<T extends VisualEvaluationOutput>(output: T, aiGenerated: boolean): T {
  if (aiGenerated) {
    if (!output.aiAssessment.applies || output.aiAssessment.riskLevel === "not_applicable") {
      throw new Error("AI_ASSESSMENT_SCOPE_MISMATCH");
    }
    return output;
  }

  return {
    ...output,
    aiAssessment: {
      ...output.aiAssessment,
      applies: false,
      artifactRisk: 0,
      consistencyRisk: 0,
      genericness: 0,
      refinementNeed: 0,
      riskLevel: "not_applicable",
    },
  } as T;
}

export function calculateVisualScore(
  dimensions: readonly { key: string; score: number }[],
  weights: Readonly<Record<string, number>>,
) {
  return calculateWeightedScore(
    dimensions.map(({ key, score }) => ({ key, maxScore: 100, score, weight: weights[key] ?? 0 })),
  );
}
