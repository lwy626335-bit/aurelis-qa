import { afterEach, describe, expect, it, vi } from "vitest";

import { authorizeRequest } from "./access-control";

function request(path = "/api/evaluations", init?: RequestInit) {
  return new Request(`https://aurelis.example${path}`, init);
}

function authorization(username = "aurelis", password = "a-long-access-password") {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

afterEach(() => vi.unstubAllEnvs());

describe("authorizeRequest", () => {
  it("keeps local development open when no password is configured", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(authorizeRequest(request())).toBeNull();
  });

  it("fails closed in production when the password is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = authorizeRequest(request());
    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toEqual({ code: "ACCESS_CONTROL_NOT_CONFIGURED" });
  });

  it("accepts valid basic credentials", () => {
    vi.stubEnv("APP_ACCESS_PASSWORD", "a-long-access-password");
    const response = authorizeRequest(request("/api/evaluations", { headers: { authorization: authorization() } }));
    expect(response).toBeNull();
  });

  it("rejects invalid credentials", () => {
    vi.stubEnv("APP_ACCESS_PASSWORD", "a-long-access-password");
    const response = authorizeRequest(request());
    expect(response?.status).toBe(401);
    expect(response?.headers.get("www-authenticate")).toContain("Basic");
  });

  it("rejects authenticated cross-origin mutations", () => {
    vi.stubEnv("APP_ACCESS_PASSWORD", "a-long-access-password");
    const response = authorizeRequest(request("/api/evaluations", {
      method: "POST",
      headers: { authorization: authorization(), origin: "https://attacker.example" },
    }));
    expect(response?.status).toBe(403);
  });

  it("accepts authenticated same-origin mutations", () => {
    vi.stubEnv("APP_ACCESS_PASSWORD", "a-long-access-password");
    const response = authorizeRequest(request("/api/evaluations", {
      method: "POST",
      headers: { authorization: authorization(), origin: "https://aurelis.example" },
    }));
    expect(response).toBeNull();
  });
});
