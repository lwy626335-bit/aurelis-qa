import { database } from "@aurelis/database/client";

export type ClaimedJob = { id: string; evaluationId: string; attemptCount: number; maxAttempts: number };

export async function claimJob(workerId: string): Promise<ClaimedJob | null> {
  const leaseExpiresAt = new Date(Date.now() + 120_000);
  const jobs = await database.$queryRaw<ClaimedJob[]>`
    UPDATE "EvaluationJob"
    SET "status" = 'RUNNING', "stage" = 'technical', "lockedBy" = ${workerId},
        "leaseExpiresAt" = ${leaseExpiresAt}, "attemptCount" = "attemptCount" + 1,
        "updatedAt" = NOW()
    WHERE "id" = (
      SELECT "id" FROM "EvaluationJob"
      WHERE ("status" = 'QUEUED' AND "availableAt" <= NOW())
         OR ("status" = 'RUNNING' AND "leaseExpiresAt" < NOW())
      ORDER BY "availableAt", "createdAt"
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING "id", "evaluationId", "attemptCount", "maxAttempts"
  `;
  return jobs[0] ?? null;
}

export async function failJob(job: ClaimedJob, error: unknown) {
  const message = error instanceof Error ? error.message.slice(0, 500) : "UNKNOWN_WORKER_ERROR";
  const retry = job.attemptCount < job.maxAttempts;
  await database.$transaction([
    database.evaluationJob.update({
      where: { id: job.id },
      data: retry
        ? { availableAt: new Date(Date.now() + 5_000), lastError: message, leaseExpiresAt: null, lockedBy: null, stage: "queued", status: "QUEUED" }
        : { lastError: message, leaseExpiresAt: null, lockedBy: null, stage: "failed", status: "FAILED" },
    }),
    database.evaluation.update({
      where: { id: job.evaluationId },
      data: retry ? { failureCode: "TECHNICAL_RETRY", failureMessage: message, status: "QUEUED" } : { completedAt: new Date(), failureCode: "TECHNICAL_FAILED", failureMessage: message, status: "FAILED" },
    }),
  ]);
}
