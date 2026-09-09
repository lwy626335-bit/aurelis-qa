import { database } from "@aurelis/database/client";
import { calculateVisualScore, defaultEvaluationRunConfig, enforceAiAssessmentScope, evaluationRunConfigSchema, webVisualDimensionWeights, webVisualEvaluationOutputSchema } from "@aurelis/evaluation";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { chromium } from "playwright";

import { websiteOverallScore } from "./overall.js";
import type { ClaimedJob } from "./queue.js";
import { assertJobActive } from "./queue.js";
import { serveSnapshot } from "./technical.js";

async function captureScreenshots(url: string) {
  const browser = await chromium.launch({ headless: true });
  try {
    const screenshots: Buffer[] = [];
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport });
      await page.goto(url, { timeout: 30_000, waitUntil: "load" });
      screenshots.push(await page.screenshot({ animations: "disabled", fullPage: false, type: "png" }));
      await page.close();
    }
    return screenshots;
  } finally {
    await browser.close();
  }
}

export async function runWebVisualEvaluation(job: ClaimedJob) {
  if (!process.env.OPENAI_API_KEY) throw new Error("AI_EVALUATION_UNAVAILABLE");
  const evaluationId = job.evaluationId;
  const evaluation = await database.evaluation.findUnique({ where: { id: evaluationId }, include: { website: true, versions: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!evaluation) throw new Error("EVALUATION_NOT_FOUND");
  const html = evaluation.inputType === "URL" ? evaluation.website.fetchedHtmlContent : evaluation.website.htmlContent;
  if (!html) throw new Error("VISUAL_TARGET_UNAVAILABLE");
  const parsedConfig = evaluationRunConfigSchema.safeParse(evaluation.versions[0]?.reasoningConfiguration);
  const runConfig = parsedConfig.success ? parsedConfig.data : defaultEvaluationRunConfig();

  const snapshot = await serveSnapshot(html, evaluation.website.cssContent ?? "");
  try {
    const [desktop, mobile] = await captureScreenshots(snapshot.url);
    if (!desktop || !mobile) throw new Error("VISUAL_SCREENSHOT_MISSING");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 1, timeout: 90_000 });
    const response = await client.responses.parse({
      input: [
        {
          role: "system",
          content: "You are a senior digital design reviewer evaluating desktop and mobile screenshots of the same website. Judge only visible evidence and supplied context. Return every rubric dimension exactly once with a 0-100 score; do not calculate an overall score. Compare the two viewports for responsive readiness. The AI assessment applies only when aiGenerated is true; never infer provenance. When it is false, use not_applicable and zero risk values. Return exactly three concrete prioritized recommendations in the requested language.",
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: JSON.stringify({ aiGenerated: evaluation.aiGenerated, aiGenerator: evaluation.aiGenerator, originalPrompt: evaluation.originalPrompt, outputLanguage: evaluation.website.language, rubric: webVisualDimensionWeights, targetLabel: evaluation.website.label, views: ["desktop 1440x900", "mobile 390x844"] }) },
            { detail: "high", image_url: `data:image/png;base64,${desktop.toString("base64")}`, type: "input_image" },
            { detail: "high", image_url: `data:image/png;base64,${mobile.toString("base64")}`, type: "input_image" },
          ],
        },
      ],
      model: runConfig.visual.modelId,
      reasoning: { effort: runConfig.visual.reasoningEffort },
      store: false,
      text: { format: zodTextFormat(webVisualEvaluationOutputSchema, "web_visual_evaluation") },
    });
    if (!response.output_parsed) throw new Error("AI_VISUAL_UNPARSED");
    const result = enforceAiAssessmentScope(webVisualEvaluationOutputSchema.parse(response.output_parsed), evaluation.aiGenerated);
    const visualScore = calculateVisualScore(result.dimensions, webVisualDimensionWeights);
    const overallScore = websiteOverallScore({ brand: evaluation.brandScore, technical: evaluation.technicalScore, visual: visualScore }, evaluation.versions[0]?.weightSet);

    await assertJobActive(job);
    await database.$transaction([
      database.webVisualResult.upsert({
        where: { evaluationId },
        create: { aiAssessment: result.aiAssessment as never, dimensionScores: result.dimensions as never, evaluationId, modelId: runConfig.visual.modelId, promptVersion: runConfig.visual.promptVersion, recommendations: result.recommendations as never, summary: result.summary },
        update: { aiAssessment: result.aiAssessment as never, dimensionScores: result.dimensions as never, modelId: runConfig.visual.modelId, promptVersion: runConfig.visual.promptVersion, recommendations: result.recommendations as never, summary: result.summary },
      }),
      database.evaluation.update({ where: { id: evaluationId }, data: { completedAt: evaluation.brandProfileId ? null : new Date(), evaluatorModel: runConfig.visual.modelId, evaluatorModelId: runConfig.visual.modelId, overallScore, promptVersion: runConfig.visual.promptVersion, status: evaluation.brandProfileId ? "RUNNING" : "COMPLETED", visualScore } }),
    ]);
    return visualScore;
  } finally {
    await snapshot.close();
  }
}
