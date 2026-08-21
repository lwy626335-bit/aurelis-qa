import { describe, expect, it } from "vitest";

import { validateEvaluationUrl } from "./url-security.js";

describe("validateEvaluationUrl", () => {
  it.each([
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://10.0.0.8",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]",
  ])("rejects private target %s", (value) => {
    expect(validateEvaluationUrl(value)).toMatchObject({ ok: false, code: "PRIVATE_HOST" });
  });

  it("rejects non-HTTP protocols and embedded credentials", () => {
    expect(validateEvaluationUrl("file:///etc/passwd")).toMatchObject({ ok: false, code: "UNSAFE_PROTOCOL" });
    expect(validateEvaluationUrl("https://user:pass@example.com")).toMatchObject({ ok: false, code: "CREDENTIALS_NOT_ALLOWED" });
  });

  it("accepts a public HTTPS URL", () => {
    const result = validateEvaluationUrl("https://example.com/report");
    expect(result.ok).toBe(true);
  });
});
