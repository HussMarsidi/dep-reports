# dep-report - Requirements & Specifications

## Overview

A zero-config CLI tool that generates version-controlled snapshots of dependency risk, enriching standard package manager data with publish history and stale status analysis.

**Core Capabilities**
- 📊 Auto-detects package manager (npm/pnpm/bun)
- ⏰ Calculates age based on installed version publish date
- 🎯 Risk classification (Major/Minor/Patch/Exotic)
- 📝 Notes system for tracking upgrade blockers
- ⚡ Caching for instant triage workflows
- 📁 Timestamped reports for audit trails


## Edge Cases & Mitigations

Quality assurance checklist for production readiness:

| Category | Edge Case | Mitigation Requirement |
| :--- | :--- | :--- |
| **Prerequisites** | **Missing `node_modules`** | **Pre-flight Check:** Verify `node_modules` exists. Abort with specific "Run npm install first" instruction if missing. |
| **Data Safety** | **Non-Semver Versions** | **Validation:** Check `current` version validity. If `file:`, `git+ssh`, or `URL`, flag Risk as `Exotic` and skip Age calculation. |
| **Data Safety** | **Corrupt JSON** | **Safe Load:** `try/catch` loading of config/notes. Exit with a human-readable syntax error (e.g., "Trailing comma in notes.json"). |
| **Security** | **HTML Injection** | **Sanitization:** Escape all user-generated content (Package Names, Notes) before rendering HTML output to prevent XSS. |
| **Environment** | **Permission Denied** | **Write Check:** Test write permissions on the output folder *before* starting expensive network calls. |
| **Environment** | **Git Noise** | **Hygiene:** `init` ensures `.cache.json` is ignored (by creating an internal `.gitignore` inside `./dep-report/`). |
| **Network** | **Total Offline** | **Connectivity Check:** Perform a single ping before batch processing. Abort if offline with a suggestion to use `--refresh`. |
| **Network** | **Rate Limiting** | **Concurrency Queue:** Network requests must be batched (e.g., chunks of 5) to prevent 429 errors. |
| **Network** | **Registry Failures** | **Fail Soft:** If a specific package query fails (404/401), flag its Age as `Unknown` and continue processing others. |
| **Logic** | **Empty State** | **Success Template:** If `npm outdated` returns empty, bypass processing and render an "All Clear" success report. |
| **Logic** | **Monorepos** | **Scope Constraint:** V1 strictly scans the `package.json` in the Current Working Directory. No workspace traversal. |
| **Config** | **Config Conflict** | **Explicit Precedence:** CLI Args > Config File > Defaults. |

---

## Directory Structure

All tool artifacts live within the `./dep-report` namespace:

```text
/
├── package.json
├── .dep-report/
│   ├── .gitignore          # Ignores .cache.json
│   ├── config.json         # Settings: thresholds, formats, ignore patterns
│   ├── notes.json          # Manual annotations (Key: Package Name, Value: String)
│   ├── .cache.json         # Raw data cache for instant re-runs
│   ├── bin/
│   │   └── transform.js    # (Optional) User hook for data manipulation
│   └── reports/            # Output directory
│       ├── latest.md
│       ├── latest.html
│       ├── 2026-01-30_outdated.md
│       └── ...
```

## Core Features

### Data Pipeline
- **Auto-Detection**: Identify package manager via lockfile presence
- **Normalization**: Unified schema from disparate JSON outputs
- **Enrichment**: Registry API calls for publish dates and age calculation
- **Risk Classification**: Major/Minor/Patch based on semver diff

### Configuration (`config.json`)
```json
{
  "staleThreshold": "18 months",
  "ignorePatterns": ["@types/*"],
  "formats": { "markdown": true, "html": true },
  "concurrency": 5,
  "failConditions": { "stale": false, "major": false },
  "reportEmptyState": true
}
```

### Annotations (`notes.json`)
```json
{
  "lodash": "Blocked by bug #1234",
  "axios": "Waiting for breaking change review"
}
```
Annotations persist across report regeneration and appear in output tables.

### Caching & Triage
- **First run**: Full scan with network enrichment → creates `.cache.json`
- **`--refresh` flag**: Instant triage using cached data (no network calls)
- Enables rapid iteration on config/notes without re-fetching

### Report Outputs
- **Markdown**: Table with Package | Current | Latest | Risk | Age | Stale? | Notes
- **HTML**: Styled table with color-coded risk levels
- **Timestamped**: `YYYY-MM-DD_outdated.*` (daily snapshot) + `latest.*` (symlink)

### CI/CD Integration
- **`--fail-if-stale`**: Exit 1 if any stale dependencies found
- **`--fail-if-major`**: Exit 1 if any major version updates available
- Enables automated dependency gatekeeping in pipelines

## CLI Interface

### Basic Usage
```bash
# Full scan with network enrichment
npx dep-report

# Instant triage using cached data
npx dep-report --refresh

# Initialize project structure
npx dep-report init
```

### CI/CD Usage
```bash
# Fail build if stale dependencies exist
npx dep-report --fail-if-stale

# Fail build if major updates available
npx dep-report --fail-if-major
```

---

## Related Documentation

- **[PROJECT.md](./PROJECT.md)**: Decision logs, architecture decisions, changelog
- **[README.md](../README.md)**: User-facing documentation and installation guide