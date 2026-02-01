---
description: Get your first dependency report in 5 minutes
---

# Quick Start

Generate your first dependency report in under 5 minutes.

## Run the Tool

```bash
npx dep-report
```

**What happens:**
1. Detects your package manager (npm, pnpm, or bun)
2. Scans for outdated packages
3. Fetches publish dates from the registry
4. Generates timestamped reports in `.dep-report/reports/`

**Performance:**
- First run: ~10 seconds (fetches metadata from registry)
- Subsequent runs: ~1-2 seconds (uses cached data)

## View Your Report

Open `.dep-report/reports/latest.html` in a browser.

### Understanding the Report Structure

Reports now include three main sections:

1. **Summary Block** - Risk status (🟢 Healthy / 🟡 Degrading / 🔴 At Risk) and key statistics
2. **Action Required** - Prioritized packages grouped by urgency (🔴 Critical / 🟡 Review Soon)
3. **Full Dependency List** - Complete table with all packages

### Understanding the Columns

| Column | What It Shows | Example |
|--------|---------------|---------|
| **Package** | Dependency name | `axios` |
| **Current** | Your installed version | `0.27.2` |
| **Latest** | Available version | `1.6.0` |
| **Age** | Time since YOUR version was published | `18 months` |
| **Behind** | Gap between installed and latest publish dates | `456 days` |
| **Risk** | Update type | `🔴 Major` |
| **Status** | Package status | `✅ Stable` or `Outdated` |
| **Notes** | Your custom context with badges | `🔴 BLOCKED: waiting for migration` |

### Risk Levels

- **Major** (`1.x → 2.x`): Breaking changes likely - review changelog carefully
- **Minor** (`1.1 → 1.2`): New features, usually backward-compatible
- **Patch** (`1.1.1 → 1.1.2`): Bug fixes, lowest risk

### Understanding Age

**Age measures how long YOUR installed version has been published**, not the time since the latest version.

**Example:**
- You're using `axios@0.27.2` (published May 2022)
- Latest is `axios@1.6.0` (published December 2023)
- Age: 18 months

An 18-month-old version has accumulated:
- Potential security issues (even without CVEs)
- Compatibility gaps with modern tooling
- Missing performance improvements
- Higher upgrade friction

### Stale Threshold

**Default: 18 months**

Packages older than this are marked "stale." This threshold is configurable based on your team's needs.

## Initialize Configuration

Create configuration structure with a preset:

```bash
dep-report init                    # Default: production preset
dep-report init --preset starter   # Just visibility, no CI failures
dep-report init --preset strict    # Fail on old dependencies
```

**Presets:**
- **Starter**: 24 months threshold, no CI failures (just visibility)
- **Production**: 12 months threshold, fail on major upgrades (recommended)
- **Strict**: 6 months threshold, fail on stale and major (security-sensitive)

## Add Context with Notes (Decision Log)

Track why you haven't upgraded something using keywords:

```bash
dep-report init  # Creates configuration structure
```

Edit `.dep-report/notes.json`:

```json
{
  "react": "BLOCKED: waiting for team migration",
  "lodash": "DEFERRED: Q2 2026 - requires architecture refactor",
  "axios": "ACCEPTED RISK: pinned for stability @platform-team"
}
```

**Keywords:**
- `BLOCKED:` - Upgrade blocked (🔴 badge in reports)
- `DEFERRED:` - Upgrade planned (🟡 badge in reports)
- `ACCEPTED RISK:` - Risk acknowledged (🔵 badge in reports)

Run `dep-report` again—notes appear in the report with badges and are counted in the summary.

## What to Commit

**Commit to git:**
- `reports/` - The audit trail
- `notes.json` - Your decision context
- `config.json` - Team settings

**Don't commit:**
- `.cache.json` - Registry metadata cache (automatically ignored)

## Common Questions

**How often should I run this?**  
Weekly for ongoing awareness. Before releases for rigor. The reports create a history of dependency health over time.

**Does this update packages automatically?**  
No. This is a reporting and decision-making tool. Use Renovate or Dependabot to automate the actual updates after you've decided what needs updating.

**What if I have no outdated packages?**  
You'll get a success report showing everything is current. This proves you checked, which is useful for audit trails and CI logs.

## Next Steps

- [Understanding Reports](/guide/understanding-reports) - Learn to interpret findings and prioritize updates
- [Configuration](/guide/configuration) - Customize thresholds and behavior for your team
- [Usage](/guide/usage) - Learn about caching and advanced options
