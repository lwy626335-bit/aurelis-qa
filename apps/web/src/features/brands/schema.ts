import { z } from "zod";

const exampleSchema = z.object({ content: z.string().trim().min(1).max(20_000), label: z.string().trim().min(1).max(100) });
const referenceSchema = z.object({ content: z.string().trim().min(1).max(100_000), sourceTitle: z.string().trim().min(1).max(200), sourceUrl: z.string().url().max(2048).nullable() });

export const createBrandSchema = z.object({
  description: z.string().trim().min(20).max(2_000),
  examples: z.array(exampleSchema).max(10),
  forbiddenVocabulary: z.array(z.string().trim().min(1).max(80)).max(100),
  language: z.enum(["en", "ja"]),
  name: z.string().trim().min(2).max(100),
  personalities: z.array(z.string().trim().min(1).max(50)).min(1).max(10),
  preferredVocabulary: z.array(z.string().trim().min(1).max(80)).max(100),
  projectName: z.string().trim().min(2).max(100),
  references: z.array(referenceSchema).max(20),
  targetAudience: z.string().trim().min(10).max(1_000),
}).superRefine((input, context) => {
  const segmenter = new Intl.Segmenter(input.language, { granularity: "word" });
  const corpus = [...input.examples, ...input.references].map((item) => item.content).join(" ");
  const words = [...segmenter.segment(corpus)].filter((part) => part.isWordLike).length;
  if (input.examples.length < 3 && words < 300) context.addIssue({ code: "custom", message: "REFERENCE_CORPUS_INSUFFICIENT", path: ["examples"] });
});

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
