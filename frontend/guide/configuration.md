---
description: Complete configuration reference for dep-report - all options and examples
---

# Configuration

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

**Examples**:
- `"18 months"` (default)
- `"90 days"`
- `"2 years"`
- `"6 months"`

### `ignorePatterns` (string[])

Array of glob patterns to exclude from reports. Uses [minimatch](https://github.com/isaacs/minimatch) for pattern matching.

**Examples**:
- `["@types/*"]` - Ignore all @types packages
- `["eslint-*", "@eslint/*"]` - Ignore eslint-related packages
- `["package-name"]` - Ignore specific package
- `["@types/*", "eslint-*", "typescript", "prettier"]` - Ignore dev dependencies

### `formats` (object)

Controls which report formats are generated:
- `markdown`: Generate markdown reports (`.md`) - default: `true`
- `html`: Generate HTML reports (`.html`) - default: `true`

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
- Be mindful of npm registry rate limits

### `failConditions` (object)

Exit code conditions for CI/CD integration:
- `stale`: Exit with code 1 if any packages exceed `staleThreshold` - default: `false`
- `major`: Exit with code 1 if any packages have major version updates available - default: `false`

**Example** (fail on major updates):
```json
{
  "failConditions": {
    "stale": false,
    "major": true
  }
}
```

### `reportEmptyState` (boolean)

Whether to generate reports when no outdated packages are found. Default: `true`.

When `true`, generates a success report:
```markdown
# Dependency Report (2026-01-30)
✅ All dependencies are up to date
```

When `false`, skips report generation when everything is up to date.

## Configuration Precedence

CLI Args > Config File > Hardcoded Defaults

Currently, CLI arguments are not yet implemented. All configuration comes from `config.json` or defaults.

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

```json
{
  "staleThreshold": "6 months"
}
```

## Next Steps

- See [Examples](/guide/examples) for more configuration scenarios
- Learn about [CLI Commands](/api/cli) for programmatic usage
