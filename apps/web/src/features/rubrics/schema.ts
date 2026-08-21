import { z } from "zod";

export const createRubricSchema = z.object({
  description: z.string().trim().max(1_000).nullable(),
  dimensions: z.array(z.object({ key: z.string().trim().min(1).max(80), label: z.string().trim().min(1).max(100), maxScore: z.number().positive().max(1000), weight: z.number().positive().max(1) })).min(1).max(20),
  name: z.string().trim().min(2).max(100),
  version: z.string().trim().regex(/^[a-z0-9][a-z0-9._-]{2,79}$/i),
}).superRefine((input, context) => {
  const total = input.dimensions.reduce((sum, item) => sum + item.weight, 0);
  if (Math.abs(total - 1) > 0.000001) context.addIssue({ code: "custom", message: "WEIGHTS_MUST_TOTAL_ONE", path: ["dimensions"] });
});
