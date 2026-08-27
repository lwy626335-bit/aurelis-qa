import "server-only";

import { createHash } from "node:crypto";

import { database } from "@aurelis/database/client";
import { demoReport } from "@aurelis/database/demo";

import type { CreateEvaluationInput } from "./schema";

const RUBRIC_VERSION = "standard-web-quality-v1.0";

function hashInput(input: CreateEvaluationInput) {
  const content =
    input.inputType === "URL"
      ? new URL(input.url).href
      : JSON.stringify({ html: input.html, css: input.css, javascript: input.javascript });
  return createHash("sha256").update(content).digest("hex");
}

export async function createEvaluation(input: CreateEvaluationInput) {
  const inputHash = hashInput(input);

  return database.$transaction(async (transaction) => {
    const rubric = await transaction.rubric.findUnique({ where: { version: RUBRIC_VERSION } });
    if (!rubric) throw new Error("ACTIVE_RUBRIC_NOT_FOUND");
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
        projectId: project.id,
        websiteId: website.id,
        brandProfileId: input.brandProfileId,
        rubricId: rubric.id,
        inputType: input.inputType,
        rubricVersion: rubric.version,
        inputHash,
        job: { create: {} },
        versions: {
          create: {
            rubricVersion: rubric.version,
            inputHash,
            weightSet: { technical: 0.6, brand: 0.4 },
          },
        },
      },
      include: { job: true, project: true, website: true },
    });
  });
}

export function listEvaluations() {
  return database.evaluation.findMany({
    where: { inputHash: { not: demoReport.metadata.inputHash } },
    include: { job: true, project: true, technicalResult: true, website: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getEvaluation(id: string) {
  return database.evaluation.findUnique({
    where: { id },
    include: { brandResult: true, evidence: true, job: true, project: true, recommendations: true, technicalResult: true, website: true, versions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
}

export function getEvaluationStatus(id: string) {
  return database.evaluation.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      failureCode: true,
      failureMessage: true,
      technicalResult: { select: { id: true } },
      brandResult: { select: { id: true } },
      job: {
        select: {
          status: true,
          stage: true,
          attemptCount: true,
          maxAttempts: true,
        },
      },
    },
  });
}

export async function cancelEvaluation(id: string) {
  return database.$transaction(async (transaction) => {
    const evaluation = await transaction.evaluation.findUnique({ where: { id }, include: { job: true } });
    if (!evaluation || evaluation.status !== "QUEUED" || evaluation.job?.status !== "QUEUED") return false;

    await transaction.evaluationJob.update({
      where: { evaluationId: id },
      data: { status: "CANCELLED", stage: "cancelled" },
    });
    await transaction.evaluation.update({ where: { id }, data: { status: "CANCELLED" } });
    return true;
  });
}

export async function deleteEvaluation(id: string) {
  const evaluation = await database.evaluation.findUnique({ where: { id } });
  if (!evaluation) return false;
  await database.evaluation.delete({ where: { id } });
  return true;
}
