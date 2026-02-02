---
description: Complete configuration reference for dep-report - all options and examples
---

# Configuration

dep-report works zero-config out of the box. Configuration lets you tune behavior for your team's needs.

Create configuration files with:

```bash
dep-report init                    # Default: production preset
dep-report init --preset starter   # Use starter preset
dep-report init --preset strict    # Use strict preset
```

This creates `.dep-report/config.json` where you can customize settings.

## Presets

Presets provide opinionated configurations for common use cases:

### Starter (Visibility Only)
```json
{
  "staleThreshold": "24 months",
  "failConditions": { "stale": false, "major": false },
  "reportEmptyState": true
}
```
**Message:** *"Just getting visibility - no CI failures"*  
**Use Case:** Teams beginning their dependency hygiene journey

### Production (Recommended Default)
```json
{
  "staleThreshold": "12 months",
  "failConditions": { "stale": false, "major": true },
  "reportEmptyState": true
}
```
**Message:** *"Prevent major upgrades from rotting indefinitely"*  
**Use Case:** Mature teams with CI/CD integration

### Strict (Security-Sensitive)
```json
{
  "staleThreshold": "6 months",
  "failConditions": { "stale": true, "major": true },
  "reportEmptyState": true
}
```
**Message:** *"Old dependencies break builds"*  
**Use Case:** Financial, healthcare, or security-critical systems

**Using Presets:**
```bash
dep-report init --preset production  # Recommended for most teams
```

You can still customize the generated `config.json` after initialization.

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
  "reportEmptyState": true,
  "comparison": {
    "enabled": true,
    "formats": { "markdown": true, "html": true }
  }
}
```

## Options Reference

### `staleThreshold` (string)

Duration string indicating when a package is considered "stale". Format: `"N days"`, `"N weeks"`, `"N months"`, or `"N years"`.

**Common values:**
- `"18 months"` (default) - Balanced for most projects
- `"12 months"` - For teams with frequent updates
- `"24 months"` - For stable, slow-moving projects
- `"6 months"` - For security-critical applications

**Tuning:**
- Start with the default
- If most "stale" packages seem fine, increase the threshold
- If you're finding issues in packages below the threshold, decrease it
- Review quarterly and adjust based on your actual update cadence

### `ignorePatterns` (string[])

Array of glob patterns to exclude from reports. Uses [minimatch](https://github.com/isaacs/minimatch) for pattern matching.

**Examples**:
- `["@types/*"]` - Ignore all @types packages
- `["eslint-*", "@eslint/*"]` - Ignore eslint-related packages
- `["package-name"]` - Ignore specific package
- `["@types/*", "eslint-*", "typescript", "prettier"]` - Ignore dev dependencies

**Typical use cases:**
- Type definition packages (`@types/*`)
- Dev tools that don't affect production (`eslint`, `prettier`)
- Internal workspace packages

**Better handled with notes:**
- Packages you plan to upgrade later
- Production dependencies (track them even if low-priority)

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

### `comparison` (object)

Configuration for comparison report generation.

- `enabled`: Generate files by default when running `compare`. Default: `true`.
- `formats`: Which formats to generate (`markdown`, `html`).

**Use cases:**
- **Auto-save**: Keep history of all comparisons.
- **CI/CD Integration**: Save artifacts for build pipelines.

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

## Preset vs Custom Configuration

**When to use presets:**
- Quick setup for new projects
- Standard team configurations
- Starting point for customization

**When to use custom config:**
- Project-specific requirements
- Fine-tuned thresholds
- Special ignore patterns

**Best practice:** Start with a preset, then customize as needed.

## Next Steps

- See [Examples](/guide/examples) for more configuration scenarios
- Learn about [CLI Commands](/api/cli) for programmatic usage
- [Understanding Reports](/guide/understanding-reports) - Learn to interpret findings