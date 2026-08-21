import "server-only";

import { createHash } from "node:crypto";

import { database } from "@aurelis/database/client";

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

    const project =
      (await transaction.project.findFirst({ where: { name: input.projectName } })) ??
      (await transaction.project.create({ data: { name: input.projectName } }));

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
    include: { job: true, project: true, technicalResult: true, website: true },
    orderBy: { createdAt: "desc" },
  });
}

export function getEvaluation(id: string) {
  return database.evaluation.findUnique({
    where: { id },
    include: { job: true, project: true, technicalResult: true, website: true, versions: { orderBy: { createdAt: "desc" }, take: 1 } },
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
