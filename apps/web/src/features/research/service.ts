import "server-only";
import { database } from "@aurelis/database/client";

export function listExperiments() { return database.experiment.findMany({ include: { project: true, runs: { include: { evaluation: true }, orderBy: { runNumber: "asc" } } }, orderBy: { createdAt: "desc" } }); }

export async function createExperiment(sourceEvaluationId: string, name: string, runCount: number) {
  if (!Number.isInteger(runCount) || runCount < 1 || runCount > 10) throw new Error("RUN_COUNT_INVALID");
  return database.$transaction(async (transaction) => {
    const source = await transaction.evaluation.findUniqueOrThrow({ where: { id: sourceEvaluationId }, include: { versions: { orderBy: { createdAt: "desc" }, take: 1 } } });
    const experiment = await transaction.experiment.create({ data: { name, projectId: source.projectId } });
    for (let runNumber = 1; runNumber <= runCount; runNumber += 1) {
      const evaluation = await transaction.evaluation.create({ data: { brandProfileId: source.brandProfileId, inputHash: source.inputHash, inputType: source.inputType, job: { create: {} }, projectId: source.projectId, rubricId: source.rubricId, rubricVersion: source.rubricVersion, versions: { create: { evaluatorModelId: source.evaluatorModelId, inputHash: source.inputHash, promptVersion: source.promptVersion, referenceCorpusVersion: source.referenceCorpusVersion, rubricVersion: source.rubricVersion, weightSet: source.versions[0]?.weightSet ?? { technical: 0.6, brand: 0.4 } } }, websiteId: source.websiteId } });
      await transaction.experimentRun.create({ data: { evaluationId: evaluation.id, experimentId: experiment.id, inputHash: source.inputHash, modelId: source.evaluatorModelId, promptVersion: source.promptVersion, rubricVersion: source.rubricVersion, runNumber } });
    }
    return experiment;
  });
}
