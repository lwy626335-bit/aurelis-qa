import { describe, expect, it } from "vitest";

import { workerCapabilities } from "./index.js";

describe("worker capability contract", () => {
  it("marks every heavy evaluator as not implemented in Phase 1", () => {
    expect(workerCapabilities).toHaveLength(4);
    expect(workerCapabilities.every((capability) => capability.status === "not-implemented")).toBe(true);
    expect(workerCapabilities.map((capability) => capability.phase)).toEqual([3, 3, 3, 4]);
  });
});
