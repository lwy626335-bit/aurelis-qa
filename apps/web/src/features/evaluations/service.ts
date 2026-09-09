import "server-only";

import { createHash } from "node:crypto";

import { database } from "@aurelis/database/client";
import { demoReport } from "@aurelis/database/demo";
import { defaultEvaluationRunConfig, rubricOverallWeights } from "@aurelis/evaluation";

import type { CreateEvaluationInput } from "./schema";

const RUBRIC_VERSION = "standard-web-quality-v1.0";

function hashInput(input: CreateEvaluationInput) {
  const source =
    input.inputType === "URL"
      ? new URL(input.url).href
      : JSON.stringify({ html: input.html, css: input.css, javascript: input.javascript });
  return createHash("sha256").update(JSON.stringify({ aiGenerated: input.aiGenerated, aiGenerator: input.aiGenerator, originalPrompt: input.originalPrompt, source })).digest("hex");
}

export async function createEvaluation(input: CreateEvaluationInput, requestKey?: string) {
  const inputHash = hashInput(input);

  return database.$transaction(async (transaction) => {
    if (requestKey) {
      const existing = await transaction.evaluation.findUnique({ where: { requestKey }, include: { job: true, project: true, website: true } });
      if (existing) return existing;
    }
    const rubric = (await transaction.rubric.findFirst({
      where: { isActive: true },
      include: { dimensions: true },
      orderBy: { updatedAt: "desc" },
    })) ?? (await transaction.rubric.findUnique({ where: { version: RUBRIC_VERSION }, include: { dimensions: true } }));
    if (!rubric) throw new Error("ACTIVE_RUBRIC_NOT_FOUND");
    const runConfig = defaultEvaluationRunConfig();
    const brandProfile = input.brandProfileId ? await transaction.brandProfile.findUnique({ where: { id: input.brandProfileId } }) : null;
    if (input.brandProfileId && !brandProfile) throw new Error("BRAND_PROFILE_NOT_FOUND");

    const project = brandProfile
      ? await transaction.project.findUniqueOrThrow({ where: { id: brandProfile.projectId } })
      : (await transaction.project.findFirst({ where: { name: input.projectName } })) ?? (await transaction.project.create({ data: { name: input.projectName } }));

    const website = await transaction.website.create({
      data: {
        projectId: project.id,
        label: input.targetLabel,
        canonicalUrl: input.inputType === "URL" ? new URL(input.url).href : null,
        inputType: input.inputType,
        htmlContent: input.inputType === "HTML" ? input.html : null,
        cssContent: input.inputType === "HTML" ? input.css : null,
        javascriptContent: input.inputType === "HTML" ? input.javascript : null,
        language: input.language,
        contentHash: inputHash,
      },
    });

    return transaction.evaluation.create({
      data: {
        aiGenerated: input.aiGenerated,
        aiGenerator: input.aiGenerator,
        projectId: project.id,
        websiteId: website.id,
        brandProfileId: input.brandProfileId,
        requestKey,
        rubricId: rubric.id,
        inputType: input.inputType,
        rubricVersion: rubric.version,
        inputHash,
        originalPrompt: input.originalPrompt,
        job: { create: {} },
        versions: {
          create: {
            rubricVersion: rubric.version,
            inputHash,
            evaluatorModelId: runConfig.visual.modelId,
            promptVersion: runConfig.visual.promptVersion,
            reasoningConfiguration: runConfig,
            weightSet: rubricOverallWeights(rubric.dimensions),
          },
        },
      },
      include: { job: true, project: true, website: true },
    });
  });
}

type ListEvaluationOptions = { query?: string; skip?: number; status?: "QUEUED" | "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED" | "CANCELLED"; take?: number };

function evaluationListWhere(options: ListEvaluationOptions) {
  return {
    inputHash: { not: demoReport.metadata.inputHash },
    ...(options.status ? { status: options.status } : {}),
    ...(options.query ? {
      OR: [
        { project: { name: { contains: options.query, mode: "insensitive" as const } } },
        { website: { label: { contains: options.query, mode: "insensitive" as const } } },
      ],
    } : {}),
  };
}

export function listEvaluations(options: ListEvaluationOptions = {}) {
  return database.evaluation.findMany({
    where: evaluationListWhere(options),
    select: {
      brandScore: true,
      createdAt: true,
      id: true,
      inputHash: true,
      inputType: true,
      evaluatorModelId: true,
      promptVersion: true,
      job: { select: { attemptCount: true, maxAttempts: true, stage: true, status: true } },
      overallScore: true,
      project: { select: { id: true, name: true } },
      reliabilityScore: true,
      rubricVersion: true,
      status: true,
      technicalResult: { select: { id: true } },
      technicalScore: true,
      visualScore: true,
      website: { select: { id: true, inputType: true, label: true, language: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: options.skip ?? 0,
    take: Math.min(options.take ?? 100, 100),
  });
}

export function countEvaluations(options: Pick<ListEvaluationOptions, "query" | "status"> = {}) {
  return database.evaluation.count({ where: evaluationListWhere(options) });
}

export async function queueHasCapacity(additionalJobs = 1) {
  const active = await database.evaluationJob.count({ where: { status: { in: ["QUEUED", "RUNNING"] } } });
  return active + additionalJobs <= 20;
}

export function getEvaluationByRequestKey(requestKey: string) {
  return database.evaluation.findUnique({ where: { requestKey }, select: { id: true, status: true } });
}

export function getEvaluation(id: string) {
  return database.evaluation.findUnique({
    where: { id },
    include: { brandResult: true, evidence: true, job: true, project: true, recommendations: true, technicalResult: true, visualResult: true, website: true, versions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}

export function getEvaluationStatus(id: string) {
  return database.evaluation.findUnique({
    where: { id },
    select: {
      id: true,
      brandProfileId: true,
      status: true,
      failureCode: true,
      failureMessage: true,
      technicalResult: { select: { id: true } },
      brandResult: { select: { id: true } },
      visualResult: { select: { id: true } },
      job: {
        select: {
          status: true,
          stage: true,
          attemptCount: true,
          cancelRequestedAt: true,
          heartbeatAt: true,
          maxAttempts: true,
        },
      },
    },
  });
}

export async function cancelEvaluation(id: string) {
  return database.$transaction(async (transaction) => {
    const queued = await transaction.evaluationJob.updateMany({
      where: { evaluationId: id, status: "QUEUED" },
      data: { cancelRequestedAt: new Date(), finishedAt: new Date(), stage: "cancelled", status: "CANCELLED" },
    });
    if (queued.count === 1) {
      await transaction.evaluation.update({ where: { id }, data: { completedAt: new Date(), status: "CANCELLED" } });
      return "CANCELLED" as const;
    }

    const running = await transaction.evaluationJob.updateMany({
      where: { evaluationId: id, status: "RUNNING", cancelRequestedAt: null },
      data: { cancelRequestedAt: new Date(), stage: "cancelling" },
    });
    if (running.count === 1) {
      await transaction.evaluation.updateMany({ where: { id, status: "QUEUED" }, data: { status: "RUNNING" } });
      return "CANCELLATION_REQUESTED" as const;
    }

    const pending = await transaction.evaluationJob.findUnique({ where: { evaluationId: id }, select: { cancelRequestedAt: true, status: true } });
    return pending?.status === "RUNNING" && pending.cancelRequestedAt ? "CANCELLATION_REQUESTED" as const : null;
  });
}

export async function deleteEvaluation(id: string) {
  return database.$transaction(async (transaction) => {
    const evaluation = await transaction.evaluation.findUnique({ where: { id }, select: { status: true, websiteId: true } });
    if (!evaluation) return "NOT_FOUND" as const;
    if (!["COMPLETED", "PARTIAL", "FAILED", "CANCELLED"].includes(evaluation.status)) return "NOT_TERMINAL" as const;

    await transaction.evaluation.delete({ where: { id } });
    const remaining = await transaction.evaluation.count({ where: { websiteId: evaluation.websiteId } });
    if (remaining === 0) await transaction.website.delete({ where: { id: evaluation.websiteId } });
    return "DELETED" as const;
  });
}
