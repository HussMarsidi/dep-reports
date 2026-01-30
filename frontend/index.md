---
layout: home
description: Zero-config CLI tool that generates version-controlled snapshots of dependency risk with publish history and stale status
---

hero:
  name: dep-report
  text: Zero-config dependency risk analysis
  tagline: Generate version-controlled snapshots of dependency risk with publish history and stale status
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/hussmarsidi/dep-reports

features:
  - title: Zero Configuration
    details: Works out of the box with npm, pnpm, or bun. No setup required—just run it.
  - title: Age-Based Risk Analysis
    details: See not just what's outdated, but how old your dependencies are. Age calculation based on installed version publish dates.
  - title: Version-Controlled Snapshots
    details: Timestamped reports create an auditable history of technical debt in your repository.
  - title: CI/CD Ready
    details: Fail builds on stale dependencies or major updates. Perfect for automated dependency gatekeeping.
  - title: Smart Caching
    details: Instant triage workflows with cached registry data. Re-run without network calls.
  - title: Human Context
    details: Add notes to track upgrade blockers and decisions. Separates machine data from human context.

---

## Quick Start

Run in your project directory:

```bash
npx dep-report
```

This will:
1. Detect your package manager (npm, pnpm, or bun)
2. Scan for outdated packages
3. Enrich with registry metadata (publish dates, age)
4. Generate reports in `.dep-report/reports/`

## Installation

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

Or use with npx (no installation needed):

```bash
npx dep-report
```

## What It Does

**dep-report** enriches standard package manager data with **publish history (Age)** and **Stale Status**, helping teams see not just *what* is outdated, but *how badly* dependencies are aging.

### Example Output

Reports include:
- **Package**: Package name
- **Current**: Currently installed version
- **Latest**: Latest available version
- **Risk**: Upgrade risk level (Major/Minor/Patch/Exotic)
- **Age**: How old is the version you're using
- **Stale?**: Whether the package exceeds your stale threshold
- **Notes**: Custom annotations you've added

## Project Status

✅ **Production Ready**
- ✅ Package manager detection (npm, pnpm, bun)
- ✅ Outdated package scanning
- ✅ Registry enrichment with age calculation
- ✅ Risk & age calculation
- ✅ Markdown & HTML report generation
- ✅ Configuration system
- ✅ Notes system
- ✅ Comprehensive test suite

## Badges

[![npm version](https://img.shields.io/npm/v/dep-report)](https://www.npmjs.com/package/dep-report)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
