import { describe, expect, it } from "vitest";

import { brandEvaluationOutputSchema } from "./brand-schema.js";

describe("brandEvaluationOutputSchema", () => {
  const valid = {
    schemaVersion: "brand-evaluation-v1",
    dimensions: [
      {
        dimensionKey: "tone-consistency",
        score: 18,
        maxScore: 20,
        observation: "The copy uses measured, professional language.",
        reason: "This matches the supplied brand profile.",
        recommendation: "Qualify two absolute claims.",
        evidence: [{ excerpt: "Measured outcomes", sourceId: "reference-1", strength: "strong" }],
        insufficientEvidence: false,
      },
    ],
    evaluatorNotes: [],
  };

  it("accepts evidence-linked structured output", () => {
    expect(brandEvaluationOutputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a dimension without evidence", () => {
    const invalid = structuredClone(valid);
    invalid.dimensions[0]!.evidence = [];
    expect(brandEvaluationOutputSchema.safeParse(invalid).success).toBe(false);
  });
});
