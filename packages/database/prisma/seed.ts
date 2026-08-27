import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { demoReport } from "../src/demo.js";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://aurelis:aurelis_dev@localhost:5432/aurelis?schema=public";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seed() {
  await prisma.rubric.upsert({
    where: { version: "standard-web-quality-v1.0" },
    update: {},
    create: {
      name: "Standard Web Quality",
      version: "standard-web-quality-v1.0",
      description: "Hybrid technical and brand voice evaluation rubric.",
      isActive: true,
      dimensions: {
        create: demoReport.dimensions.map((dimension, index) => ({
          key: dimension.key,
          label: dimension.key,
          description: `${dimension.key} quality dimension for the Phase 1 demo.`,
          weight: index === 5 ? 0.35 : 0.13,
          maxScore: 100,
          sortOrder: index,
        })),
      },
    },
  });

  await prisma.project.create({
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
  });
}

seed()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
