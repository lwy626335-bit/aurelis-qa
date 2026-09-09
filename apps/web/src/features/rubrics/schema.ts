import { z } from "zod";

export const createRubricSchema = z.object({
  description: z.string().trim().max(1_000).nullable(),
  dimensions: z.array(z.object({ key: z.enum(["technical", "visual", "brand"]), label: z.string().trim().min(1).max(100), maxScore: z.literal(100), weight: z.number().nonnegative().max(1) })).min(1).max(3),
  name: z.string().trim().min(2).max(100),
  version: z.string().trim().regex(/^[a-z0-9][a-z0-9._-]{2,79}$/i),
}).superRefine((input, context) => {
  const total = input.dimensions.reduce((sum, item) => sum + item.weight, 0);
  if (Math.abs(total - 1) > 0.000001) context.addIssue({ code: "custom", message: "WEIGHTS_MUST_TOTAL_ONE", path: ["dimensions"] });
  if (!input.dimensions.some((item) => item.key === "technical" && item.weight > 0)) context.addIssue({ code: "custom", message: "TECHNICAL_WEIGHT_REQUIRED", path: ["dimensions"] });
  if (new Set(input.dimensions.map((item) => item.key)).size !== input.dimensions.length) context.addIssue({ code: "custom", message: "DUPLICATE_DIMENSION", path: ["dimensions"] });
});
