# Silicon World Index Dashboard Design

## Goal

Build the first working version of Silicon World Index as a serious, updateable dashboard for tracking two different ideas:

- AI technical capability: how strong AI systems are as tools.
- AI-led world autonomy: how much AI systems actually perceive, decide, execute, verify, and control real production workflows.

The first release should be useful as a public project foundation without pretending that all inputs are already fully automated or perfectly objective.

## Product Shape

The first version is an index dashboard, not a marketing homepage or long-form report.

The home screen should prioritize:

- Current headline indices.
- Trend over time.
- Module-level scores.
- Clear scoring methodology.
- Source freshness and confidence.

The page may have a polished visual identity, but the design should feel like an analytical tool. It should make uncertainty visible instead of hiding it behind precise-looking numbers.

## Scope

### In Scope

- A Vite, React, and TypeScript static web app.
- JSON-backed data files for latest snapshot and historical trend.
- A scoring library that validates weights and calculates module and headline scores.
- A semi-automated update script that reads curated local source data, recalculates scores, and updates JSON files.
- Tests for scoring math, schema expectations, weight validation, and history update behavior.
- GitHub Actions workflow scaffold for scheduled monthly updates.
- Documentation explaining how to update the data manually and how automation is intended to evolve.

### Out of Scope

- Fully automated scraping of all external data sources in the first release.
- Backend database, authentication, or admin UI.
- Real-time updates.
- Claiming the index is official, exhaustive, or objectively settled.

## User Experience

### Primary Dashboard

The first screen contains:

- Project name: Silicon World Index.
- Last updated date.
- Methodology version.
- Four headline score cards:
  - Silicon World Index.
  - Capability Index.
  - Autonomy Index.
  - Governance Index.
- A trend chart showing historical movement.
- A compact explanation of why capability and autonomy are separated.

### Module Browser

The dashboard lists 10 modules:

- Model intelligence.
- Agent execution.
- Tools and workflows.
- Compute infrastructure.
- Data and memory.
- Multimodal content.
- Robotics and physical world.
- Scientific discovery.
- Enterprise economy.
- Safety and governance.

Each module shows:

- Current module score.
- Confidence.
- Main bottleneck.
- Short rationale.
- A drill-down list of scoring criteria.

### Scoring Details

Each scoring criterion shows:

- Score.
- Weight.
- Raw value or current qualitative input.
- Normalization method.
- Source label and URL.
- Observation date.
- Confidence.
- Notes.

This is the key product improvement over a simple opinion dashboard: every score must be traceable.

### Methodology

The methodology section explains:

- Capability Index measures technical ability.
- Autonomy Index measures closed-loop AI leadership in real systems.
- Governance Index measures auditability, safety maturity, and incident resilience.
- Silicon World Index is a weighted aggregate designed for trend tracking, not a final truth claim.

The copy should be concise and skeptical. The page should make it clear that low autonomy scores are expected under a strict "AI-led world" definition.

## Data Model

The app uses static JSON files:

- `data/latest.json`: current index snapshot.
- `data/history.json`: monthly historical snapshots.
- `data/seed.json`: curated inputs used by the semi-automated update script.

The latest snapshot contains:

- Metadata:
  - `updatedAt`
  - `methodologyVersion`
  - `period`
  - `summary`
- Headline scores:
  - `siliconWorld`
  - `capability`
  - `autonomy`
  - `governance`
- Module list.

Each module contains:

- `id`
- `name`
- `score`
- `category`
- `confidence`
- `weight`
- `bottleneck`
- `summary`
- `criteria`

Each criterion contains:

- `id`
- `name`
- `score`
- `weight`
- `rawValue`
- `normalization`
- `source`
- `observedAt`
- `confidence`
- `notes`

The `source` field should be an object, not a plain string:

- `label`
- `url`
- `publisher`
- `accessedAt`
- `updateCadence`
- `automationStatus`

`automationStatus` is one of:

- `manual`: curated by hand.
- `semi_automatic`: script-assisted but reviewed.
- `automatic`: fetched and normalized without manual changes.

The first release should mark most sources as `manual` or `semi_automatic`. This prevents the UI from implying a false level of automation.

## Scoring Rules

The first implementation should keep scoring simple and testable.

- Module score is the weighted average of criteria scores.
- Headline score is the weighted average of selected module scores by category.
- Silicon World Index is a weighted aggregate of capability, autonomy, and governance headline scores.
- Criteria weights within each module must sum to 1.
- Headline aggregate weights must sum to 1.
- Module weights within each headline category must sum to 1.
- Scores are clamped to 0 through 100 only at data validation boundaries; calculation should reject invalid input rather than silently hide it.
- Confidence is displayed separately and must not be blended into the score.

Suggested headline categories:

- Capability: model intelligence, multimodal content, scientific discovery, compute infrastructure.
- Autonomy: agent execution, tools and workflows, data and memory, robotics and physical world, enterprise economy.
- Governance: safety and governance.

Suggested Silicon World aggregate weights:

- Capability: 35%.
- Autonomy: 45%.
- Governance: 20%.

These weights should live in data/config rather than being hard-coded in UI components.

The first release uses curated sample values based on the previous research conversation. Later releases can replace individual criteria with automated source adapters one by one.

## Technical Architecture

### Frontend

- Vite serves and builds the static app.
- React renders dashboard sections from typed JSON data.
- TypeScript types define the index snapshot.
- Recharts renders line charts and compact module visuals.
- Lucide React provides interface icons.
- CSS lives in app-level styles and should stay restrained, readable, and responsive.

### Scoring Library

`src/lib/scoring.ts` owns:

- Weighted average calculation.
- Weight sum validation.
- Score range validation.
- Headline score calculation.
- Snapshot recalculation from seed data.

It should be independent from React so tests and update scripts can reuse it.

### Update Script

`scripts/update-index.ts` owns:

- Loading curated seed input.
- Recalculating module and headline scores.
- Writing `data/latest.json`.
- Appending or replacing the current period in `data/history.json`.
- Preserving prior history entries.

The script should be deterministic and safe to run repeatedly.

The update script should treat `period` as a monthly `YYYY-MM` identifier. If a history entry already exists for the same period, the script replaces it instead of appending a duplicate.

### GitHub Actions

`.github/workflows/update-index.yml` should:

- Run monthly on a schedule.
- Install dependencies.
- Run tests.
- Run the update script.
- Commit generated JSON changes when any exist.

The workflow is a scaffold in the first release. It should not depend on external scraping yet.

The workflow should run with the minimum required permissions:

- `contents: write` only for committing generated JSON.
- No secrets in the first release.
- No external network dependency beyond dependency installation.

## Error Handling

- The app should show a clear empty/error state if JSON data cannot load.
- The update script should fail loudly on invalid weights, invalid scores, missing sources, or malformed periods.
- Tests should cover invalid weights and duplicate history periods.
- The UI should display source freshness so stale data is visible.
- The UI should visually distinguish calculated scores from manually curated rationale.
- The app should remain usable on mobile widths without overlapping score cards, charts, or module details.

## Testing Strategy

Use Vitest for fast local verification.

Required tests:

- Weighted average calculation.
- Criteria weights must sum to 1.
- Invalid scores are rejected.
- Module score calculation matches weighted criteria.
- Headline score calculation matches configured module weights.
- History update replaces an existing period instead of duplicating it.
- Snapshot generated from seed data has traceable sources for every criterion.
- Headline category weights are validated independently from criterion weights.
- Source automation status is present for every criterion.

Frontend tests can be light in the first release; the highest-risk behavior is scoring and update determinism.

## Implementation Order

1. Scaffold Vite React TypeScript project.
2. Add data model, seed data, and scoring tests.
3. Implement scoring library until tests pass.
4. Add update script and history tests.
5. Build dashboard UI against static JSON.
6. Add GitHub Actions workflow scaffold.
7. Add README with methodology and update instructions.
8. Run tests and build.

## Success Criteria

- `pnpm test` passes.
- `pnpm build` passes.
- `pnpm update:index` regenerates `data/latest.json` and `data/history.json` deterministically.
- The dashboard loads from local data and shows headline scores, trend, modules, criteria, methodology, and sources.
- The repository has enough documentation for a future contributor to update the index without reading the implementation.
