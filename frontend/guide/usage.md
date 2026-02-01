---
description: Usage guide for dep-report - commands, reports, notes, and caching
---

# Usage

## Basic Command

```bash
dep-report
```

Scans your project, fetches registry metadata, and generates reports in `.dep-report/reports/`.

## Initialize Configuration

Create configuration files:

```bash
dep-report init                    # Default: production preset
dep-report init --preset starter   # Use starter preset
dep-report init --preset strict    # Use strict preset
```

This creates:
- `.dep-report/config.json` - Settings (stale threshold, formats, etc.)
- `.dep-report/notes.json` - Decision context for specific packages
- `.dep-report/.gitignore` - Ignores cache files

**Presets:**
- **Starter**: 24 months threshold, no CI failures (just visibility)
- **Production**: 12 months threshold, fail on major upgrades (recommended)
- **Strict**: 6 months threshold, fail on stale and major (security-sensitive)

## Report Files

Generated in `.dep-report/reports/`:

```
2026-01-30_outdated.html  # Timestamped snapshot
2026-01-30_outdated.md    # Same data, markdown format
latest.html               # Always points to newest
latest.md                 # Always points to newest
```

Commit timestamped reports to track dependency health over time.

## Adding Notes (Decision Log)

Transform tribal knowledge into auditable decisions. Edit `.dep-report/notes.json`:

```json
{
  "react": "BLOCKED: waiting for team migration",
  "lodash": "DEFERRED: Q2 2026 - requires architecture refactor",
  "axios": "ACCEPTED RISK: pinned for stability @platform-team",
  "typescript": "Just a regular note without keywords"
}
```

**Keyword Detection:**
Notes with keywords (`BLOCKED:`, `DEFERRED:`, `ACCEPTED RISK:`) are automatically highlighted in reports with badges:
- 🔴 **BLOCKED**: Upgrade is blocked by external dependency
- 🟡 **DEFERRED**: Upgrade planned for future
- 🔵 **ACCEPTED RISK**: Risk acknowledged and accepted

Notes appear in reports, creating self-documenting dependency history and decision log.

## Caching

Registry metadata is cached in `.dep-report/.cache.json` (automatically ignored by git).

### Using Cache for Fast Iteration

```bash
dep-report --refresh
```

Uses cached data instead of fetching from registry. Useful for:
- Testing configuration changes
- Updating notes
- Regenerating reports with different formats

Cache is automatically updated on regular `dep-report` runs.

## Report Formats

Control which formats are generated in `config.json`:

```json
{
  "formats": {
    "markdown": true,
    "html": true
  }
}
```

- **HTML**: Best for stakeholder sharing and visual review
- **Markdown**: Best for CI/CD and version control diffs

## Preview Mode (Dry Run)

Preview summary without writing files:

```bash
dep-report --dry-run              # Summary + action required (default)
dep-report --dry-run=summary      # Minimal stats only
dep-report --dry-run=full         # Complete preview with full table
```

Useful for:
- Quick health checks without committing files
- Local experimentation
- CI/CD preview before generating reports

## Health Tracking

Compare reports over time to track dependency health:

```bash
dep-report compare 2025-12-01 latest      # Compare to latest
dep-report compare last-month latest      # Compare last month to today
dep-report compare 2025-12-01 2026-01-31  # Compare specific dates
```

Shows:
- Packages upgraded, added, removed
- Metric deltas (stale count, major upgrades)
- Health score improvement percentage

## Empty State

When all dependencies are current:

```markdown
# Dependency Report (2026-01-30)
✅ All dependencies are up to date
```

This creates an audit trail proving you checked, useful for:
- Compliance documentation
- CI/CD logs
- Team accountability

## Next Steps

- [Configuration](/guide/configuration) - Customize thresholds and behavior
- [Understanding Reports](/guide/understanding-reports) - Learn to interpret findings
- [Examples](/guide/examples) - See common usage patterns
