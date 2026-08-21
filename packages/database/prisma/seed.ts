import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { demoReport } from "../src/demo.js";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the demo dataset.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const rubric = await prisma.rubric.upsert({
    where: { version: "standard-web-quality-v1.0" },
    update: {},
    create: {
      name: "Standard Web Quality",
      version: "standard-web-quality-v1.0",
      description: "Hybrid technical and brand voice evaluation rubric.",
      isActive: true,
      dimensions: {
        create: demoReport.dimensions.map((dimension, index) => ({
          key: dimension.dimension.toLowerCase().replaceAll(" ", "-"),
          label: dimension.dimension,
          description: `${dimension.dimension} quality dimension for the Phase 1 demo.`,
          weight: index === 5 ? 0.35 : 0.13,
          maxScore: 100,
          sortOrder: index,
        })),
      },
    },
  });

  const project = await prisma.project.create({
    data: {
      name: demoReport.project,
      description: "Phase 1 demonstration project. No live audit was executed.",
      brands: {
        create: {
          name: demoReport.brand,
          description: "A fictional premium digital studio used only for demonstration.",
          targetAudience: "Design-conscious product and research teams",
          personalities: ["Premium", "Professional", "Measured", "Innovative"],
          toneProfile: { formal: 0.8, serious: 0.75, reserved: 0.7, technical: 0.55 },
          preferredVocabulary: ["measured", "evidence", "crafted", "considered"],
          forbiddenVocabulary: ["guaranteed", "absolute", "revolutionary"],
          corpusVersion: demoReport.metadata.referenceCorpusVersion,
        },
      },
      websites: {
        create: {
          label: "Campaign landing",
          canonicalUrl: `https://${demoReport.url}`,
          inputType: "URL",
          contentHash: demoReport.metadata.inputHash,
        },
      },
    },
    include: { brands: true, websites: true },
  });

  await prisma.evaluation.create({
    data: {
      projectId: project.id,
      websiteId: project.websites[0]!.id,
      brandProfileId: project.brands[0]!.id,
      rubricId: rubric.id,
      inputType: "URL",
      status: "COMPLETED",
      overallScore: demoReport.overallScore,
      technicalScore: demoReport.scores.technical,
      brandScore: demoReport.scores.brand,
      reliabilityScore: demoReport.scores.reliability,
      evaluatorModel: demoReport.metadata.model,
      evaluatorModelId: demoReport.metadata.modelId,
      promptVersion: demoReport.metadata.promptVersion,
      rubricVersion: demoReport.metadata.rubric,
      referenceCorpusVersion: demoReport.metadata.referenceCorpusVersion,
      technicalToolVersions: { lighthouse: "demo", validator: "demo" },
      inputHash: demoReport.metadata.inputHash,
      completedAt: new Date(demoReport.evaluatedAt),
      technicalResult: {
        create: {
          performanceScore: 91,
          accessibilityScore: 96,
          seoScore: 88,
          bestPracticesScore: 93,
          htmlQualityScore: 84,
          responsiveScore: 89,
          codeQualityScore: 86,
          deterministicChecks: { source: "demo", liveAuditExecuted: false },
        },
      },
      recommendations: {
        create: demoReport.issues.map((issue) => ({
          severity: issue.severity.toUpperCase() as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
          dimensionKey: issue.dimension.toLowerCase().replaceAll(" ", "-"),
          title: issue.title,
          description: issue.evidence,
          suggestedFix: issue.recommendation,
        })),
      },
    },
  });
}

seed()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
