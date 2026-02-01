---
description: Complete CLI reference for dep-report - all commands, options, and exit codes
---

# CLI Commands

Complete reference for all CLI commands and options.

## Default Command

### `dep-report`

Runs a full dependency audit and generates reports.

**Usage**:
```bash
dep-report
```

**What it does**:
1. Detects package manager (npm, pnpm, or bun)
2. Scans for outdated packages
3. Enriches with registry metadata (publish dates, age)
4. Generates reports in `.dep-report/reports/`

**Exit codes**:
- `0`: Success (or configured fail conditions not met)
- `1`: Error or fail condition triggered

**Options**:
- `--refresh`: Use cached registry data (no network calls)
- `--dry-run [level]`: Preview summary without writing files (`summary`|`actions`|`full`, default: `actions`)
- `--version`: Show version number
- `--help`: Show help message

## Init Command

### `dep-report init`

Scaffolds the `.dep-report/` directory structure with optional preset configuration.

**Usage**:
```bash
dep-report init
```

**Options**:
- `--include-config`: Force overwrite `config.json` even if it exists
- `--preset <preset>`: Use a preset configuration (`starter`|`production`|`strict`, default: `production`)

**What it creates**:
- `.dep-report/config.json` - Configuration settings
- `.dep-report/notes.json` - Custom annotations
- `.dep-report/.gitignore` - Ignores cache files
- `.dep-report/reports/` - Reports directory

**Examples**:
```bash
# Default initialization (production preset)
$ dep-report init
Created .dep-report/ directory
Created .dep-report/reports/ directory
Created .dep-report/config.json
Created .dep-report/notes.json
Created .dep-report/.gitignore
Initialization complete!

# Use a specific preset
$ dep-report init --preset strict
Using preset: Strict - Old dependencies break builds
Created .dep-report/config.json
...

# Force overwrite existing config
$ dep-report init --include-config --preset starter
```

## Options

### `--refresh`

Use cached registry data instead of making network calls.

**Usage**:
```bash
dep-report --refresh
```

**When to use**:
- Iterating on configuration
- Updating notes
- Quick re-renders without network delay
- Offline development

**Note**: Requires `.dep-report/.cache.json` from a previous run.

### `--version`

Display version number and exit.

**Usage**:
```bash
dep-report --version
```

**Output**:
```
0.0.1
```

### `--dry-run`

Preview summary without writing report files.

**Usage**:
```bash
dep-report --dry-run              # Default: summary + action required
dep-report --dry-run=summary      # Minimal stats only
dep-report --dry-run=actions      # Stats + top priority items (default)
dep-report --dry-run=full         # Stats + actions + complete table
```

**When to use**:
- Quick health check without committing files
- Local experimentation
- CI/CD preview before generating reports

**Note**: Still honors `failConditions` in config.json (exits with code 1 if conditions met).

### `--help`

Display help message and exit.

**Usage**:
```bash
dep-report --help
```

## Compare Command

### `dep-report compare`

Compare two dependency reports to track health over time.

**Usage**:
```bash
dep-report compare <from> <to>
```

**Arguments**:
- `<from>`: Start date (`YYYY-MM-DD`), `"latest"`, or `"last-month"`
- `<to>`: End date (`YYYY-MM-DD`) or `"latest"`

**Examples**:
```bash
# Compare specific dates
dep-report compare 2025-12-01 2026-01-31

# Compare to latest report
dep-report compare 2025-12-01 latest

# Compare last month to today
dep-report compare last-month latest
```

**Output**:
- Shows packages upgraded, added, removed
- Displays metric deltas (stale count, major upgrades)
- Calculates health score improvement percentage
- Exit code 0 if improved, 1 if regressed

**Use case**: Monthly team reviews, tracking progress on dependency hygiene initiatives.

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Error or fail condition triggered |

### Fail Conditions

Exit code `1` is returned when:
- Any error occurs (missing node_modules, registry unreachable, etc.)
- `failConditions.stale: true` and stale packages found
- `failConditions.major: true` and major updates available

## Examples

### Basic Usage

```bash
# Full scan
dep-report

# Use cache
dep-report --refresh
```

### CI/CD Integration

```bash
# Fail on major updates
dep-report || exit 1
```

Configure `failConditions` in `config.json`:
```json
{
  "failConditions": {
    "major": true
  }
}
```

### Initialization

```bash
# Create config structure (production preset)
dep-report init

# Use specific preset
dep-report init --preset strict

# Force overwrite config
dep-report init --include-config --preset starter
```

### Preview Mode

```bash
# Quick health check
dep-report --dry-run

# Minimal output
dep-report --dry-run=summary

# Full preview
dep-report --dry-run=full
```

### Health Tracking

```bash
# Compare reports over time
dep-report compare 2025-12-01 latest

# Compare last month to today
dep-report compare last-month latest
```

## Error Messages

### No Package Manager Detected

```
No package manager detected. Please ensure you have package-lock.json, pnpm-lock.yaml, bun.lock, or bun.lockb in your project.
```

**Solution**: Run `npm install`, `pnpm install`, or `bun install`.

### Registry Unreachable

```
Unable to reach the npm registry.
If you have a cache, try running with --refresh.
```

**Solution**: Check internet connection or use `--refresh` with cached data.

### Missing node_modules

```
node_modules directory not found. Please run 'npm install' (or equivalent) first.
```

**Solution**: Run `npm install`, `pnpm install`, or `bun install`.

## Next Steps

- Learn about [Configuration Schema](/api/config-schema)
- See [Usage Examples](/guide/examples) for common scenarios
