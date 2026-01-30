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

### Understanding the Columns

| Column | What It Shows | Example |
|--------|---------------|---------|
| **Package** | Dependency name | `axios` |
| **Current** | Your installed version | `0.27.2` |
| **Latest** | Available version | `1.6.0` |
| **Risk** | Update type | `Major` |
| **Age** | Time since YOUR version was published | `18 months` |
| **Stale?** | Exceeds threshold (default: 18 months) | `Yes` |
| **Notes** | Your custom context | `Planned for Q3` |

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

## Add Context with Notes

Track why you haven't upgraded something:

```bash
dep-report init  # Creates configuration structure
```

Edit `.dep-report/notes.json`:

```json
{
  "axios": "Major version requires API migration. Planned for Q3 2026.",
  "webpack": "Evaluating Vite as replacement"
}
```

Run `dep-report` again—notes appear in the report.

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
