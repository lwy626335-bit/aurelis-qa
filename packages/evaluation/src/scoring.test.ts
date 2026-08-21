import { describe, expect, it } from "vitest";

import { calculateReliability, calculateWeightedScore } from "./scoring.js";

describe("calculateWeightedScore", () => {
  it("normalizes dimensions and calculates a deterministic weighted score", () => {
    expect(
      calculateWeightedScore([
        { key: "technical", score: 91, maxScore: 100, weight: 0.65 },
        { key: "brand", score: 82, maxScore: 100, weight: 0.35 },
      ]),
    ).toBe(87.9);
  });

  it("rejects weight sets that do not total one", () => {
    expect(() => calculateWeightedScore([{ key: "technical", score: 91, maxScore: 100, weight: 0.9 }])).toThrow(/total 1/);
  });
});
describe("calculateReliability", () => {
  it("uses application-owned reliability weights", () => {
    expect(
      calculateReliability({
        evidenceCompleteness: 96,
        evidenceStrength: 92,
        evaluatorReviewerAgreement: 94,
        reproducibility: 93,
      }),
    ).toBe(94);
  });
});
