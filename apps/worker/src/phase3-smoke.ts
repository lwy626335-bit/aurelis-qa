import { database } from "@aurelis/database/client";

import { processOne } from "./index.js";

const name = `Phase 3 smoke ${Date.now()}`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="description" content="A deterministic worker smoke target"><title>Worker target</title><style>body{font-family:sans-serif}main{max-width:60rem;margin:auto}</style></head><body><main><h1>Measured target</h1><p>Evidence, not impression.</p></main></body></html>`;

const rubric = await database.rubric.findUniqueOrThrow({ where: { version: "standard-web-quality-v1.0" } });
const project = await database.project.create({
  data: {
    name,
    websites: {
      create: {
        contentHash: "phase3-smoke",
        htmlContent: html,
        inputType: "HTML",
        label: "Technical smoke target",
      },
    },
  },
  include: { websites: true },
});

try {
  const website = project.websites[0];
  if (!website) throw new Error("SMOKE_WEBSITE_NOT_CREATED");
  const evaluation = await database.evaluation.create({
    data: {
      inputHash: "phase3-smoke",
      inputType: "HTML",
      job: { create: {} },
      projectId: project.id,
      rubricId: rubric.id,
      rubricVersion: rubric.version,
      websiteId: website.id,
    },
  });
  let result = await database.evaluation.findUniqueOrThrow({ where: { id: evaluation.id }, include: { job: true, technicalResult: true } });
  for (let attempt = 0; attempt < 20 && result.job?.status !== "COMPLETED"; attempt += 1) {
    if (!(await processOne("phase3-smoke-worker"))) break;
    result = await database.evaluation.findUniqueOrThrow({ where: { id: evaluation.id }, include: { job: true, technicalResult: true } });
  }
  if (result.status !== "PARTIAL" || result.job?.status !== "COMPLETED" || !result.technicalResult || result.technicalScore === null) {
    throw new Error(`SMOKE_RESULT_INVALID:${JSON.stringify({ error: result.job?.lastError, job: result.job?.status, status: result.status, technicalScore: result.technicalScore })}`);
  }
  console.info(JSON.stringify({ accessibility: result.technicalResult.accessibilityScore, html: result.technicalResult.htmlQualityScore, performance: result.technicalResult.performanceScore, seo: result.technicalResult.seoScore, technicalScore: result.technicalScore, tools: result.technicalToolVersions }));
} finally {
  await database.project.delete({ where: { id: project.id } });
  await database.$disconnect();
}

process.exit(0);
