import { calculateReliability, calculateWeightedScore } from "@aurelis/evaluation";

export const DEMO_DATASET_LABEL = "Demo dataset";

export type ScoreKey = "technical" | "brand" | "reliability";
export type DemoDimensionKey = "performance" | "accessibility" | "seo" | "htmlQuality" | "responsive" | "brandVoice";
export type DemoIssueKey = "contrast" | "vocabulary" | "heading";
export type DemoTargetKey = "campaign" | "product" | "editorial" | "waitlist";

export type DemoIssue = {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  key: DemoIssueKey;
  dimension: DemoDimensionKey;
};

const weights = { technical: 0.6, brand: 0.4 } as const;
const componentScores = { technical: 91.4, brand: 81.9 } as const;
const reliabilityComponents = {
  evidenceCompleteness: 96,
  evidenceStrength: 92,
  evaluatorReviewerAgreement: 94,
  reproducibility: 93,
} as const;

const overallScore = calculateWeightedScore([
  { key: "technical", score: componentScores.technical, maxScore: 100, weight: weights.technical },
  { key: "brand", score: componentScores.brand, maxScore: 100, weight: weights.brand },
]);

export const demoReport = {
  project: "Luxury AI Landing Page",
  brand: "Northstar Atelier",
  url: "northstar-atelier.example",
  evaluatedAt: "2026-08-17T09:42:00.000Z",
  overallScore,
  grade: "A-",
  scores: {
    technical: componentScores.technical,
    brand: componentScores.brand,
    reliability: calculateReliability(reliabilityComponents),
  } satisfies Record<ScoreKey, number>,
  scoreDelta: 3.2,
  metadata: {
    model: "GPT-5.6 Sol",
    modelId: "gpt-5.6-sol",
    rubric: "Standard Web Quality v1.0",
    promptVersion: "brand-evaluator-v2.1",
    inputHash: "3e22e14c353d2fca79a7596c97eb83244e0bf4dd96041dfbfef35ef92a1a6e5c",
    referenceCorpusVersion: "northstar-corpus-v1",
    datasetVersion: "aurelis-demo-2026.08",
    auditExecuted: false,
    weights,
    reliabilityComponents,
  },
  dimensions: [
    { key: "performance", score: 91, previous: 87 },
    { key: "accessibility", score: 96, previous: 94 },
    { key: "seo", score: 88, previous: 85 },
    { key: "htmlQuality", score: 84, previous: 82 },
    { key: "responsive", score: 89, previous: 86 },
    { key: "brandVoice", score: 81.9, previous: 79 },
  ],
  trend: [
    { evaluatedAt: "2026-05-18T09:42:00.000Z", quality: 78.4, technical: 84, brand: 71 },
    { evaluatedAt: "2026-06-02T09:42:00.000Z", quality: 80.1, technical: 85, brand: 74 },
    { evaluatedAt: "2026-06-26T09:42:00.000Z", quality: 82.8, technical: 87, brand: 77 },
    { evaluatedAt: "2026-07-19T09:42:00.000Z", quality: 84.4, technical: 88, brand: 79 },
    { evaluatedAt: "2026-08-17T09:42:00.000Z", quality: overallScore, technical: componentScores.technical, brand: componentScores.brand },
  ],
  issues: [
    {
      id: "issue-contrast",
      severity: "High",
      key: "contrast",
      dimension: "accessibility",
    },
    {
      id: "issue-vocabulary",
      severity: "Medium",
      key: "vocabulary",
      dimension: "brandVoice",
    },
    {
      id: "issue-heading",
      severity: "Low",
      key: "heading",
      dimension: "htmlQuality",
    },
  ] satisfies DemoIssue[],
  recentEvaluations: [
    { id: "eval-005", target: "campaign", score: overallScore, status: "Sample", evaluatedAt: "2026-08-17T09:42:00.000Z" },
    { id: "eval-004", target: "product", score: 84.4, status: "Sample", evaluatedAt: "2026-07-19T09:42:00.000Z" },
    { id: "eval-003", target: "editorial", score: 82.8, status: "Sample", evaluatedAt: "2026-06-26T09:42:00.000Z" },
    { id: "eval-002", target: "waitlist", score: 80.1, status: "Sample", evaluatedAt: "2026-06-02T09:42:00.000Z" },
  ],
} as const;
