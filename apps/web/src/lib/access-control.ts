import { createHash, timingSafeEqual } from "node:crypto";

const DEFAULT_USERNAME = "aurelis";
const MINIMUM_SECRET_LENGTH = 16;

function secureEqual(actual: string, expected: string) {
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

function productionProtectionRequired() {
  const localBypass = !process.env.VERCEL && process.env.AURELIS_ALLOW_INSECURE_LOCAL === "true";
  return process.env.NODE_ENV === "production" && !localBypass;
}

function configuration() {
  const password = process.env.APP_ACCESS_PASSWORD?.trim() ?? "";
  return {
    enabled: productionProtectionRequired() || Boolean(password),
    password,
    username: process.env.APP_ACCESS_USERNAME?.trim() || DEFAULT_USERNAME,
  };
}

function basicCredentials(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;
    return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
  } catch {
    return null;
  }
}

function isApiRequest(request: Request) {
  return new URL(request.url).pathname.startsWith("/api/");
}

function jsonError(code: string, status: number, headers?: HeadersInit) {
  return Response.json({ code }, { status, headers });
}

function sameOriginMutation(request: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    const host = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim()
      || request.headers.get("host")
      || requestUrl.host;
    const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
      || requestUrl.protocol.slice(0, -1);
    return originUrl.host === host && originUrl.protocol === `${protocol}:`;
  } catch {
    return false;
  }
}

export function authorizeRequest(request: Request) {
  const { enabled, password, username } = configuration();
  if (!enabled) return null;

  if (password.length < MINIMUM_SECRET_LENGTH) {
    return isApiRequest(request)
      ? jsonError("ACCESS_CONTROL_NOT_CONFIGURED", 503)
      : new Response("Access control is not configured.", { status: 503 });
  }

  const credentials = basicCredentials(request);
  if (!credentials || !secureEqual(credentials.username, username) || !secureEqual(credentials.password, password)) {
    const headers = { "WWW-Authenticate": 'Basic realm="AURELIS QA", charset="UTF-8"' };
    return isApiRequest(request)
      ? jsonError("UNAUTHORIZED", 401, headers)
      : new Response("Authentication required.", { status: 401, headers });
  }

  if (!sameOriginMutation(request)) {
    return isApiRequest(request)
      ? jsonError("ORIGIN_NOT_ALLOWED", 403)
      : new Response("Origin not allowed.", { status: 403 });
  }

  return null;
}
