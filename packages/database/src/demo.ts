export const DEMO_DATASET_LABEL = "Demo dataset";

export type ScoreKey = "technical" | "brand" | "reliability";

export type DemoIssue = {
  id: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  title: string;
  dimension: string;
  evidence: string;
  recommendation: string;
};

export const demoReport = {
  project: "Luxury AI Landing Page",
  brand: "Northstar Atelier",
  url: "northstar-atelier.example",
  evaluatedAt: "2026-08-17T09:42:00.000Z",
  overallScore: 87.6,
  grade: "A-",
  scores: {
    technical: 91,
    brand: 82,
    reliability: 94,
  } satisfies Record<ScoreKey, number>,
  scoreDelta: 3.2,
  metadata: {
    model: "GPT-5.6 Sol",
    modelId: "gpt-5.6-sol",
    rubric: "Standard Web Quality v1.0",
    promptVersion: "brand-evaluator-v2.1",
    inputHash: "demo_6f1d9b2a",
    referenceCorpusVersion: "northstar-corpus-v1",
  },
  dimensions: [
    { dimension: "Performance", score: 91, previous: 87 },
    { dimension: "Accessibility", score: 96, previous: 94 },
    { dimension: "SEO", score: 88, previous: 85 },
    { dimension: "HTML Quality", score: 84, previous: 82 },
    { dimension: "Responsive", score: 89, previous: 86 },
    { dimension: "Brand Voice", score: 82, previous: 79 },
  ],
  trend: [
    { label: "May 18", quality: 78.4, technical: 84, brand: 71 },
    { label: "Jun 02", quality: 80.1, technical: 85, brand: 74 },
    { label: "Jun 26", quality: 82.8, technical: 87, brand: 77 },
    { label: "Jul 19", quality: 84.4, technical: 88, brand: 79 },
    { label: "Aug 17", quality: 87.6, technical: 91, brand: 82 },
  ],
  issues: [
    {
      id: "issue-contrast",
      severity: "High",
      title: "Primary CTA loses contrast on the lightest hero frame",
      dimension: "Accessibility",
      evidence: "Measured contrast falls below the 4.5:1 threshold in one captured state.",
      recommendation: "Use a stable dark text token or increase the CTA surface opacity.",
    },
    {
      id: "issue-vocabulary",
      severity: "Medium",
      title: "Two claims exceed the approved confidence range",
      dimension: "Brand Voice",
      evidence: "The phrases 'guaranteed transformation' and 'absolute results' are absent from the reference corpus.",
      recommendation: "Replace absolute claims with evidence-led, qualified language.",
    },
    {
      id: "issue-heading",
      severity: "Low",
      title: "One heading level is skipped",
      dimension: "HTML Quality",
      evidence: "The document moves from h2 to h4 in the methodology section.",
      recommendation: "Use an h3 for the subsection heading.",
    },
  ] satisfies DemoIssue[],
  recentEvaluations: [
    { id: "eval-005", target: "Campaign landing", score: 87.6, status: "Completed", date: "Aug 17" },
    { id: "eval-004", target: "Product overview", score: 84.4, status: "Completed", date: "Jul 19" },
    { id: "eval-003", target: "Editorial concept", score: 82.8, status: "Completed", date: "Jun 26" },
    { id: "eval-002", target: "Waitlist page", score: 80.1, status: "Completed", date: "Jun 02" },
  ],
} as const;
