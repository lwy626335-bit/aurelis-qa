export type WeightedDimension = {
  key: string;
  score: number;
  maxScore: number;
  weight: number;
};

function assertFiniteRange(value: number, min: number, max: number, label: string) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${label} must be between ${min} and ${max}.`);
  }
}

export function calculateWeightedScore(dimensions: readonly WeightedDimension[]) {
  if (dimensions.length === 0) {
    throw new Error("At least one scoring dimension is required.");
  }

  const weightTotal = dimensions.reduce((total, dimension) => total + dimension.weight, 0);
  if (Math.abs(weightTotal - 1) > 0.000_001) {
    throw new Error(`Dimension weights must total 1. Received ${weightTotal}.`);
  }

  const score = dimensions.reduce((total, dimension) => {
    assertFiniteRange(dimension.weight, 0, 1, `${dimension.key} weight`);
    assertFiniteRange(dimension.maxScore, Number.EPSILON, Number.MAX_SAFE_INTEGER, `${dimension.key} maxScore`);
    assertFiniteRange(dimension.score, 0, dimension.maxScore, `${dimension.key} score`);
    return total + (dimension.score / dimension.maxScore) * 100 * dimension.weight;
  }, 0);

  return Math.round(score * 10) / 10;
}

export type ReliabilityComponents = {
  evidenceCompleteness: number;
  evidenceStrength: number;
  evaluatorReviewerAgreement: number;
  reproducibility: number;
};

const reliabilityWeights: Record<keyof ReliabilityComponents, number> = {
  evidenceCompleteness: 0.35,
  evidenceStrength: 0.3,
  evaluatorReviewerAgreement: 0.2,
  reproducibility: 0.15,
};

export function calculateReliability(components: ReliabilityComponents) {
  const entries = Object.entries(components) as [keyof ReliabilityComponents, number][];
  const result = entries.reduce((total, [key, value]) => {
    assertFiniteRange(value, 0, 100, key);
    return total + value * reliabilityWeights[key];
  }, 0);
  return Math.round(result);
}
