import { describe, expect, it } from "vitest";
import { toHistoryEntry, upsertHistoryEntry } from "../src/lib/history";
import type { HistoryEntry, IndexSnapshot } from "../src/types";

function entry(period: string, siliconWorld: number): HistoryEntry {
  return {
    period,
    updatedAt: `${period}-15`,
    siliconWorld,
    capability: siliconWorld + 10,
    autonomy: siliconWorld,
    governance: siliconWorld - 10,
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
    modules: [],
  };
}

describe("history", () => {
  it("converts snapshots to compact history entries", () => {
    expect(toHistoryEntry(snapshot("2026-05", 31))).toEqual(entry("2026-05", 31));
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
    expect(result.find((item) => item.period === "2026-05")?.siliconWorld).toBe(31);
  });

  it("sorts periods ascending", () => {
    const result = upsertHistoryEntry(
      [entry("2026-06", 32), entry("2026-04", 28)],
      entry("2026-05", 31),
    );

    expect(result.map((item) => item.period)).toEqual(["2026-04", "2026-05", "2026-06"]);
  });
});
