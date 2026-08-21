import { z } from "zod";

const evidenceStrength = z.enum(["strong", "moderate", "weak", "insufficient"]);

export const brandDimensionResultSchema = z
  .object({
    dimensionKey: z.string().min(1),
    score: z.number().nonnegative(),
    maxScore: z.number().positive(),
    observation: z.string().min(1),
    reason: z.string().min(1),
    recommendation: z.string().min(1),
    evidence: z.array(
      z.object({
        excerpt: z.string().min(1),
        sourceId: z.string().min(1),
        strength: evidenceStrength,
      }),
    ),
    insufficientEvidence: z.boolean(),
  })
  .superRefine((dimension, context) => {
    if (!dimension.insufficientEvidence && dimension.evidence.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["evidence"],
        message: "A scored judgment requires at least one evidence item.",
      });
    }
  });

export const brandEvaluationOutputSchema = z.object({
  schemaVersion: z.literal("brand-evaluation-v1"),
  dimensions: z.array(brandDimensionResultSchema).min(1),
  evaluatorNotes: z.array(z.string()),
});

export type BrandEvaluationOutput = z.infer<typeof brandEvaluationOutputSchema>;
