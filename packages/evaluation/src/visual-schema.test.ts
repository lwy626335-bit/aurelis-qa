import { describe, expect, it } from "vitest";

import { calculateVisualScore, enforceAiAssessmentScope, logoDimensionWeights, logoEvaluationOutputSchema } from "./visual-schema";

const dimensions = Object.keys(logoDimensionWeights).map((key) => ({ key, observation: `${key} finding`, score: 80 }));

describe("visual evaluation schema", () => {
  it("accepts one finding per required dimension and calculates the weighted score", () => {
    const result = logoEvaluationOutputSchema.parse({
      aiAssessment: { applies: false, artifactRisk: 0, consistencyRisk: 0, genericness: 0, refinementNeed: 0, riskLevel: "not_applicable", summary: "Not assessed as AI-generated." },
      dimensions,
      recommendations: [
        { action: "Action 1", priority: "high", title: "First" },
        { action: "Action 2", priority: "medium", title: "Second" },
        { action: "Action 3", priority: "low", title: "Third" },
      ],
      summary: "A concise evaluation.",
    });

    expect(calculateVisualScore(result.dimensions, logoDimensionWeights)).toBe(80);
  });

  it("rejects duplicate dimensions", () => {
    expect(() => logoEvaluationOutputSchema.parse({
      aiAssessment: { applies: false, artifactRisk: 0, consistencyRisk: 0, genericness: 0, refinementNeed: 0, riskLevel: "not_applicable", summary: "Not applicable." },
      dimensions: dimensions.map((item) => ({ ...item, key: "distinctiveness" })),
      recommendations: [
        { action: "Action 1", priority: "high", title: "First" },
        { action: "Action 2", priority: "medium", title: "Second" },
        { action: "Action 3", priority: "low", title: "Third" },
      ],
      summary: "A concise evaluation.",
    })).toThrow("MISSING_DIMENSION");
  });

  it("prevents AI-only risk fields from being attached to non-AI work", () => {
    const output = logoEvaluationOutputSchema.parse({
      aiAssessment: { applies: true, artifactRisk: 81, consistencyRisk: 62, genericness: 73, refinementNeed: 55, riskLevel: "high", summary: "Model supplied an out-of-scope assessment." },
      dimensions,
      recommendations: [
        { action: "Action 1", priority: "high", title: "First" },
        { action: "Action 2", priority: "medium", title: "Second" },
        { action: "Action 3", priority: "low", title: "Third" },
      ],
      summary: "A concise evaluation.",
    });

    expect(enforceAiAssessmentScope(output, false).aiAssessment).toMatchObject({
      applies: false,
      artifactRisk: 0,
      consistencyRisk: 0,
      genericness: 0,
      refinementNeed: 0,
      riskLevel: "not_applicable",
    });
  });

  it("rejects a missing AI-specific assessment for declared AI work", () => {
    const output = logoEvaluationOutputSchema.parse({
      aiAssessment: { applies: false, artifactRisk: 0, consistencyRisk: 0, genericness: 0, refinementNeed: 0, riskLevel: "not_applicable", summary: "Not assessed." },
      dimensions,
      recommendations: [
        { action: "Action 1", priority: "high", title: "First" },
        { action: "Action 2", priority: "medium", title: "Second" },
        { action: "Action 3", priority: "low", title: "Third" },
      ],
      summary: "A concise evaluation.",
    });

    expect(() => enforceAiAssessmentScope(output, true)).toThrow("AI_ASSESSMENT_SCOPE_MISMATCH");
  });
});
