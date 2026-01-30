---
description: Get started with dep-report - a zero-config CLI tool for dependency risk analysis
---

# Getting Started

**dep-report** is a zero-config CLI tool that generates version-controlled snapshots of dependency risk. It enriches standard package manager data with publish history and stale status analysis.

## What Problem Does It Solve?

Dependency updates are often ignored until they break builds. Teams lack visibility into *temporal* risk—a package unreleased for 3 years poses different threats than one updated yesterday. Engineers need a lightweight, auditable "ledger" of dependency health.

## Core Philosophy

- **Snapshot-Based**: Reports stamped with ISO dates create an auditable history of technical debt
- **Agnostic & Robust**: Auto-detects package manager (npm/pnpm/bun) and respects local configurations
- **Human-Centric**: Separates machine data from human context (notes system)

## Quick Start

Run in your project directory:

```bash
npx dep-report
```

Or install globally:

::: code-group

```bash [npm]
npm install -g dep-report
```

```bash [pnpm]
pnpm add -g dep-report
```

```bash [bun]
bun add -g dep-report
```

:::

This will:
1. Detect your package manager (npm, pnpm, or bun)
2. Scan for outdated packages
3. Enrich with registry metadata (publish dates, age)
4. Generate reports in `.dep-report/reports/`

## First Run

When you run `dep-report` for the first time:

1. **Detection**: The tool detects your package manager by looking for lockfiles:
   - `pnpm-lock.yaml` → pnpm
   - `bun.lock` or `bun.lockb` → bun
   - `package-lock.json` → npm

2. **Scanning**: Runs `npm outdated --json` (or equivalent) to find outdated packages

3. **Enrichment**: Fetches publish dates from the npm registry for each package

4. **Analysis**: Calculates:
   - **Risk level**: Major/Minor/Patch based on semver diff
   - **Age**: How old is the currently installed version
   - **Stale status**: Whether age exceeds your threshold (default: 18 months)

5. **Reporting**: Generates timestamped reports:
   - `YYYY-MM-DD_outdated.md` - Daily snapshot (markdown)
   - `YYYY-MM-DD_outdated.html` - Daily snapshot (HTML)
   - `latest.md` - Always points to the most recent markdown report
   - `latest.html` - Always points to the most recent HTML report

## Reports Location

All reports are generated in `.dep-report/reports/`:

```
.dep-report/
├── config.json         # Configuration (optional)
├── notes.json          # Custom annotations (optional)
├── .cache.json         # Registry data cache (gitignored)
└── reports/
    ├── latest.md
    ├── latest.html
    ├── 2026-01-30_outdated.md
    └── 2026-01-30_outdated.html
```

## Next Steps

- Learn about [Installation](/guide/installation) options
- Understand [Usage](/guide/usage) patterns
- Configure behavior with [Configuration](/guide/configuration)
- See [Examples](/guide/examples) for common scenarios
