import { defaultOverallWeights, overallWeightsSchema } from "@aurelis/evaluation";

export function websiteOverallScore(
  scores: { brand: number | null; technical: number | null; visual: number | null },
  configuredWeights: unknown = defaultOverallWeights,
) {
  if (scores.technical === null) return null;
  const weights = overallWeightsSchema.safeParse(configuredWeights);
  const selected = (Object.keys(scores) as (keyof typeof scores)[])
    .filter((key) => scores[key] !== null && (weights.success ? weights.data[key] : defaultOverallWeights[key]) > 0);
  if (selected.length < 2) return null;
  const weightSet = weights.success ? weights.data : defaultOverallWeights;
  const availableWeight = selected.reduce((total, key) => total + weightSet[key], 0);
  const score = selected.reduce((total, key) => total + scores[key]! * weightSet[key] / availableWeight, 0);
  return Math.round(score * 10) / 10;
}
