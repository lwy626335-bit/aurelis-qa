import { validateEvaluationUrl } from "@aurelis/evaluation";
import { z } from "zod";

const sharedFields = {
  projectName: z.string().trim().min(2).max(100),
  targetLabel: z.string().trim().min(2).max(120),
  language: z.enum(["en", "ja"]),
};

const urlInput = z
  .object({
    ...sharedFields,
    inputType: z.literal("URL"),
    url: z.string().trim().max(2048),
  })
  .superRefine((input, context) => {
    const result = validateEvaluationUrl(input.url);
    if (!result.ok) {
      context.addIssue({ code: "custom", message: result.code, path: ["url"] });
    }
  });

const codeInput = z
  .object({
    ...sharedFields,
    inputType: z.literal("HTML"),
    html: z.string().min(1),
    css: z.string().default(""),
    javascript: z.string().default(""),
  })
  .superRefine((input, context) => {
    const bytes = new TextEncoder().encode(input.html + input.css + input.javascript).byteLength;
    if (bytes > 1_048_576) {
      context.addIssue({ code: "custom", message: "CONTENT_TOO_LARGE", path: ["html"] });
    }
  });

export const createEvaluationSchema = z.discriminatedUnion("inputType", [urlInput, codeInput]);
export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;
