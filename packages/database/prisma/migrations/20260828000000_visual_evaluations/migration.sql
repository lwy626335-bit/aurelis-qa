ALTER TABLE "Evaluation"
ADD COLUMN "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "aiGenerator" TEXT,
ADD COLUMN "originalPrompt" TEXT,
ADD COLUMN "visualScore" DOUBLE PRECISION;

CREATE TABLE "WebVisualResult" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "dimensionScores" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "aiAssessment" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "modelId" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebVisualResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LogoEvaluation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "targetLabel" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "brandKeywords" TEXT[] NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiGenerator" TEXT,
    "originalPrompt" TEXT,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "summary" TEXT NOT NULL,
    "dimensionScores" JSONB NOT NULL,
    "aiAssessment" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "modelId" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogoEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebVisualResult_evaluationId_key" ON "WebVisualResult"("evaluationId");
CREATE INDEX "LogoEvaluation_projectId_createdAt_idx" ON "LogoEvaluation"("projectId", "createdAt");

ALTER TABLE "WebVisualResult" ADD CONSTRAINT "WebVisualResult_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LogoEvaluation" ADD CONSTRAINT "LogoEvaluation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
