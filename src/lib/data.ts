import type { HistoryEntry, IndexSnapshot } from "../types";

const baseUrl = import.meta.env.BASE_URL;

export async function loadIndexData() {
  const [latest, history] = await Promise.all([
    fetchJson<IndexSnapshot>("data/latest.json"),
    fetchJson<HistoryEntry[]>("data/history.json"),
  ]);

  return { latest, history };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }
  return (await response.json()) as T;
}
