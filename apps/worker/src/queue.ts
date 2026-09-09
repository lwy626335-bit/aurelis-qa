import { randomUUID } from "node:crypto";

import { database } from "@aurelis/database/client";

const LEASE_MS = 120_000;

export type ClaimedJob = {
  id: string;
  evaluationId: string;
  attemptCount: number;
  maxAttempts: number;
  leaseToken: string;
};

function leaseDeadline() {
  return new Date(Date.now() + LEASE_MS);
}

export async function claimJob(workerId: string): Promise<ClaimedJob | null> {
  await database.$executeRaw`
    WITH exhausted AS (
      UPDATE "EvaluationJob"
      SET "status" = 'FAILED', "stage" = 'failed', "finishedAt" = NOW(),
          "lastError" = 'JOB_LEASE_EXHAUSTED', "leaseExpiresAt" = NULL,
          "leaseToken" = NULL, "lockedBy" = NULL, "updatedAt" = NOW()
      WHERE "status" = 'RUNNING' AND "leaseExpiresAt" < NOW()
        AND "attemptCount" >= "maxAttempts"
      RETURNING "evaluationId"
    )
    UPDATE "Evaluation"
    SET "status" = 'FAILED', "failureCode" = 'JOB_LEASE_EXHAUSTED',
        "failureMessage" = 'The worker lease expired too many times.',
        "completedAt" = NOW(), "updatedAt" = NOW()
    WHERE "id" IN (SELECT "evaluationId" FROM exhausted)
  `;
  const leaseToken = randomUUID();
  const jobs = await database.$queryRaw<ClaimedJob[]>`
    UPDATE "EvaluationJob"
    SET "status" = 'RUNNING', "stage" = 'technical', "lockedBy" = ${workerId},
        "leaseToken" = ${leaseToken}, "heartbeatAt" = NOW(),
        "leaseExpiresAt" = ${leaseDeadline()}, "attemptCount" = "attemptCount" + 1,
        "updatedAt" = NOW()
    WHERE "id" = (
      SELECT "id" FROM "EvaluationJob"
      WHERE (("status" = 'QUEUED' AND "availableAt" <= NOW())
         OR ("status" = 'RUNNING' AND "leaseExpiresAt" < NOW()))
        AND "attemptCount" < "maxAttempts"
        AND "cancelRequestedAt" IS NULL
      ORDER BY "availableAt", "createdAt"
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING "id", "evaluationId", "attemptCount", "maxAttempts", "leaseToken"
  `;
  return jobs[0] ?? null;
}

export async function renewLease(job: ClaimedJob) {
  const result = await database.evaluationJob.updateMany({
    where: { id: job.id, leaseToken: job.leaseToken, status: "RUNNING", cancelRequestedAt: null },
    data: { heartbeatAt: new Date(), leaseExpiresAt: leaseDeadline() },
  });
  return result.count === 1;
}

export async function assertJobActive(job: ClaimedJob) {
  const current = await database.evaluationJob.findUnique({
    where: { id: job.id },
    select: { cancelRequestedAt: true, leaseToken: true, status: true },
  });
  if (!current || current.status !== "RUNNING" || current.leaseToken !== job.leaseToken) {
    throw new Error("JOB_LEASE_LOST");
  }
  if (current.cancelRequestedAt) throw new Error("JOB_CANCELLED");
}

export async function updateJobStage(job: ClaimedJob, stage: string) {
  const result = await database.evaluationJob.updateMany({
    where: { id: job.id, leaseToken: job.leaseToken, status: "RUNNING", cancelRequestedAt: null },
    data: { stage },
  });
  if (result.count !== 1) await assertJobActive(job);
}

export async function finishCancellationIfRequested(job: ClaimedJob) {
  return database.$transaction(async (transaction) => {
    const result = await transaction.evaluationJob.updateMany({
      where: {
        id: job.id,
        leaseToken: job.leaseToken,
        status: "RUNNING",
        cancelRequestedAt: { not: null },
      },
      data: {
        finishedAt: new Date(),
        leaseExpiresAt: null,
        leaseToken: null,
        lockedBy: null,
        stage: "cancelled",
        status: "CANCELLED",
      },
    });
    if (result.count !== 1) return false;
    await transaction.evaluation.update({
      where: { id: job.evaluationId },
      data: { completedAt: new Date(), status: "CANCELLED" },
    });
    return true;
  });
}

export async function completeJob(job: ClaimedJob) {
  const result = await database.evaluationJob.updateMany({
    where: { id: job.id, leaseToken: job.leaseToken, status: "RUNNING", cancelRequestedAt: null },
    data: {
      finishedAt: new Date(),
      lastError: null,
      leaseExpiresAt: null,
      leaseToken: null,
      lockedBy: null,
      stage: "completed",
      status: "COMPLETED",
    },
  });
  if (result.count !== 1) await assertJobActive(job);
}

export async function failJob(job: ClaimedJob, error: unknown) {
  const message = error instanceof Error ? error.message.slice(0, 500) : "UNKNOWN_WORKER_ERROR";
  const retry = job.attemptCount < job.maxAttempts;
  await database.$transaction(async (transaction) => {
    const updated = await transaction.evaluationJob.updateMany({
      where: { id: job.id, leaseToken: job.leaseToken, status: "RUNNING", cancelRequestedAt: null },
      data: retry
        ? { availableAt: new Date(Date.now() + 5_000), lastError: message, leaseExpiresAt: null, leaseToken: null, lockedBy: null, stage: "queued", status: "QUEUED" }
        : { finishedAt: new Date(), lastError: message, leaseExpiresAt: null, leaseToken: null, lockedBy: null, stage: "failed", status: "FAILED" },
    });
    if (updated.count !== 1) return;
    await transaction.evaluation.update({
      where: { id: job.evaluationId },
      data: retry
        ? { failureCode: "TECHNICAL_RETRY", failureMessage: message, status: "QUEUED" }
        : { completedAt: new Date(), failureCode: "TECHNICAL_FAILED", failureMessage: message, status: "FAILED" },
    });
  });
}
