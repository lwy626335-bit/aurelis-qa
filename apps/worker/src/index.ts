import { randomUUID } from "node:crypto";

import { claimJob, failJob } from "./queue.js";
import { database } from "@aurelis/database/client";
import { runBrandEvaluation } from "./brand.js";
import { runTechnicalEvaluation } from "./technical.js";
import { runWebVisualEvaluation } from "./web-visual.js";

export const workerCapabilities = [
  { id: "lighthouse", phase: 3, status: "ready" },
  { id: "html-validator", phase: 3, status: "ready" },
  { id: "accessibility", phase: 3, status: "ready" },
  { id: "brand-ai", phase: 4, status: process.env.OPENAI_API_KEY ? "ready" : "unavailable" },
  { id: "visual-ai", phase: 4, status: process.env.OPENAI_API_KEY ? "ready" : "unavailable" },
] as const;

export async function processOne(workerId = `worker-${randomUUID()}`) {
  const job = await claimJob(workerId);
  if (!job) return false;
  try {
    await runTechnicalEvaluation(job);
    await database.evaluationJob.update({ where: { id: job.id }, data: { stage: "visual" } });
    let visualFailed = false;
    try {
      await runWebVisualEvaluation(job.evaluationId);
    } catch (error) {
      visualFailed = true;
      const message = error instanceof Error ? error.message.slice(0, 500) : "AI_VISUAL_UNAVAILABLE";
      await database.evaluation.update({ where: { id: job.evaluationId }, data: { failureCode: "AI_VISUAL_UNAVAILABLE", failureMessage: message, status: "RUNNING" } });
    }
    await database.evaluationJob.update({ where: { id: job.id }, data: { stage: "brand" } });
    try {
      const brandScore = await runBrandEvaluation(job.evaluationId);
      if (brandScore === null) {
        await database.evaluation.updateMany({ where: { id: job.evaluationId, status: "RUNNING" }, data: { completedAt: new Date(), status: visualFailed ? "PARTIAL" : "COMPLETED" } });
      }
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
