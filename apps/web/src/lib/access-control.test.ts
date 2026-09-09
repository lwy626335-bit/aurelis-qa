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
  it("accepts the production origin forwarded through the Railway proxy", () => {
    vi.stubEnv("APP_PUBLIC_ACCESS", "true");
    expect(authorizeRequest(new Request("https://web-production-5d1eb.up.railway.app/", {
      method: "POST", headers: { origin: "https://aurelis-qa-web.vercel.app" },
    }))).toBeNull();
  });
  it("allows same-origin locale actions in public mode", () => {
    vi.stubEnv("APP_PUBLIC_ACCESS", "true");
    expect(authorizeRequest(request("/dashboard/logo", {
      method: "POST", headers: { origin: "https://aurelis.example" },
    }))).toBeNull();
  });
  it("keeps local development open when no password is configured", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(authorizeRequest(request())).toBeNull();
  });

  it("allows anonymous access when public access is enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_PUBLIC_ACCESS", "true");
    expect(authorizeRequest(request())).toBeNull();
  });

  it("rejects cross-origin mutations when public access is enabled", () => {
    vi.stubEnv("APP_PUBLIC_ACCESS", "true");
    const response = authorizeRequest(request("/api/evaluations", {
      method: "POST",
      headers: { origin: "https://attacker.example" },
    }));
    expect(response?.status).toBe(403);
  });

  it("blocks destructive and paid follow-up operations in public mode", () => {
    vi.stubEnv("APP_PUBLIC_ACCESS", "true");
    expect(authorizeRequest(request("/api/evaluations/example", { method: "DELETE" }))?.status).toBe(403);
    expect(authorizeRequest(request("/api/evaluations/example/rewrite", { method: "POST" }))?.status).toBe(403);
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

  it("accepts a scoped service token only for evaluation submission", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AURELIS_API_TOKEN", "a-long-service-token-value");
    expect(authorizeRequest(request("/api/evaluations", { method: "POST", headers: { authorization: "Bearer a-long-service-token-value" } }))).toBeNull();
    expect(authorizeRequest(request("/api/brands", { method: "POST", headers: { authorization: "Bearer a-long-service-token-value" } }))?.status).toBe(503);
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
