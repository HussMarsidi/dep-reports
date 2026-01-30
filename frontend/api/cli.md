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
- `--version`: Show version number
- `--help`: Show help message

## Init Command

### `dep-report init`

Scaffolds the `.dep-report/` directory structure.

**Usage**:
```bash
dep-report init
```

**Options**:
- `--include-config`: Force overwrite `config.json` even if it exists

**What it creates**:
- `.dep-report/config.json` - Configuration settings
- `.dep-report/notes.json` - Custom annotations
- `.dep-report/.gitignore` - Ignores cache files
- `.dep-report/reports/` - Reports directory

**Example**:
```bash
$ dep-report init
Created .dep-report/ directory
Created .dep-report/reports/ directory
Created .dep-report/config.json
Created .dep-report/notes.json
Created .dep-report/.gitignore
Initialization complete!
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

### `--help`

Display help message and exit.

**Usage**:
```bash
dep-report --help
```

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
# Create config structure
dep-report init

# Force overwrite config
dep-report init --include-config
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
