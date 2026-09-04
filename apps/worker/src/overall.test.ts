import { describe, expect, it } from "vitest";

import { websiteOverallScore } from "./overall.js";

describe("website overall score", () => {
  it("keeps one comparable score as visual and brand evidence become available", () => {
    expect(websiteOverallScore({ brand: null, technical: 80, visual: 90 })).toBe(84);
    expect(websiteOverallScore({ brand: 70, technical: 80, visual: 90 })).toBe(81);
    expect(websiteOverallScore({ brand: null, technical: 80, visual: null })).toBeNull();
  });
});
