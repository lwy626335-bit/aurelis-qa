export function summarizeScores(values: readonly number[]) {
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) throw new Error("At least one finite score is required.");
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;
  return { mean: Math.round(mean * 100) / 100, standardDeviation: Math.round(Math.sqrt(variance) * 100) / 100, variance: Math.round(variance * 100) / 100 };
}
