import { randomUUID } from "node:crypto";

import { assertJobActive, claimJob, completeJob, failJob, finishCancellationIfRequested, renewLease, updateJobStage } from "./queue.js";
import { database } from "@aurelis/database/client";
import { markWorkerLoop } from "./health.js";
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
  let heartbeatError: unknown = null;
  const heartbeat = setInterval(() => {
    markWorkerLoop();
    void renewLease(job)
      .then((renewed) => { if (!renewed) heartbeatError = new Error("JOB_LEASE_LOST"); })
      .catch((error: unknown) => { heartbeatError = error; });
  }, 30_000);
  heartbeat.unref();

  const checkpoint = async () => {
    if (heartbeatError) throw heartbeatError;
    await assertJobActive(job);
  };

  try {
    await database.evaluation.updateMany({ where: { id: job.evaluationId, status: "QUEUED" }, data: { startedAt: new Date(), status: "RUNNING" } });
    await checkpoint();
    await runTechnicalEvaluation(job);
    await checkpoint();
    await updateJobStage(job, "visual");
    let visualFailed = false;
    try {
      await runWebVisualEvaluation(job);
    } catch (error) {
      if (error instanceof Error && ["JOB_CANCELLED", "JOB_LEASE_LOST"].includes(error.message)) throw error;
      await checkpoint();
      visualFailed = true;
      const message = error instanceof Error ? error.message.slice(0, 500) : "AI_VISUAL_UNAVAILABLE";
      await database.evaluation.update({ where: { id: job.evaluationId }, data: { failureCode: "AI_VISUAL_UNAVAILABLE", failureMessage: message, status: "RUNNING" } });
    }
    await checkpoint();
    await updateJobStage(job, "brand");
    try {
      const brandScore = await runBrandEvaluation(job);
      if (brandScore === null) {
        await database.evaluation.updateMany({ where: { id: job.evaluationId, status: "RUNNING" }, data: { completedAt: new Date(), status: visualFailed ? "PARTIAL" : "COMPLETED" } });
      }
    } catch (error) {
      if (error instanceof Error && ["JOB_CANCELLED", "JOB_LEASE_LOST"].includes(error.message)) throw error;
      await checkpoint();
      const message = error instanceof Error ? error.message.slice(0, 500) : "AI_EVALUATION_UNAVAILABLE";
      await database.evaluation.update({ where: { id: job.evaluationId }, data: { failureCode: "AI_EVALUATION_UNAVAILABLE", failureMessage: message, status: "PARTIAL" } });
    }
    await checkpoint();
    await completeJob(job);
  } catch (error) {
    if (!(await finishCancellationIfRequested(job))) {
      if (!(error instanceof Error && error.message === "JOB_LEASE_LOST")) await failJob(job, error);
    }
  } finally {
    clearInterval(heartbeat);
  }
  return true;
}
