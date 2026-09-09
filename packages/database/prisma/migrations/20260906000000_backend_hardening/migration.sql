ALTER TABLE "Website"
ADD COLUMN "fetchedHtmlContent" TEXT,
ADD COLUMN "fetchedContentHash" TEXT,
ADD COLUMN "fetchedAt" TIMESTAMP(3),
ADD COLUMN "fetchMetadata" JSONB;

ALTER TABLE "EvaluationJob"
ADD COLUMN "leaseToken" TEXT,
ADD COLUMN "heartbeatAt" TIMESTAMP(3),
ADD COLUMN "cancelRequestedAt" TIMESTAMP(3),
ADD COLUMN "finishedAt" TIMESTAMP(3);

ALTER TABLE "Evaluation" ADD COLUMN "requestKey" TEXT;
CREATE UNIQUE INDEX "Evaluation_requestKey_key" ON "Evaluation"("requestKey");

CREATE INDEX "EvaluationJob_status_leaseExpiresAt_attemptCount_idx"
ON "EvaluationJob"("status", "leaseExpiresAt", "attemptCount");

CREATE UNIQUE INDEX "Rubric_one_active_idx"
ON "Rubric"("isActive") WHERE "isActive" = true;

CREATE INDEX "Website_projectId_createdAt_idx" ON "Website"("projectId", "createdAt");
CREATE INDEX "Evaluation_createdAt_idx" ON "Evaluation"("createdAt");
CREATE INDEX "Evaluation_projectId_createdAt_idx" ON "Evaluation"("projectId", "createdAt");
CREATE INDEX "Evaluation_status_createdAt_idx" ON "Evaluation"("status", "createdAt");
