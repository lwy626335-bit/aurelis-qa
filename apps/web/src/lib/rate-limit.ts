import { createHash } from "node:crypto";

import { database } from "@aurelis/database/client";

function clientKey(request: Request, scope: string) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  const identity = forwardedFor || request.headers.get("authorization") || "anonymous";
  return `${scope}:${createHash("sha256").update(identity).digest("hex")}`;
}

export async function withinRateLimit(request: Request, scope: string, limit: number, windowMs = 3_600_000) {
  const key = clientKey(request, scope);
  const cutoff = new Date(Date.now() - windowMs);
  try {
    const rows = await database.$queryRaw<{ requestCount: number }[]>`
      INSERT INTO "RateLimitBucket" ("key", "windowStartedAt", "requestCount", "updatedAt")
      VALUES (${key}, NOW(), 1, NOW())
      ON CONFLICT ("key") DO UPDATE SET
        "windowStartedAt" = CASE WHEN "RateLimitBucket"."windowStartedAt" < ${cutoff} THEN NOW() ELSE "RateLimitBucket"."windowStartedAt" END,
        "requestCount" = CASE WHEN "RateLimitBucket"."windowStartedAt" < ${cutoff} THEN 1 ELSE "RateLimitBucket"."requestCount" + 1 END,
        "updatedAt" = NOW()
      RETURNING "requestCount"
    `;
    return (rows[0]?.requestCount ?? limit + 1) <= limit;
  } catch {
    return false;
  }
}

export function rateLimitResponse(retryAfter = 3600) {
  return Response.json(
    { code: "RATE_LIMITED" },
    { status: 429, headers: { "retry-after": String(retryAfter) } },
  );
}
