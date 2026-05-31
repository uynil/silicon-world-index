# Silicon World Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working Silicon World Index dashboard with traceable static data, tested scoring logic, deterministic semi-automatic updates, and a local preview.

**Architecture:** Use a Vite React TypeScript static app. Keep scoring and data generation independent from React so the UI, tests, and update script share the same model. Store current and historical index snapshots in JSON files committed to the repo.

**Tech Stack:** Vite, React, TypeScript, Vitest, Recharts, Lucide React, tsx, pnpm.

---

## File Structure

- Create `package.json`: scripts and dependencies.
- Create `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`: Vite and TypeScript config.
- Create `src/types/index.ts`: shared data model types.
- Create `src/lib/scoring.ts`: scoring validation and calculation.
- Create `src/lib/history.ts`: history replace/append behavior.
- Create `src/lib/data.ts`: frontend JSON loading helper.
- Create `src/App.tsx`, `src/main.tsx`, `src/styles.css`: dashboard UI.
- Create `data/seed.json`: curated semi-automatic input.
- Create `data/latest.json`, `data/history.json`: generated app data.
- Create `scripts/update-index.ts`: deterministic data update script.
- Create `tests/scoring.test.ts`, `tests/history.test.ts`, `tests/seed.test.ts`: core behavior tests.
- Create `.github/workflows/update-index.yml`: scheduled update scaffold.
- Create `README.md`: project overview, methodology, update workflow.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Add project config and minimal app shell**

Create a Vite React TypeScript app manually rather than using a generator, because the repo is empty and the required shape is small.

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`

Expected: dependencies installed and `pnpm-lock.yaml` created.

- [ ] **Step 3: Verify the shell builds**

Run: `pnpm build`

Expected: Vite production build succeeds.

## Task 2: Scoring Library with TDD

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/scoring.ts`
- Create: `tests/scoring.test.ts`

- [ ] **Step 1: Write failing tests for weighted averages and validation**

Tests:
- `weightedAverage` returns weighted score.
- weight totals must equal 1.
- scores outside 0-100 are rejected.
- module scores are calculated from criteria.
- headline category weights are validated independently.

Run: `pnpm test tests/scoring.test.ts --run`

Expected: fail because `src/lib/scoring.ts` does not exist yet.

- [ ] **Step 2: Implement minimal scoring library**

Implement:
- `weightedAverage`
- `assertValidScore`
- `assertWeightsSumToOne`
- `calculateModuleScore`
- `calculateHeadlineScore`
- `calculateSnapshotScores`

- [ ] **Step 3: Verify tests pass**

Run: `pnpm test tests/scoring.test.ts --run`

Expected: pass.

## Task 3: History Update Behavior with TDD

**Files:**
- Create: `src/lib/history.ts`
- Create: `tests/history.test.ts`

- [ ] **Step 1: Write failing tests for period replacement**

Tests:
- appends a new monthly period.
- replaces an existing period instead of duplicating it.
- sorts periods ascending.

Run: `pnpm test tests/history.test.ts --run`

Expected: fail because `src/lib/history.ts` does not exist yet.

- [ ] **Step 2: Implement history helper**

Implement:
- `upsertHistoryEntry`
- `toHistoryEntry`

- [ ] **Step 3: Verify tests pass**

Run: `pnpm test tests/history.test.ts --run`

Expected: pass.

## Task 4: Seed Data and Update Script with TDD

**Files:**
- Create: `data/seed.json`
- Create: `data/latest.json`
- Create: `data/history.json`
- Create: `scripts/update-index.ts`
- Create: `tests/seed.test.ts`

- [ ] **Step 1: Write failing tests for traceability**

Tests:
- every criterion has source label, URL, publisher, accessed date, update cadence, and automation status.
- automation status is one of `manual`, `semi_automatic`, or `automatic`.
- generated latest snapshot has headline scores consistent with the scoring library.

Run: `pnpm test tests/seed.test.ts --run`

Expected: fail because seed data and update script do not exist yet.

- [ ] **Step 2: Add curated seed data**

Create 10 modules with criteria based on the approved design:
- model intelligence
- agent execution
- tools and workflows
- compute infrastructure
- data and memory
- multimodal content
- robotics and physical world
- scientific discovery
- enterprise economy
- safety and governance

- [ ] **Step 3: Implement update script**

Implement deterministic generation from `data/seed.json` into:
- `data/latest.json`
- `data/history.json`

- [ ] **Step 4: Verify update behavior**

Run:
- `pnpm update:index`
- `pnpm test tests/seed.test.ts --run`

Expected: data files generated and tests pass.

## Task 5: Dashboard UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/lib/data.ts`

- [ ] **Step 1: Implement static JSON loading helper**

Load `/data/latest.json` and `/data/history.json` with an error state.

- [ ] **Step 2: Build dashboard sections**

Add:
- header
- headline score cards
- trend chart
- module cards
- criteria details
- methodology
- source table

- [ ] **Step 3: Verify responsive layout manually**

Run: `pnpm dev`

Open local URL and inspect desktop and mobile widths.

Expected: no overlapping score cards, charts, or module details.

## Task 6: Automation Scaffold and Documentation

**Files:**
- Create: `.github/workflows/update-index.yml`
- Create: `README.md`

- [ ] **Step 1: Add scheduled workflow**

Create a monthly workflow that:
- checks out repo
- installs pnpm dependencies
- runs tests
- runs `pnpm update:index`
- commits JSON changes when present

- [ ] **Step 2: Add README**

Document:
- project purpose
- strict capability vs autonomy distinction
- data files
- update command
- scoring caveats
- source automation statuses

## Task 7: Final Verification

**Files:**
- No new files expected.

- [ ] **Step 1: Run tests**

Run: `pnpm test --run`

Expected: all tests pass.

- [ ] **Step 2: Run build**

Run: `pnpm build`

Expected: Vite build passes.

- [ ] **Step 3: Run update script twice**

Run:
- `pnpm update:index`
- `pnpm update:index`

Expected: second run does not duplicate history for the same period.

- [ ] **Step 4: Start local dev server**

Run: `pnpm dev --host 127.0.0.1`

Expected: local preview URL available for user.
