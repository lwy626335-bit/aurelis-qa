import "server-only";

import { createHash } from "node:crypto";

import { database } from "@aurelis/database/client";

import type { CreateBrandInput } from "./schema";

const hash = (content: string) => createHash("sha256").update(content).digest("hex");

export function listBrands() {
  return database.brandProfile.findMany({ include: { examples: true, project: true, referenceSources: true }, orderBy: { createdAt: "desc" } });
}

export function getBrand(id: string) {
  return database.brandProfile.findUnique({ where: { id }, include: { examples: true, project: true, referenceSources: true } });
}

export function createBrand(input: CreateBrandInput) {
  return database.$transaction(async (transaction) => {
    const project = (await transaction.project.findFirst({ where: { name: input.projectName } })) ?? (await transaction.project.create({ data: { name: input.projectName } }));
    const corpusHash = hash([...input.examples, ...input.references].map((item) => item.content).join("\n"));
    return transaction.brandProfile.create({
      data: {
        corpusVersion: `corpus-${corpusHash.slice(0, 12)}`,
        description: input.description,
        examples: { create: input.examples.map((example) => ({ ...example, contentHash: hash(example.content), language: input.language })) },
        forbiddenVocabulary: input.forbiddenVocabulary,
        name: input.name,
        personalities: input.personalities,
        preferredVocabulary: input.preferredVocabulary,
        projectId: project.id,
        referenceSources: { create: input.references.map((reference) => ({ ...reference, contentHash: hash(reference.content), language: input.language, retrievedAt: new Date(), sourceType: "USER_PROVIDED" })) },
        targetAudience: input.targetAudience,
        toneProfile: { formalCasual: 50, luxuryMassMarket: 50, reservedEnergetic: 50, seriousPlayful: 50, technicalSimple: 50 },
      },
      include: { examples: true, project: true, referenceSources: true },
    });
  });
}
