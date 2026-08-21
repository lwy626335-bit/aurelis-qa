import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

import { claimJob, failJob } from "./queue.js";
import { runTechnicalEvaluation } from "./technical.js";

export const workerCapabilities = [
  { id: "lighthouse", phase: 3, status: "ready" },
  { id: "html-validator", phase: 3, status: "ready" },
  { id: "accessibility", phase: 3, status: "ready" },
  { id: "brand-ai", phase: 4, status: "not-implemented" },
] as const;

export async function processOne(workerId = `worker-${randomUUID()}`) {
  const job = await claimJob(workerId);
  if (!job) return false;
  try {
    await runTechnicalEvaluation(job);
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
