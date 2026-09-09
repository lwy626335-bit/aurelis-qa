import { describe, expect, it } from "vitest";

import { createRubricSchema } from "./schema";

describe("component rubric input", () => {
  it("accepts one complete technical, visual, and brand weight set", () => {
    expect(createRubricSchema.safeParse({
      description: null,
      dimensions: [
        { key: "technical", label: "Technical", maxScore: 100, weight: 0.5 },
        { key: "visual", label: "Visual", maxScore: 100, weight: 0.3 },
        { key: "brand", label: "Brand", maxScore: 100, weight: 0.2 },
      ],
      name: "Research rubric",
      version: "research-v1.0",
    }).success).toBe(true);
  });

  it("rejects unsupported or duplicate dimensions", () => {
    expect(createRubricSchema.safeParse({
      description: null,
      dimensions: [
        { key: "technical", label: "Technical", maxScore: 100, weight: 0.5 },
        { key: "technical", label: "Duplicate", maxScore: 100, weight: 0.5 },
      ],
      name: "Bad rubric",
      version: "bad-v1.0",
    }).success).toBe(false);
  });
});
