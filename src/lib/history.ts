import type { HistoryEntry, IndexSnapshot } from "../types";

export function toHistoryEntry(
  snapshot: IndexSnapshot,
  previousEntry?: HistoryEntry,
): HistoryEntry {
  return {
    period: snapshot.metadata.period,
    updatedAt: snapshot.metadata.updatedAt,
    methodologyVersion: snapshot.metadata.methodologyVersion,
    headlines: snapshot.headlines,
    modules: snapshot.modules.map((module) => {
      const previousModule = previousEntry?.modules.find((item) => item.id === module.id);
      return {
        id: module.id,
        name: module.name,
        category: module.category,
        score: module.score,
        confidence: module.confidence,
        bottleneck: module.bottleneck,
        delta: roundDelta(module.score - (previousModule?.score ?? module.score)),
      };
    }),
    criteria: snapshot.modules.flatMap((module) =>
      module.criteria.map((criterion) => {
        const previousCriterion = previousEntry?.criteria.find(
          (item) => item.moduleId === module.id && item.id === criterion.id,
        );
        return {
          moduleId: module.id,
          moduleName: module.name,
          id: criterion.id,
          name: criterion.name,
          score: criterion.score,
          weight: criterion.weight,
          confidence: criterion.confidence,
          sourceAutomationStatus: criterion.source.automationStatus,
          delta: roundDelta(criterion.score - (previousCriterion?.score ?? criterion.score)),
        };
      }),
    ),
    annotations: [
      {
        type: "data_update",
        title: "Snapshot regenerated",
        note: `Updated ${snapshot.metadata.period} from curated seed data.`,
      },
    ],
  };
}

export function upsertHistoryEntry(
  history: HistoryEntry[],
  nextEntry: HistoryEntry,
): HistoryEntry[] {
  const withoutPeriod = history.filter((entry) => entry.period !== nextEntry.period);
  return [...withoutPeriod, nextEntry].sort((a, b) => a.period.localeCompare(b.period));
}

export function findPreviousHistoryEntry(
  history: HistoryEntry[],
  period: string,
): HistoryEntry | undefined {
  return history
    .filter((entry) => entry.period < period)
    .sort((a, b) => b.period.localeCompare(a.period))[0];
}

function roundDelta(value: number) {
  return Math.round(value * 10) / 10;
}
