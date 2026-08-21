import { describe, expect, it } from "vitest";

import { createBrandSchema } from "./schema";

const base = {
  description: "A measured brand profile used in repeatable research.",
  forbiddenVocabulary: [], language: "en" as const, name: "Example brand", personalities: ["Professional"], preferredVocabulary: [], projectName: "Research", references: [], targetAudience: "Web quality researchers",
};

describe("createBrandSchema", () => {
  it("accepts three examples", () => {
    expect(createBrandSchema.safeParse({ ...base, examples: [1, 2, 3].map((index) => ({ content: `Example copy ${index}`, label: `Example ${index}` })) }).success).toBe(true);
  });

  it("rejects an insufficient corpus", () => {
    const result = createBrandSchema.safeParse({ ...base, examples: [{ content: "One short example", label: "Example" }] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("REFERENCE_CORPUS_INSUFFICIENT");
  });
});
