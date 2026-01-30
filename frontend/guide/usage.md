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
dep-report init
```

This creates:
- `.dep-report/config.json` - Settings (stale threshold, formats, etc.)
- `.dep-report/notes.json` - Decision context for specific packages
- `.dep-report/.gitignore` - Ignores cache files

## Report Files

Generated in `.dep-report/reports/`:

```
2026-01-30_outdated.html  # Timestamped snapshot
2026-01-30_outdated.md    # Same data, markdown format
latest.html               # Always points to newest
latest.md                 # Always points to newest
```

Commit timestamped reports to track dependency health over time.

## Adding Notes

Document why packages aren't upgraded. Edit `.dep-report/notes.json`:

```json
{
  "react": "Major version requires team training. Scheduled for Q3.",
  "webpack": "Evaluating migration to Vite instead.",
  "lodash": "Low usage, acceptable to defer."
}
```

Notes appear in reports, creating self-documenting dependency history.

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
