import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
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
import { assertJobActive } from "./queue.js";

type ElementNode = { nodeName: string; attrs?: { name: string; value: string }[]; childNodes?: ElementNode[] };
type ValidatorMessage = { type?: string; message?: string; line?: number; extract?: string };
type FetchHop = { address: string; status: number; url: string };

const MAX_REMOTE_HTML_BYTES = 5_242_880;

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase().replace(/^::ffff:/, "");
  if (isIP(normalized) === 4) {
    const [a = 0, b = 0] = normalized.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  return normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") || /^fe[89ab]/.test(normalized);
}

export async function assertPublicHost(url: URL) {
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("PRIVATE_ADDRESS_RESOLVED");
  return addresses[0]!;
}

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(", ") : value ?? "";
}

async function requestPublicHtml(url: URL) {
  const resolved = await assertPublicHost(url);
  const defaultPort = url.protocol === "https:" ? "443" : "80";
  if (url.port && url.port !== defaultPort) throw new Error("TARGET_PORT_NOT_ALLOWED");

  return new Promise<{ html: string; location: string; status: number; address: string }>((resolve, reject) => {
    const request = (url.protocol === "https:" ? httpsRequest : httpRequest)({
      family: resolved.family,
      headers: { accept: "text/html", host: url.host, "user-agent": "AURELIS-QA/0.1" },
      hostname: resolved.address,
      method: "GET",
      path: `${url.pathname}${url.search}`,
      port: url.port || defaultPort,
      servername: url.protocol === "https:" ? url.hostname : undefined,
    }, (response) => {
      const status = response.statusCode ?? 0;
      const location = headerValue(response.headers.location);
      if (status >= 300 && status < 400) {
        response.resume();
        response.once("end", () => resolve({ address: resolved.address, html: "", location, status }));
        return;
      }
      if (status < 200 || status >= 300) {
        response.resume();
        response.once("end", () => reject(new Error(`TARGET_HTTP_${status}`)));
        return;
      }
      const type = headerValue(response.headers["content-type"]).toLowerCase();
      if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) {
        response.resume();
        response.once("end", () => reject(new Error("TARGET_NOT_HTML")));
        return;
      }
      const contentLength = Number(headerValue(response.headers["content-length"]));
      if (Number.isFinite(contentLength) && contentLength > MAX_REMOTE_HTML_BYTES) {
        response.destroy(new Error("TARGET_TOO_LARGE"));
        return;
      }

      const chunks: Buffer[] = [];
      let size = 0;
      response.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_REMOTE_HTML_BYTES) response.destroy(new Error("TARGET_TOO_LARGE"));
        else chunks.push(chunk);
      });
      response.once("end", () => resolve({ address: resolved.address, html: Buffer.concat(chunks).toString("utf8"), location: "", status }));
      response.once("error", reject);
    });
    request.setTimeout(90_000, () => request.destroy(new Error("TARGET_TIMEOUT")));
    request.once("error", reject);
    request.end();
  });
}

export async function fetchPublicSnapshot(value: string) {
  let current = value;
  const hops: FetchHop[] = [];
  for (let redirects = 0; redirects <= 5; redirects += 1) {
    const validation = validateEvaluationUrl(current);
    if (!validation.ok) throw new Error(validation.code);
    const response = await requestPublicHtml(validation.url);
    hops.push({ address: response.address, status: response.status, url: validation.url.href });
    if (response.status >= 300 && response.status < 400) {
      if (!response.location || redirects === 5) throw new Error("REDIRECT_LIMIT");
      current = new URL(response.location, validation.url).href;
      continue;
    }
    return { finalUrl: validation.url.href, hops, html: response.html };
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

export async function serveSnapshot(html: string, css = "") {
  const safeHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  const style = css ? `<style>${css.replace(/<\/style/gi, "<\\/style")}</style>` : "";
  const document = safeHtml.includes("</head>") ? safeHtml.replace("</head>", `${style}</head>`) : `${style}${safeHtml}`;
  const server = createServer((_request, response) => {
    response.setHeader("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; img-src data:");
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(document);
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
    const chrome = await chromeLauncher.launch({
      chromePath: executablePath,
      chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"],
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
  let html = urlSnapshot ? evaluation.website.fetchedHtmlContent : evaluation.website.htmlContent;
  if (urlSnapshot && !html) {
    const fetched = await fetchPublicSnapshot(evaluation.website.canonicalUrl ?? "");
    await assertJobActive(job);
    html = fetched.html;
    await database.website.update({
      where: { id: evaluation.website.id },
      data: {
        canonicalUrl: fetched.finalUrl,
        fetchMetadata: { hops: fetched.hops },
        fetchedAt: new Date(),
        fetchedContentHash: createHash("sha256").update(fetched.html).digest("hex"),
        fetchedHtmlContent: fetched.html,
      },
    });
  }
  if (!html) throw new Error("HTML_INPUT_MISSING");

  await database.evaluation.update({ where: { id: evaluation.id }, data: { failureCode: null, failureMessage: null, status: "RUNNING" } });
  const snapshot = await serveSnapshot(html, evaluation.website.cssContent ?? "");
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
    const toolVersions = { axe: audits.accessibility.testEngine.version, lighthouse: audits.lighthouse.lighthouseVersion, parse5: "8.0.0", scope: urlSnapshot ? "secured-static-snapshot" : "pasted-html-snapshot", validator: "Nu HTML Checker container" };

    await assertJobActive(job);
    await database.$transaction([
      database.technicalResult.upsert({
        where: { evaluationId: evaluation.id },
        create: { evaluationId: evaluation.id, performanceScore: urlSnapshot ? null : performance, accessibilityScore: accessibility, seoScore: seo, bestPracticesScore: bestPractices, htmlQualityScore: htmlQuality, responsiveScore: deterministic.checks.hasViewport ? 100 : 50, codeQualityScore: null, labMetrics: urlSnapshot ? undefined : labMetrics, lighthouseRaw: audits.lighthouse as never, validatorRaw: validator as never, accessibilityRaw: audits.accessibility as never, deterministicChecks: deterministic as never },
        update: { performanceScore: urlSnapshot ? null : performance, accessibilityScore: accessibility, seoScore: seo, bestPracticesScore: bestPractices, htmlQualityScore: htmlQuality, responsiveScore: deterministic.checks.hasViewport ? 100 : 50, codeQualityScore: null, labMetrics: urlSnapshot ? undefined : labMetrics, lighthouseRaw: audits.lighthouse as never, validatorRaw: validator as never, accessibilityRaw: audits.accessibility as never, deterministicChecks: deterministic as never },
      }),
      database.evaluation.update({ where: { id: evaluation.id }, data: { failureCode: urlSnapshot ? "LIVE_PERFORMANCE_UNAVAILABLE" : null, failureMessage: urlSnapshot ? "Remote HTML was fetched with redirect and DNS checks; embedded resources were not executed, so live performance was not scored." : null, technicalScore, technicalToolVersions: toolVersions, status: "RUNNING" } }),
      database.evaluationVersion.updateMany({ where: { evaluationId: evaluation.id }, data: { technicalToolVersions: toolVersions } }),
    ]);
    return technicalScore;
  } finally {
    await snapshot.close();
  }
}
