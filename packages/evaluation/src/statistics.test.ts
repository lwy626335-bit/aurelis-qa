import { describe, expect, it } from "vitest";

import { summarizeScores } from "./statistics.js";

describe("summarizeScores", () => {
  it("calculates population research statistics", () => {
    expect(summarizeScores([80, 82, 84])).toEqual({ mean: 82, standardDeviation: 1.63, variance: 2.67 });
  });
  it("rejects an empty run set", () => expect(() => summarizeScores([])).toThrow());
});
