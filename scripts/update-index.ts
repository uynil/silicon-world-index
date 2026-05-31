import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { calculateSnapshotScores } from "../src/lib/scoring";
import { findPreviousHistoryEntry, toHistoryEntry, upsertHistoryEntry } from "../src/lib/history";
import type { HistoryEntry, SeedSnapshot } from "../src/types";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = resolve(rootDir, "data");

async function main() {
  const seed = await readJson<SeedSnapshot>(resolve(dataDir, "seed.json"));
  const snapshot = calculateSnapshotScores(seed);

  const historyPath = resolve(dataDir, "history.json");
  const existingHistory = await readOptionalJson<HistoryEntry[]>(historyPath, []);
  const previousEntry = findPreviousHistoryEntry(existingHistory, snapshot.metadata.period);
  const history = upsertHistoryEntry(existingHistory, toHistoryEntry(snapshot, previousEntry));

  await writeJson(resolve(dataDir, "latest.json"), snapshot);
  await writeJson(historyPath, history);
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

async function readOptionalJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return await readJson<T>(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

async function writeJson(path: string, value: unknown) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
