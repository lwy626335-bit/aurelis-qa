import { describe, expect, it } from "vitest";

import { workerCapabilities } from "./index.js";
import { inspectDocument } from "./technical.js";

describe("worker capability contract", () => {
  it("marks Phase 3 tools ready without pretending the brand evaluator exists", () => {
    expect(workerCapabilities).toHaveLength(4);
    expect(workerCapabilities.map((capability) => capability.status)).toEqual(["ready", "ready", "ready", "not-implemented"]);
    expect(workerCapabilities.map((capability) => capability.phase)).toEqual([3, 3, 3, 4]);
  });

  it("finds deterministic HTML and SEO defects", () => {
    const result = inspectDocument("<html><head><title>x</title></head><body><img><div id='x'></div><div id='x'></div></body></html>");
    expect(result.checks.doctype).toBe(false);
    expect(result.checks.duplicateIds).toEqual(["x"]);
    expect(result.checks.imagesWithoutAlt).toBe(1);
    expect(result.seoScore).toBeLessThan(50);
  });
});
