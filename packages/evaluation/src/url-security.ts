import { isIP } from "node:net";

export type UrlValidationResult =
  | { ok: true; url: URL }
  | { ok: false; code: "INVALID_URL" | "UNSAFE_PROTOCOL" | "CREDENTIALS_NOT_ALLOWED" | "PRIVATE_HOST"; message: string };

const blockedHostnames = new Set(["localhost", "localhost.localdomain", "metadata.google.internal"]);

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b] = parts as [number, number, number, number];
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
}

export function validateEvaluationUrl(value: string): UrlValidationResult {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { ok: false, code: "INVALID_URL", message: "Enter a complete, valid URL." };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, code: "UNSAFE_PROTOCOL", message: "Only HTTP and HTTPS URLs can be evaluated." };
  }

  if (url.username || url.password) {
    return { ok: false, code: "CREDENTIALS_NOT_ALLOWED", message: "Credentials must not be embedded in evaluation URLs." };
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  const privateHost =
    blockedHostnames.has(hostname) ||
    hostname.endsWith(".localhost") ||
    isPrivateIpv4(hostname) ||
    isPrivateIpv6(hostname) ||
    (isIP(hostname) > 0 && (hostname === "0.0.0.0" || hostname === "255.255.255.255"));

  if (privateHost) {
    return { ok: false, code: "PRIVATE_HOST", message: "Private, loopback, and metadata endpoints cannot be evaluated." };
  }

  return { ok: true, url };
}

// Phase 3 workers must resolve DNS, validate every resolved address, and repeat
// validation after each redirect. String validation alone cannot prevent DNS rebinding.
