import { describe, expect, it } from "vitest";
import { toHistoryEntry, upsertHistoryEntry } from "../src/lib/history";
import type { HistoryEntry, IndexSnapshot } from "../src/types";

function entry(period: string, siliconWorld: number): HistoryEntry {
  return {
    period,
    updatedAt: `${period}-15`,
    methodologyVersion: "0.1.0",
    headlines: {
      siliconWorld,
      capability: siliconWorld + 10,
      autonomy: siliconWorld,
      governance: siliconWorld - 10,
    },
    modules: [
      {
        id: "agent-execution",
        name: "Agent execution",
        category: "autonomy",
        score: 31,
        confidence: 0.6,
        bottleneck: "Long tasks",
        delta: 0,
      },
    ],
    criteria: [
      {
        moduleId: "agent-execution",
        moduleName: "Agent execution",
        id: "long-task",
        name: "Long task autonomy",
        score: 24,
        weight: 1,
        confidence: 0.5,
        sourceAutomationStatus: "semi_automatic",
        delta: 0,
      },
    ],
    annotations: [
      {
        type: "data_update",
        title: "Snapshot regenerated",
        note: `Updated ${period} from curated seed data.`,
      },
    ],
  };
}

function snapshot(period: string, siliconWorld: number): IndexSnapshot {
  return {
    metadata: {
      period,
      updatedAt: `${period}-15`,
      methodologyVersion: "0.1.0",
      summary: "Test",
    },
    headlineWeights: {
      capability: 0.35,
      autonomy: 0.45,
      governance: 0.2,
    },
    headlines: {
      siliconWorld,
      capability: siliconWorld + 10,
      autonomy: siliconWorld,
      governance: siliconWorld - 10,
    },
    modules: [
      {
        id: "agent-execution",
        name: "Agent execution",
        category: "autonomy",
        score: 31,
        confidence: 0.6,
        weight: 1,
        bottleneck: "Long tasks",
        summary: "Agents still need supervision.",
        criteria: [
          {
            id: "long-task",
            name: "Long task autonomy",
            score: 24,
            weight: 1,
            rawValue: "METR proxy",
            normalization: "curated",
            source: {
              label: "METR",
              url: "https://metr.org/",
              publisher: "METR",
              accessedAt: `${period}-15`,
              updateCadence: "periodic",
              automationStatus: "semi_automatic",
            },
            observedAt: `${period}-15`,
            confidence: 0.5,
            notes: "Long tasks remain hard.",
          },
        ],
      },
    ],
  };
}

describe("history", () => {
  it("converts snapshots to rich trend entries", () => {
    const trendEntry = toHistoryEntry(snapshot("2026-05", 31));

    expect(trendEntry).toMatchObject(entry("2026-05", 31));
    expect(trendEntry.modules).toEqual([
      {
        id: "agent-execution",
        name: "Agent execution",
        category: "autonomy",
        score: 31,
        confidence: 0.6,
        bottleneck: "Long tasks",
        delta: 0,
      },
    ]);
    expect(trendEntry.criteria[0]).toMatchObject({
      moduleId: "agent-execution",
      moduleName: "Agent execution",
      id: "long-task",
      name: "Long task autonomy",
      score: 24,
      weight: 1,
      confidence: 0.5,
      sourceAutomationStatus: "semi_automatic",
      delta: 0,
    });
  });

  it("calculates module and criterion deltas from a previous entry", () => {
    const previous = {
      ...entry("2026-04", 28),
      modules: [
        {
          id: "agent-execution",
          name: "Agent execution",
          category: "autonomy" as const,
          score: 25,
          confidence: 0.5,
          bottleneck: "Long tasks",
          delta: 0,
        },
      ],
      criteria: [
        {
          moduleId: "agent-execution",
          moduleName: "Agent execution",
          id: "long-task",
          name: "Long task autonomy",
          score: 20,
          weight: 1,
          confidence: 0.4,
          sourceAutomationStatus: "semi_automatic" as const,
          delta: 0,
        },
      ],
    };
    const trendEntry = toHistoryEntry(snapshot("2026-05", 31), previous);

    expect(trendEntry.modules[0].delta).toBe(6);
    expect(trendEntry.criteria[0].delta).toBe(4);
  });

  it("appends a new period", () => {
    const result = upsertHistoryEntry([entry("2026-04", 28)], entry("2026-05", 31));

    expect(result.map((item) => item.period)).toEqual(["2026-04", "2026-05"]);
  });

  it("replaces an existing period instead of duplicating it", () => {
    const result = upsertHistoryEntry(
      [entry("2026-05", 29), entry("2026-04", 28)],
      entry("2026-05", 31),
    );

    expect(result).toHaveLength(2);
    expect(result.find((item) => item.period === "2026-05")?.headlines.siliconWorld).toBe(31);
  });

  it("sorts periods ascending", () => {
    const result = upsertHistoryEntry(
      [entry("2026-06", 32), entry("2026-04", 28)],
      entry("2026-05", 31),
    );

    expect(result.map((item) => item.period)).toEqual(["2026-04", "2026-05", "2026-06"]);
  });
});
