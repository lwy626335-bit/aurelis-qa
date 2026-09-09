import { beforeEach, describe, expect, it, vi } from "vitest";

const lookup = vi.hoisted(() => vi.fn());
vi.mock("node:dns/promises", () => ({ lookup }));

import { assertPublicHost } from "./technical.js";

beforeEach(() => lookup.mockReset());

describe("remote target resolution", () => {
  it("returns a public address but rejects any private result", async () => {
    lookup.mockResolvedValueOnce([{ address: "93.184.216.34", family: 4 }]);
    await expect(assertPublicHost(new URL("https://example.com"))).resolves.toEqual({ address: "93.184.216.34", family: 4 });

    lookup.mockResolvedValueOnce([{ address: "93.184.216.34", family: 4 }, { address: "10.0.0.1", family: 4 }]);
    await expect(assertPublicHost(new URL("https://example.com"))).rejects.toThrow("PRIVATE_ADDRESS_RESOLVED");
  });
});
