---
description: Complete configuration reference for dep-report - all options and examples
---

# Configuration

## Philosophy

dep-report works zero-config.

Configuration exists for tuning to YOUR team's needs:
- Your "stale" might be 6 months (startup)
- Your "stale" might be 3 years (regulated)

**Start with defaults. Configure when you feel friction.**

---

Configuration is stored in `.dep-report/config.json`. Run `dep-report init` to create it.

## Configuration Options

```json
{
  "staleThreshold": "18 months",
  "ignorePatterns": ["@types/*", "eslint-*"],
  "formats": {
    "markdown": true,
    "html": true
  },
  "concurrency": 5,
  "failConditions": {
    "stale": false,
    "major": false
  },
  "reportEmptyState": true
}
```

## Options Reference

### `staleThreshold` (string)

Duration string indicating when a package is considered "stale". Format: `"N days"`, `"N weeks"`, `"N months"`, or `"N years"`.

**How to choose**:
- **Fast-moving project?** 6-12 months
- **Legacy system?** 2-3 years
- **Somewhere between?** 18 months (default)

**Examples**:
- `"18 months"` (default) - Balanced for most projects
- `"90 days"` - Aggressive, for security-critical apps
- `"2 years"` - Conservative, for stable legacy systems
- `"6 months"` - Startup pace, frequent updates

**Tuning guidance:**
- Start with default (18 months)
- If you're ignoring most "stale" packages → increase threshold
- If you're surprised by stale packages → decrease threshold
- Review quarterly: Does your threshold match your upgrade velocity?

### `ignorePatterns` (string[])

Array of glob patterns to exclude from reports. Uses [minimatch](https://github.com/isaacs/minimatch) for pattern matching.

**Examples**:
- `["@types/*"]` - Ignore all @types packages
- `["eslint-*", "@eslint/*"]` - Ignore eslint-related packages
- `["package-name"]` - Ignore specific package
- `["@types/*", "eslint-*", "typescript", "prettier"]` - Ignore dev dependencies

**When to use:**
- Dev-only dependencies you don't care about
- Type definitions that auto-update with source
- Tools that are "set and forget"

**When NOT to use:**
- Production dependencies (even if low-risk)
- Packages you're "planning to upgrade" (use notes instead)

### `formats` (object)

Controls which report formats are generated:
- `markdown`: Generate markdown reports (`.md`) - default: `true`
- `html`: Generate HTML reports (`.html`) - default: `true`

**Use cases:**
- **Markdown only**: CI/CD logs, automated processing
- **HTML only**: Management reports, stakeholder sharing
- **Both** (default): Maximum flexibility

**Example** (markdown only):
```json
{
  "formats": {
    "markdown": true,
    "html": false
  }
}
```

### `concurrency` (number)

Number of concurrent registry API requests. Default: `5`. Increase for faster processing (but be respectful of rate limits).

**Recommendations**:
- Default (5) is safe for most cases
- Increase to 10-15 for faster processing on large projects
- Be mindful of npm registry rate limits (40 requests per 10 seconds per IP)

**When to increase:**
- Large projects (100+ dependencies)
- CI/CD runs where speed matters
- You're hitting rate limits (unlikely with default)

### `failConditions` (object)

Exit code conditions for CI/CD integration:
- `stale`: Exit with code 1 if any packages exceed `staleThreshold` - default: `false`
- `major`: Exit with code 1 if any packages have major version updates available - default: `false`

**Use cases:**
- **Pre-release gates**: Fail if critical issues found
- **Quality gates**: Enforce dependency hygiene
- **Warning mode** (default): Report but don't fail

**Example** (fail on major updates):
```json
{
  "failConditions": {
    "stale": false,
    "major": true
  }
}
```

**Warning**: Start with `false` for both. Enable gradually as your team builds upgrade discipline.

### `reportEmptyState` (boolean)

Whether to generate reports when no outdated packages are found. Default: `true`.

When `true`, generates a success report:
```markdown
# Dependency Report (2026-01-30)
✅ All dependencies are up to date
```

When `false`, skips report generation when everything is up to date.

**Why generate empty reports?**
- Audit trail: "We checked on this date"
- CI/CD logs: Proof of dependency review
- Historical comparison: Track when you achieved "all up to date"

## Configuration Precedence

**CLI Args > Config File > Hardcoded Defaults**

**Example:**
```bash
# Config file says 18 months
# CLI says 6 months
dep-report --threshold "6 months"  # Uses 6 months (CLI wins)
```

**Current status:**
- ✅ Config file: Fully supported
- ✅ Defaults: Fallback values
- ⏳ CLI args: Coming in V2 (currently not implemented)

**Best practice:** Use config file for team-wide settings, CLI for one-off overrides (when available).

## Examples

### CI/CD Integration

Fail the build if major updates are available:

```json
{
  "failConditions": {
    "major": true
  }
}
```

```bash
dep-report || exit 1
```

### Ignore Dev Dependencies

```json
{
  "ignorePatterns": ["@types/*", "eslint-*", "@eslint/*", "typescript", "prettier"]
}
```

### Only Markdown Reports

```json
{
  "formats": {
    "markdown": true,
    "html": false
  }
}
```

### Custom Stale Threshold

**Fast-moving startup:**
```json
{
  "staleThreshold": "6 months"
}
```

**Legacy system:**
```json
{
  "staleThreshold": "3 years"
}
```

### Pre-Release Gate

```json
{
  "failConditions": {
    "stale": true,
    "major": false
  }
}
```

Fails if any package is stale (regardless of risk level).

## Next Steps

- See [Examples](/guide/examples) for more configuration scenarios
- Learn about [CLI Commands](/api/cli) for programmatic usage
- [Team Workflows](/guide/workflows) - How teams use configuration