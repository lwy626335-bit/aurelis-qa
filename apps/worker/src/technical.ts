import { createServer } from "node:http";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import AxeBuilder from "@axe-core/playwright";
import { database } from "@aurelis/database/client";
import { calculateWeightedScore, validateEvaluationUrl } from "@aurelis/evaluation";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { parse } from "parse5";
import { chromium } from "playwright";

import type { ClaimedJob } from "./queue.js";

type ElementNode = { nodeName: string; attrs?: { name: string; value: string }[]; childNodes?: ElementNode[] };
type ValidatorMessage = { type?: string; message?: string; line?: number; extract?: string };

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase().replace(/^::ffff:/, "");
  if (isIP(normalized) === 4) {
    const [a = 0, b = 0] = normalized.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized);
}

async function assertPublicHost(url: URL) {
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("PRIVATE_ADDRESS_RESOLVED");
}

async function fetchPublicHtml(value: string) {
  let current = value;
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const validation = validateEvaluationUrl(current);
    if (!validation.ok) throw new Error(validation.code);
    await assertPublicHost(validation.url);
    const response = await fetch(validation.url, { headers: { accept: "text/html", "user-agent": "AURELIS-QA/0.1" }, redirect: "manual", signal: AbortSignal.timeout(90_000) });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 5) throw new Error("REDIRECT_LIMIT");
      current = new URL(location, validation.url).href;
      continue;
    }
    if (!response.ok) throw new Error(`TARGET_HTTP_${response.status}`);
    const type = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) throw new Error("TARGET_NOT_HTML");
    const html = await response.text();
    if (new TextEncoder().encode(html).byteLength > 5_242_880) throw new Error("TARGET_TOO_LARGE");
    return html;
  }
  throw new Error("REDIRECT_LIMIT");
}

function elements(html: string) {
  const root = parse(html) as unknown as ElementNode;
  const result: ElementNode[] = [];
  const visit = (node: ElementNode) => {
    if (node.attrs) result.push(node);
    node.childNodes?.forEach(visit);
  };
  visit(root);
  return result;
}

function attr(node: ElementNode, name: string) {
  return node.attrs?.find((item) => item.name === name)?.value;
}

export function inspectDocument(html: string) {
  const nodes = elements(html);
  const names = nodes.map((node) => node.nodeName);
  const ids = nodes.map((node) => attr(node, "id")).filter((value): value is string => Boolean(value));
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const imagesWithoutAlt = nodes.filter((node) => node.nodeName === "img" && attr(node, "alt") === undefined).length;
  const linksWithoutText = nodes.filter((node) => node.nodeName === "a" && !node.childNodes?.length && !attr(node, "aria-label")).length;
  const meta = nodes.filter((node) => node.nodeName === "meta");
  const checks = {
    doctype: /^\s*<!doctype html/i.test(html),
    duplicateIds,
    hasDescription: meta.some((node) => attr(node, "name")?.toLowerCase() === "description" && Boolean(attr(node, "content"))),
    hasLang: nodes.some((node) => node.nodeName === "html" && Boolean(attr(node, "lang"))),
    hasMain: names.includes("main"),
    hasTitle: names.includes("title"),
    hasViewport: meta.some((node) => attr(node, "name")?.toLowerCase() === "viewport"),
    imagesWithoutAlt,
    linksWithoutText,
  };
  const passed = [checks.doctype, checks.hasDescription, checks.hasLang, checks.hasMain, checks.hasTitle, checks.hasViewport].filter(Boolean).length;
  const seoScore = Math.max(0, Math.round((passed / 6) * 100 - imagesWithoutAlt * 5 - linksWithoutText * 3));
  return { checks, seoScore };
}

async function serveSnapshot(html: string) {
  const safeHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const server = createServer((_request, response) => {
    response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; img-src data:");
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(safeHtml);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("SNAPSHOT_SERVER_FAILED");
  return { close: () => new Promise<void>((resolve) => server.close(() => resolve())), url: `http://127.0.0.1:${address.port}` };
}

async function validateHtml(html: string) {
  const base = process.env.VNU_URL ?? "http://127.0.0.1:8888";
  const response = await fetch(`${base.replace(/\/$/, "")}/?out=json`, {
    body: html,
    headers: { "content-type": "text/html; charset=utf-8", "user-agent": "AURELIS-QA/0.1" },
    method: "POST",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`VALIDATOR_HTTP_${response.status}`);
  return (await response.json()) as { messages: ValidatorMessage[] };
}

async function browserAudits(url: string) {
  const executablePath = chromium.executablePath();
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 30_000 });
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const userDataDir = resolve(process.cwd(), ".lighthouse-profile");
    await mkdir(userDataDir, { recursive: true });
    const chrome = await chromeLauncher.launch({
      chromePath: executablePath,
      chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
      userDataDir,
    });
    try {
      const result = await lighthouse(url, { logLevel: "error", onlyCategories: ["performance", "accessibility", "seo", "best-practices"], output: "json", port: chrome.port });
      if (!result?.lhr) throw new Error("LIGHTHOUSE_NO_RESULT");
      return { accessibility, lighthouse: result.lhr };
    } finally {
      try {
        await chrome.kill();
      } catch {
        // The process is already gone on some Windows Chrome builds.
      }
    }
  } finally {
    await browser.close();
  }
}

function categoryScore(lhr: Awaited<ReturnType<typeof browserAudits>>["lighthouse"], key: string) {
  const value = lhr.categories[key]?.score;
  return typeof value === "number" ? Math.round(value * 1000) / 10 : null;
}

export async function runTechnicalEvaluation(job: ClaimedJob) {
  const evaluation = await database.evaluation.findUnique({ where: { id: job.evaluationId }, include: { website: true } });
  if (!evaluation) throw new Error("EVALUATION_NOT_FOUND");
  const urlSnapshot = evaluation.inputType === "URL";
  const html = urlSnapshot
    ? await fetchPublicHtml(evaluation.website.canonicalUrl ?? "")
    : evaluation.website.htmlContent;
  if (!html) throw new Error("HTML_INPUT_MISSING");

  await database.evaluation.update({ where: { id: evaluation.id }, data: { failureCode: null, failureMessage: null, startedAt: new Date(), status: "RUNNING" } });
  const snapshot = await serveSnapshot(html);
  try {
    const [validator, audits] = await Promise.all([validateHtml(html), browserAudits(snapshot.url)]);
    const deterministic = inspectDocument(html);
    const errors = validator.messages.filter((message) => message.type === "error" || message.type === "non-document-error").length;
    const warnings = validator.messages.length - errors;
    const performance = categoryScore(audits.lighthouse, "performance");
    const accessibility = categoryScore(audits.lighthouse, "accessibility");
    const lighthouseSeo = categoryScore(audits.lighthouse, "seo");
    const bestPractices = categoryScore(audits.lighthouse, "best-practices");
    if (performance === null || accessibility === null || lighthouseSeo === null || bestPractices === null) throw new Error("LIGHTHOUSE_CATEGORY_MISSING");
    const htmlQuality = Math.max(0, 100 - errors * 10 - warnings * 2 - deterministic.checks.duplicateIds.length * 5);
    const seo = Math.round((lighthouseSeo + deterministic.seoScore) / 2 * 10) / 10;
    const dimensions = urlSnapshot
      ? [
          { key: "accessibility", maxScore: 100, score: accessibility, weight: 0.25 / 0.75 },
          { key: "seo", maxScore: 100, score: seo, weight: 0.2 / 0.75 },
          { key: "best-practices", maxScore: 100, score: bestPractices, weight: 0.15 / 0.75 },
          { key: "html", maxScore: 100, score: htmlQuality, weight: 0.15 / 0.75 },
        ]
      : [
          { key: "performance", maxScore: 100, score: performance, weight: 0.25 },
          { key: "accessibility", maxScore: 100, score: accessibility, weight: 0.25 },
          { key: "seo", maxScore: 100, score: seo, weight: 0.2 },
          { key: "best-practices", maxScore: 100, score: bestPractices, weight: 0.15 },
          { key: "html", maxScore: 100, score: htmlQuality, weight: 0.15 },
        ];
    const technicalScore = calculateWeightedScore(dimensions);
    const labMetrics = Object.fromEntries(["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index"].map((key) => [key, audits.lighthouse.audits[key]?.numericValue ?? null]));

    await database.$transaction([
      database.technicalResult.upsert({
        where: { evaluationId: evaluation.id },
        create: { evaluationId: evaluation.id, performanceScore: urlSnapshot ? null : performance, accessibilityScore: accessibility, seoScore: seo, bestPracticesScore: bestPractices, htmlQualityScore: htmlQuality, responsiveScore: deterministic.checks.hasViewport ? 100 : 50, codeQualityScore: 100, labMetrics: urlSnapshot ? undefined : labMetrics, lighthouseRaw: audits.lighthouse as never, validatorRaw: validator as never, accessibilityRaw: audits.accessibility as never, deterministicChecks: deterministic as never },
        update: { performanceScore: urlSnapshot ? null : performance, accessibilityScore: accessibility, seoScore: seo, bestPracticesScore: bestPractices, htmlQualityScore: htmlQuality, responsiveScore: deterministic.checks.hasViewport ? 100 : 50, codeQualityScore: 100, labMetrics: urlSnapshot ? undefined : labMetrics, lighthouseRaw: audits.lighthouse as never, validatorRaw: validator as never, accessibilityRaw: audits.accessibility as never, deterministicChecks: deterministic as never },
      }),
      database.evaluation.update({ where: { id: evaluation.id }, data: { completedAt: new Date(), failureCode: urlSnapshot ? "LIVE_PERFORMANCE_UNAVAILABLE" : null, failureMessage: urlSnapshot ? "Remote HTML was fetched with redirect and DNS checks; embedded resources were not executed, so live performance was not scored." : null, technicalScore, technicalToolVersions: { axe: audits.accessibility.testEngine.version, lighthouse: audits.lighthouse.lighthouseVersion, parse5: "8.0.0", scope: urlSnapshot ? "secured-static-snapshot" : "pasted-html-snapshot", validator: "Nu HTML Checker container" }, status: "PARTIAL" } }),
      database.evaluationJob.update({ where: { id: job.id }, data: { lastError: null, leaseExpiresAt: null, lockedBy: null, stage: "completed", status: "COMPLETED" } }),
    ]);
    return technicalScore;
  } finally {
    await snapshot.close();
  }
}
