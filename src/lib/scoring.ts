import type {
  HeadlineCategory,
  HeadlineConfig,
  HeadlineScores,
  IndexModule,
  IndexSnapshot,
  SeedSnapshot,
} from "../types";

const categories: HeadlineCategory[] = ["capability", "autonomy", "governance"];
const epsilon = 0.000001;

interface WeightedScore {
  score: number;
  weight: number;
}

interface WeightedItem {
  weight: number;
}

export function assertValidScore(score: number, label = "score") {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error(`${label} must be between 0 and 100`);
  }
}

export function assertWeightsSumToOne(items: WeightedItem[], label = "weights") {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (Math.abs(total - 1) > epsilon) {
    throw new Error(`${label} must sum to 1; received ${total.toFixed(6)}`);
  }
}

export function weightedAverage(items: WeightedScore[], label = "weighted scores") {
  assertWeightsSumToOne(items, label);
  for (const item of items) {
    assertValidScore(item.score, label);
  }

  return roundScore(items.reduce((sum, item) => sum + item.score * item.weight, 0));
}

export function calculateModuleScore(module: IndexModule) {
  if (module.criteria.length === 0) {
    throw new Error(`module ${module.id} must include criteria`);
  }

  return weightedAverage(module.criteria, `${module.id} criteria weights`);
}

export function calculateHeadlineScore(modules: IndexModule[]) {
  if (modules.length === 0) {
    throw new Error("headline category must include at least one module");
  }

  return weightedAverage(modules, "module weights");
}

export function calculateSnapshotScores(seed: SeedSnapshot): IndexSnapshot {
  validateHeadlineWeights(seed.headlineWeights);

  const modules = seed.modules.map((module) => ({
    ...module,
    score: calculateModuleScore(module),
  }));

  const headlines = categories.reduce((scores, category) => {
    const categoryModules = modules.filter((module) => module.category === category);
    scores[category] = calculateHeadlineScore(categoryModules);
    return scores;
  }, {} as HeadlineConfig);

  const siliconWorld = weightedAverage(
    categories.map((category) => ({
      score: headlines[category],
      weight: seed.headlineWeights[category],
    })),
    "headline weights",
  );

  const headlineScores: HeadlineScores = {
    ...headlines,
    siliconWorld,
  };

  return {
    ...seed,
    modules,
    headlines: headlineScores,
  };
}

function validateHeadlineWeights(weights: HeadlineConfig) {
  assertWeightsSumToOne(
    categories.map((category) => ({ weight: weights[category] })),
    "headline weights",
  );
}

function roundScore(score: number) {
  return Math.round(score * 10) / 10;
}
