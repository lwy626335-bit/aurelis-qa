import { lookup } from "node:dns/promises";

import { afterEach, describe, expect, it, vi } from "vitest";

import { assertPublicHost } from "./technical.js";

vi.mock("node:dns/promises", () => ({ lookup: vi.fn() }));

afterEach(() => { vi.mocked(lookup).mockReset(); });

describe("assertPublicHost", () => {
  it("returns a public address for a pinned connection", async () => {
    vi.mocked(lookup).mockResolvedValue([{ address: "93.184.216.34", family: 4 }] as never);
    await expect(assertPublicHost(new URL("https://example.com"))).resolves.toBe("93.184.216.34");
  });

  it("rejects a hostname if any resolved address is private", async () => {
    vi.mocked(lookup).mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
      { address: "127.0.0.1", family: 4 },
    ] as never);
    await expect(assertPublicHost(new URL("https://example.com"))).rejects.toThrow("PRIVATE_ADDRESS_RESOLVED");
  });
});
