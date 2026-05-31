import type { HistoryEntry, IndexSnapshot } from "../types";

export function toHistoryEntry(snapshot: IndexSnapshot): HistoryEntry {
  return {
    period: snapshot.metadata.period,
    updatedAt: snapshot.metadata.updatedAt,
    siliconWorld: snapshot.headlines.siliconWorld,
    capability: snapshot.headlines.capability,
    autonomy: snapshot.headlines.autonomy,
    governance: snapshot.headlines.governance,
  };
}

export function upsertHistoryEntry(
  history: HistoryEntry[],
  nextEntry: HistoryEntry,
): HistoryEntry[] {
  const withoutPeriod = history.filter((entry) => entry.period !== nextEntry.period);
  return [...withoutPeriod, nextEntry].sort((a, b) => a.period.localeCompare(b.period));
}
