import { createHash, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

import { database } from "@aurelis/database/client";

const MINIMUM_TOKEN_LENGTH = 16;

function secureEqual(actual: string, expected: string) {
  const actualHash = createHash("sha256").update(actual).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

function healthPort() {
  const port = Number(process.env.PORT ?? 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) throw new Error("WORKER_PORT_INVALID");
  return port;
}

export async function startHealthServer(port = healthPort()) {
  const token = process.env.WORKER_HEALTH_TOKEN?.trim() ?? "";
  const server = createServer(async (request, response) => {
    response.setHeader("cache-control", "no-store");
    response.setHeader("content-type", "application/json; charset=utf-8");

    if (request.method !== "GET" || request.url !== "/health") {
      response.statusCode = 404;
      response.end(JSON.stringify({ status: "not-found" }));
      return;
    }

    const authorization = request.headers.authorization ?? "";
    if (token.length < MINIMUM_TOKEN_LENGTH || !secureEqual(authorization, `Bearer ${token}`)) {
      response.statusCode = token.length < MINIMUM_TOKEN_LENGTH ? 503 : 401;
      response.end(JSON.stringify({ status: "unavailable" }));
      return;
    }

    try {
      await database.$queryRaw`SELECT 1`;
      response.statusCode = 200;
      response.end(JSON.stringify({ status: "ready" }));
    } catch {
      response.statusCode = 503;
      response.end(JSON.stringify({ status: "unavailable" }));
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "0.0.0.0", resolve);
  });
  return server;
}

