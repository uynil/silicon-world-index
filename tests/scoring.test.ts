import { describe, expect, it } from "vitest";
import {
  assertWeightsSumToOne,
  calculateHeadlineScore,
  calculateModuleScore,
  calculateSnapshotScores,
  weightedAverage,
} from "../src/lib/scoring";
import type { HeadlineConfig, IndexModule, SeedSnapshot } from "../src/types";

const source = {
  label: "Test source",
  url: "https://example.com",
  publisher: "Example",
  accessedAt: "2026-05-31",
  updateCadence: "monthly",
  automationStatus: "manual" as const,
};

function moduleFixture(overrides: Partial<IndexModule> = {}): IndexModule {
  return {
    id: "agent-execution",
    name: "Agent execution",
    category: "autonomy",
    score: 0,
    confidence: 0.6,
    weight: 1,
    bottleneck: "Long tasks",
    summary: "Agent execution remains supervision-heavy.",
    criteria: [
      {
        id: "single-task",
        name: "Single task completion",
        score: 60,
        weight: 0.4,
        rawValue: "SWE-bench style tasks",
        normalization: "curated score",
        source,
        observedAt: "2026-05-31",
        confidence: 0.7,
        notes: "Strong in constrained issue repair.",
      },
      {
        id: "long-task",
        name: "Long task autonomy",
        score: 20,
        weight: 0.6,
        rawValue: "METR time horizon proxy",
        normalization: "curated score",
        source,
        observedAt: "2026-05-31",
        confidence: 0.55,
        notes: "Long tasks still require frequent supervision.",
      },
    ],
    ...overrides,
  };
}

describe("scoring", () => {
  it("calculates weighted averages", () => {
    expect(
      weightedAverage([
        { score: 80, weight: 0.25 },
        { score: 40, weight: 0.75 },
      ]),
    ).toBe(50);
  });

  it("rejects weights that do not sum to one", () => {
    expect(() =>
      assertWeightsSumToOne([
        { weight: 0.5 },
        { weight: 0.4 },
      ]),
    ).toThrow(/sum to 1/);
  });

  it("rejects scores outside the 0 to 100 range", () => {
    expect(() =>
      weightedAverage([
        { score: 110, weight: 1 },
      ]),
    ).toThrow(/0 and 100/);
  });

  it("calculates module scores from criteria", () => {
    expect(calculateModuleScore(moduleFixture())).toBe(36);
  });

  it("calculates headline scores from category module weights", () => {
    const modules = [
      moduleFixture({ id: "agent", weight: 0.75, score: 40 }),
      moduleFixture({ id: "robotics", weight: 0.25, score: 20 }),
    ];

    expect(calculateHeadlineScore(modules)).toBe(35);
  });

  it("validates headline aggregate weights independently", () => {
    const seed: SeedSnapshot = {
      metadata: {
        updatedAt: "2026-05-31",
        period: "2026-05",
        methodologyVersion: "0.1.0",
        summary: "Test snapshot",
      },
      headlineWeights: {
        capability: 0.5,
        autonomy: 0.5,
        governance: 0.5,
      },
      modules: [moduleFixture()],
    };

    expect(() => calculateSnapshotScores(seed)).toThrow(/headline weights/i);
  });

  it("calculates snapshot headline and silicon world scores", () => {
    const modules: IndexModule[] = [
      moduleFixture({
        id: "model",
        category: "capability",
        weight: 1,
        criteria: [
          { ...moduleFixture().criteria[0], score: 60, weight: 1 },
        ],
      }),
      moduleFixture({
        id: "agent",
        category: "autonomy",
        weight: 1,
        criteria: [
          { ...moduleFixture().criteria[0], score: 30, weight: 1 },
        ],
      }),
      moduleFixture({
        id: "governance",
        category: "governance",
        weight: 1,
        criteria: [
          { ...moduleFixture().criteria[0], score: 20, weight: 1 },
        ],
      }),
    ];
    const config: HeadlineConfig = {
      capability: 0.35,
      autonomy: 0.45,
      governance: 0.2,
    };

    const snapshot = calculateSnapshotScores({
      metadata: {
        updatedAt: "2026-05-31",
        period: "2026-05",
        methodologyVersion: "0.1.0",
        summary: "Test snapshot",
      },
      headlineWeights: config,
      modules,
    });

    expect(snapshot.headlines.capability).toBe(60);
    expect(snapshot.headlines.autonomy).toBe(30);
    expect(snapshot.headlines.governance).toBe(20);
    expect(snapshot.headlines.siliconWorld).toBe(38.5);
  });
});
