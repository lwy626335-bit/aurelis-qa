import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.hoisted(() => vi.fn());
vi.mock("@aurelis/database/client", () => ({ database: { $queryRaw: queryRaw } }));

import { withinRateLimit } from "./rate-limit";

beforeEach(() => queryRaw.mockReset());

describe("distributed rate limit", () => {
  it("accepts counts through the configured limit", async () => {
    queryRaw.mockResolvedValue([{ requestCount: 3 }]);
    await expect(withinRateLimit(new Request("https://aurelis.example/api/evaluations"), "evaluation", 3)).resolves.toBe(true);
  });

  it("fails closed when the limit store is unavailable", async () => {
    queryRaw.mockImplementationOnce(async () => { throw new Error("database unavailable"); });
    await expect(withinRateLimit(new Request("https://aurelis.example/api/evaluations"), "evaluation", 3)).resolves.toBe(false);
  });

  it("does not let callers rotate authorization headers to evade an edge IP limit", async () => {
    queryRaw.mockResolvedValue([{ requestCount: 1 }]);
    for (const authorization of ["Bearer first", "Bearer second"]) {
      await withinRateLimit(new Request("https://aurelis.example/api/evaluations", { headers: { authorization, "x-forwarded-for": "spoofed, 203.0.113.8" } }), "evaluation", 3);
    }
    expect(queryRaw.mock.calls[0]?.[1]).toBe(queryRaw.mock.calls[1]?.[1]);
  });
});
