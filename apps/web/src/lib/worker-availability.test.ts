import { afterEach, describe, expect, it, vi } from "vitest";

import { workerAvailable } from "./worker-availability";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("workerAvailable", () => {
  it("allows the local development queue without a remote health endpoint", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(workerAvailable()).resolves.toBe(true);
  });

  it("fails closed in production when the worker is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(workerAvailable()).resolves.toBe(false);
  });

  it("requires an authenticated ready response", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("WORKER_HEALTH_URL", "https://worker.example");
    vi.stubEnv("WORKER_HEALTH_TOKEN", "a-long-worker-token");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ status: "ready" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(workerAvailable()).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(new URL("https://worker.example/health"), expect.objectContaining({
      headers: { authorization: "Bearer a-long-worker-token" },
    }));
  });

  it("rejects an unhealthy worker", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("WORKER_HEALTH_URL", "https://worker.example");
    vi.stubEnv("WORKER_HEALTH_TOKEN", "a-long-worker-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "starting" })));
    await expect(workerAvailable()).resolves.toBe(false);
  });
});

