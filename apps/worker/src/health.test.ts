import type { AddressInfo } from "node:net";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { queryRaw } = vi.hoisted(() => ({ queryRaw: vi.fn() }));

vi.mock("@aurelis/database/client", () => ({ database: { $queryRaw: queryRaw } }));

import { startHealthServer } from "./health.js";

beforeEach(() => {
  vi.stubEnv("WORKER_HEALTH_TOKEN", "a-long-worker-token");
  queryRaw.mockResolvedValue([{ value: 1 }]);
});

afterEach(() => {
  vi.unstubAllEnvs();
  queryRaw.mockReset();
});

describe("worker health server", () => {
  it("requires the shared token and verifies database reachability", async () => {
    const server = await startHealthServer(0);
    const { port } = server.address() as AddressInfo;
    try {
      const unauthorized = await fetch(`http://127.0.0.1:${port}/health`);
      expect(unauthorized.status).toBe(401);

      const ready = await fetch(`http://127.0.0.1:${port}/health`, {
        headers: { authorization: "Bearer a-long-worker-token" },
      });
      expect(ready.status).toBe(200);
      await expect(ready.json()).resolves.toEqual({ status: "ready" });
      expect(queryRaw).toHaveBeenCalledOnce();
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it("reports unavailable when the database check fails", async () => {
    queryRaw.mockRejectedValue(new Error("database unavailable"));
    const server = await startHealthServer(0);
    const { port } = server.address() as AddressInfo;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`, {
        headers: { authorization: "Bearer a-long-worker-token" },
      });
      expect(response.status).toBe(503);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
