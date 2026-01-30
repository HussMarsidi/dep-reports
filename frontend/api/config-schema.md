---
description: Complete configuration schema reference for dep-report config.json
---

# Configuration Schema

Complete reference for `config.json` schema and all options.

## Schema Overview

```typescript
interface Config {
  staleThreshold: string;            // e.g., "18 months"
  ignorePatterns: string[];          // Glob patterns
  formats: {
    markdown: boolean;
    html: boolean;
  };
  concurrency: number;               // Registry API batch size
  failConditions: {
    stale: boolean;
    major: boolean;
  };
  reportEmptyState: boolean;         // Create files even if all up-to-date
}
```

## Default Configuration

```json
{
  "staleThreshold": "18 months",
  "ignorePatterns": [],
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

## Field Reference

### `staleThreshold`

**Type**: `string`  
**Default**: `"18 months"`  
**Required**: No

Duration string indicating when a package is considered "stale". Format: `"N days"`, `"N weeks"`, `"N months"`, or `"N years"`.

**Valid formats**:
- `"N days"` - e.g., `"90 days"`
- `"N weeks"` - e.g., `"4 weeks"`
- `"N months"` - e.g., `"18 months"` (default)
- `"N years"` - e.g., `"2 years"`

**Examples**:
```json
{
  "staleThreshold": "18 months"
}
```

```json
{
  "staleThreshold": "90 days"
}
```

```json
{
  "staleThreshold": "2 years"
}
```

### `ignorePatterns`

**Type**: `string[]`  
**Default**: `[]`  
**Required**: No

Array of glob patterns to exclude from reports. Uses [minimatch](https://github.com/isaacs/minimatch) for pattern matching.

**Pattern syntax**:
- `*` - Matches any characters except `/`
- `**` - Matches any characters including `/`
- `?` - Matches single character
- `[...]` - Character class
- `{a,b}` - Brace expansion

**Examples**:
```json
{
  "ignorePatterns": ["@types/*"]
}
```

```json
{
  "ignorePatterns": ["eslint-*", "@eslint/*"]
}
```

```json
{
  "ignorePatterns": ["@types/*", "eslint-*", "typescript", "prettier"]
}
```

### `formats`

**Type**: `object`  
**Default**: `{ "markdown": true, "html": true }`  
**Required**: No

Controls which report formats are generated.

**Properties**:
- `markdown` (boolean): Generate markdown reports (`.md`)
- `html` (boolean): Generate HTML reports (`.html`)

**Examples**:
```json
{
  "formats": {
    "markdown": true,
    "html": true
  }
}
```

```json
{
  "formats": {
    "markdown": true,
    "html": false
  }
}
```

### `concurrency`

**Type**: `number` (integer, positive)  
**Default**: `5`  
**Required**: No

Number of concurrent registry API requests. Increase for faster processing (but be respectful of rate limits).

**Recommendations**:
- Default (5) is safe for most cases
- Increase to 10-15 for faster processing on large projects
- Be mindful of npm registry rate limits

**Examples**:
```json
{
  "concurrency": 5
}
```

```json
{
  "concurrency": 10
}
```

### `failConditions`

**Type**: `object`  
**Default**: `{ "stale": false, "major": false }`  
**Required**: No

Exit code conditions for CI/CD integration.

**Properties**:
- `stale` (boolean): Exit with code 1 if any packages exceed `staleThreshold`
- `major` (boolean): Exit with code 1 if any packages have major version updates available

**Examples**:
```json
{
  "failConditions": {
    "stale": false,
    "major": false
  }
}
```

```json
{
  "failConditions": {
    "stale": true,
    "major": false
  }
}
```

```json
{
  "failConditions": {
    "stale": false,
    "major": true
  }
}
```

### `reportEmptyState`

**Type**: `boolean`  
**Default**: `true`  
**Required**: No

Whether to generate reports when no outdated packages are found.

**When `true`**: Generates a success report:
```markdown
# Dependency Report (2026-01-30)
✅ All dependencies are up to date
```

**When `false`**: Skips report generation when everything is up to date.

**Examples**:
```json
{
  "reportEmptyState": true
}
```

```json
{
  "reportEmptyState": false
}
```

## Validation

The configuration is validated using [Zod](https://zod.dev/). Invalid configurations will result in an error:

```
Invalid config: staleThreshold: Expected string, received number
```

## Configuration Precedence

CLI Args > Config File > Hardcoded Defaults

Currently, CLI arguments are not yet implemented. All configuration comes from `config.json` or defaults.

## Complete Example

```json
{
  "staleThreshold": "18 months",
  "ignorePatterns": [
    "@types/*",
    "eslint-*",
    "@eslint/*",
    "typescript",
    "prettier"
  ],
  "formats": {
    "markdown": true,
    "html": true
  },
  "concurrency": 5,
  "failConditions": {
    "stale": false,
    "major": true
  },
  "reportEmptyState": true
}
```

## Notes Schema

Notes are stored in `.dep-report/notes.json`:

```json
{
  "package-name": "Custom note about this package",
  "another-package": "Another note"
}
```

**Type**: `Record<string, string>`

Notes appear in reports next to the package entry.

## Next Steps

- Learn about [CLI Commands](/api/cli)
- See [Configuration Guide](/guide/configuration) for usage examples
