import { describe, expect, it } from "vitest";

import { createEvaluationSchema } from "./schema";

const shared = {
  brandProfileId: null,
  language: "en" as const,
  projectName: "Research project",
  targetLabel: "Landing page",
};

describe("createEvaluationSchema", () => {
  it("accepts a public HTTPS URL", () => {
    const result = createEvaluationSchema.safeParse({ ...shared, inputType: "URL", url: "https://example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts Simplified Chinese as the content language", () => {
    const result = createEvaluationSchema.safeParse({ ...shared, language: "zh", inputType: "URL", url: "https://example.com/zh" });
    expect(result.success).toBe(true);
  });

  it("accepts AI generation context without requiring it for normal pages", () => {
    const result = createEvaluationSchema.parse({ ...shared, aiGenerated: true, aiGenerator: "v0", originalPrompt: "Create a measured landing page", inputType: "URL", url: "https://example.com" });
    expect(result.aiGenerated).toBe(true);
    expect(createEvaluationSchema.parse({ ...shared, inputType: "URL", url: "https://example.com" }).aiGenerated).toBe(false);
  });

  it("rejects a private URL", () => {
    const result = createEvaluationSchema.safeParse({ ...shared, inputType: "URL", url: "http://127.0.0.1/admin" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("PRIVATE_HOST");
  });

  it("accepts pasted code and rejects payloads above one MiB", () => {
    expect(
      createEvaluationSchema.safeParse({ ...shared, inputType: "HTML", html: "<!doctype html><html lang=\"en\"></html>" }).success,
    ).toBe(true);

    const oversized = createEvaluationSchema.safeParse({
      ...shared,
      inputType: "HTML",
      html: "x".repeat(1_048_577),
    });
    expect(oversized.success).toBe(false);
    if (!oversized.success) expect(oversized.error.issues[0]?.message).toBe("CONTENT_TOO_LARGE");
  });
});
