import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));

vi.mock("@aurelis/database/client", () => ({
  database: { $queryRaw: queryRaw },
}));

import { withinRateLimit } from "./rate-limit";

beforeEach(() => { queryRaw.mockReset(); });

describe("withinRateLimit", () => {
  it("allows requests within the configured limit", async () => {
    queryRaw.mockResolvedValue([{ requestCount: 2 }]);
    await expect(withinRateLimit(new Request("https://aurelis.example/api/evaluations"), "evaluations", 3)).resolves.toBe(true);
  });

  it("fails closed when the database is unavailable", async () => {
    queryRaw.mockImplementation(() => { throw new Error("offline"); });
    await expect(withinRateLimit(new Request("https://aurelis.example/api/evaluations"), "evaluations", 3)).resolves.toBe(false);
  });

  it("uses the trusted proxy address instead of a caller-controlled authorization value", async () => {
    queryRaw.mockResolvedValue([{ requestCount: 1 }]);
    const headers = { authorization: "Bearer rotating", "x-forwarded-for": "198.51.100.8, 203.0.113.9" };
    await withinRateLimit(new Request("https://aurelis.example/api/evaluations", { headers }), "evaluations", 3);
    expect(queryRaw.mock.calls[0]?.[1]).toMatch(/^evaluations:/);
    expect(queryRaw.mock.calls[0]?.[1]).not.toContain("rotating");
  });
});
