# Silicon World Index

Silicon World Index is a static dashboard for tracking two ideas that are often mixed together:

- **AI capability:** how strong AI systems are as tools.
- **AI-led autonomy:** how much AI systems actually perceive, decide, execute, verify, and control real workflows.

The first release is intentionally semi-automatic. It uses curated input data in `data/seed.json`, a tested scoring library, and a deterministic update script that generates `data/latest.json` and `data/history.json`.

## Current Indices

The headline scores are generated from the seed data:

- `Capability Index`: technical strength across models, multimodal systems, science, and compute.
- `Autonomy Index`: closed-loop execution across agents, workflows, memory, robotics, and enterprise control.
- `Governance Index`: safety, auditability, incidents, standards, and policy readiness.
- `Silicon World Index`: weighted aggregate of capability, autonomy, and governance.

The default aggregate weights are:

- Capability: `35%`
- Autonomy: `45%`
- Governance: `20%`

These weights live in `data/seed.json`, not in UI code.

## Data Files

- `data/seed.json`: curated inputs, criteria, weights, sources, confidence, and automation status.
- `data/latest.json`: generated current snapshot.
- `data/history.json`: generated monthly history.

Every criterion includes a source object:

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

Most first-release criteria are `manual` or `semi_automatic` so the dashboard does not imply false precision.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the dashboard:

```bash
pnpm dev
```

Regenerate index data:

```bash
pnpm update:index
```

Run tests:

```bash
pnpm test --run
```

Build:

```bash
pnpm build
```

Build with the GitHub Pages base path:

```bash
VITE_BASE_PATH=/silicon-world-index/ pnpm build
```

## Methodology

Module scores are weighted averages of criteria scores. Headline scores are weighted averages of module scores within each category. The Silicon World Index is a weighted aggregate of capability, autonomy, and governance.

Confidence is displayed separately and is not blended into the score.

The index is designed for trend tracking and structured debate, not as an official or exhaustive measure of AI progress.

## Scheduled Updates

`.github/workflows/update-index.yml` runs monthly and can also be triggered manually. The workflow installs dependencies, runs tests, regenerates JSON data, and commits generated changes if any exist.

The first release does not scrape external sources. Future work should replace criteria one at a time with source adapters while preserving the same JSON schema and tests.

## Deploy to GitHub Pages

This repo includes `.github/workflows/deploy-pages.yml`. After pushing to GitHub:

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Set `Build and deployment` source to `GitHub Actions`.
4. Push to `master` or `main`, or run the `Deploy GitHub Pages` workflow manually.

The workflow runs tests, builds the Vite app with:

```bash
VITE_BASE_PATH=/silicon-world-index/ pnpm build
```

and publishes `dist/` to GitHub Pages.
