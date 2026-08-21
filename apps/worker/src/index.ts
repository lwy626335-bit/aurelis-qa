import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

import { claimJob, failJob } from "./queue.js";
import { database } from "@aurelis/database/client";
import { runBrandEvaluation } from "./brand.js";
import { runTechnicalEvaluation } from "./technical.js";

export const workerCapabilities = [
  { id: "lighthouse", phase: 3, status: "ready" },
  { id: "html-validator", phase: 3, status: "ready" },
  { id: "accessibility", phase: 3, status: "ready" },
  { id: "brand-ai", phase: 4, status: process.env.OPENAI_API_KEY ? "ready" : "unavailable" },
] as const;

export async function processOne(workerId = `worker-${randomUUID()}`) {
  const job = await claimJob(workerId);
  if (!job) return false;
  try {
    await runTechnicalEvaluation(job);
    try {
      await runBrandEvaluation(job.evaluationId);
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 500) : "AI_EVALUATION_UNAVAILABLE";
      await database.evaluation.update({ where: { id: job.evaluationId }, data: { failureCode: "AI_EVALUATION_UNAVAILABLE", failureMessage: message, status: "PARTIAL" } });
    }
    await database.evaluationJob.update({ where: { id: job.id }, data: { lastError: null, leaseExpiresAt: null, lockedBy: null, stage: "completed", status: "COMPLETED" } });
  } catch (error) {
    await failJob(job, error);
  }
  return true;
}

async function main() {
  console.info(JSON.stringify({ capabilities: workerCapabilities, status: "ready" }));
  if (process.env.WORKER_ONCE === "true") {
    await processOne();
    return;
  }
  for (;;) {
    const processed = await processOne();
    await new Promise((resolve) => setTimeout(resolve, processed ? 250 : 2_000));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
