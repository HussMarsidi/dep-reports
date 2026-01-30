---
description: Usage guide for dep-report - basic commands, reports, notes, and caching
---

# Usage

## Basic Usage

Run in your project directory:

```bash
dep-report
```

This performs a full scan:
1. Detects your package manager
2. Scans for outdated packages
3. Enriches with registry metadata
4. Generates reports

## Initialize Configuration

To customize behavior, initialize the configuration:

```bash
dep-report init
```

This creates:
- `.dep-report/config.json` - Configuration settings
- `.dep-report/notes.json` - Custom annotations
- `.dep-report/.gitignore` - Ignores cache files

## Reports

Reports are generated in `.dep-report/reports/`:
- `YYYY-MM-DD_outdated.md` - Daily snapshot (markdown)
- `YYYY-MM-DD_outdated.html` - Daily snapshot (HTML)
- `latest.md` - Always points to the most recent markdown report
- `latest.html` - Always points to the most recent HTML report

## Report Format

Each report includes a table with:

| Package | Current | Latest | Risk | Age | Stale? | Notes |
|---------|---------|--------|------|-----|--------|-------|
| lodash | 4.17.20 | 4.17.21 | Patch | 2 years | Yes | Known issue |

### Risk Levels

- **Major**: Breaking changes likely (1.x → 2.x)
- **Minor**: New features (1.1 → 1.2)
- **Patch**: Bug fixes (1.1.1 → 1.1.2)
- **Exotic**: Non-semver (file:, git+, workspace:)
- **NotInstalled**: Current version is `-` or empty

### Age Calculation

Age is calculated based on when the **currently installed version** was published, not when the latest version was published. This answers: "How old is the dependency we're actively using?"

### Stale Status

A package is marked as stale if its age exceeds your `staleThreshold` (default: 18 months).

## Adding Notes

Edit `.dep-report/notes.json` to add custom annotations:

```json
{
  "lodash": "Known issue: waiting for v2.0.0 release",
  "axios": "Upgrade blocked by breaking changes"
}
```

Notes appear in reports next to the package entry.

## Caching & Refresh

The tool caches registry data in `.dep-report/.cache.json` (gitignored).

### First Run
- Full scan with network enrichment
- Creates cache for future runs

### Using Cache (Fast)
```bash
dep-report --refresh
```

Re-runs using cached data (no network calls). Perfect for:
- Iterating on configuration
- Updating notes
- Quick re-renders

## Empty State

If no outdated packages are found, the tool generates a success report:

```markdown
# Dependency Report (2026-01-30)
✅ All dependencies are up to date
```

This creates an audit trail even when everything is clean.

## Next Steps

- Learn about [Configuration](/guide/configuration) options
- See [Examples](/guide/examples) for common scenarios
- Check [Edge Cases](/guide/edge-cases) for limitations
