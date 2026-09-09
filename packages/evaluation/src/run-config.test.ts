import { describe, expect, it } from "vitest";

import { defaultEvaluationRunConfig, defaultOverallWeights, rubricOverallWeights } from "./run-config";

describe("immutable evaluation run configuration", () => {
  it("captures configured model ids", () => {
    const config = defaultEvaluationRunConfig({
      OPENAI_EVALUATION_MODEL: "brand-model",
      OPENAI_VISION_EVALUATION_MODEL: "vision-model",
    } as NodeJS.ProcessEnv);
    expect(config.brand.modelId).toBe("brand-model");
    expect(config.visual.modelId).toBe("vision-model");
  });

  it("uses valid component rubric weights", () => {
    expect(rubricOverallWeights([
      { key: "technical", weight: 0.4 },
      { key: "visual", weight: 0.2 },
      { key: "brand", weight: 0.4 },
    ])).toEqual({ brand: 0.4, technical: 0.4, visual: 0.2 });
  });

  it("falls back for legacy rubrics that do not describe component weights", () => {
    expect(rubricOverallWeights([{ key: "performance", weight: 1 }])).toEqual(defaultOverallWeights);
  });
});
