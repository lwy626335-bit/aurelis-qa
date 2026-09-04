const MINIMUM_TOKEN_LENGTH = 16;

function productionServicesRequired() {
  const localBypass = !process.env.VERCEL && process.env.AURELIS_ALLOW_INSECURE_LOCAL === "true";
  return process.env.NODE_ENV === "production" && !localBypass;
}

export async function workerAvailable() {
  const configuredUrl = process.env.WORKER_HEALTH_URL?.trim();
  const token = process.env.WORKER_HEALTH_TOKEN?.trim() ?? "";

  if (!configuredUrl || token.length < MINIMUM_TOKEN_LENGTH) return !productionServicesRequired();

  try {
    const healthUrl = new URL("/health", configuredUrl);
    const response = await fetch(healthUrl, {
      cache: "no-store",
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3_000),
    });
    if (!response.ok) return false;
    const payload = await response.json() as { status?: string };
    return payload.status === "ready";
  } catch {
    return false;
  }
}
