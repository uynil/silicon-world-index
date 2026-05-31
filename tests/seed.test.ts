import { describe, expect, it } from "vitest";
import seed from "../data/seed.json";
import { calculateSnapshotScores } from "../src/lib/scoring";
import type { AutomationStatus, SeedSnapshot } from "../src/types";

const automationStatuses: AutomationStatus[] = ["manual", "semi_automatic", "automatic"];

describe("seed data", () => {
  const seedSnapshot = seed as SeedSnapshot;

  it("has traceable sources for every criterion", () => {
    for (const module of seedSnapshot.modules) {
      for (const criterion of module.criteria) {
        expect(criterion.source.label).toBeTruthy();
        expect(criterion.source.url).toMatch(/^https?:\/\//);
        expect(criterion.source.publisher).toBeTruthy();
        expect(criterion.source.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(criterion.source.updateCadence).toBeTruthy();
        expect(automationStatuses).toContain(criterion.source.automationStatus);
      }
    }
  });

  it("generates scores consistently from seed data", () => {
    const snapshot = calculateSnapshotScores(seedSnapshot);

    expect(snapshot.modules).toHaveLength(10);
    expect(snapshot.headlines.capability).toBeGreaterThan(0);
    expect(snapshot.headlines.autonomy).toBeGreaterThan(0);
    expect(snapshot.headlines.governance).toBeGreaterThan(0);
    expect(snapshot.headlines.siliconWorld).toBeGreaterThan(0);
  });

  it("keeps criteria weights valid in every module", () => {
    for (const module of seedSnapshot.modules) {
      const total = module.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
      expect(total).toBeCloseTo(1, 6);
    }
  });
});
