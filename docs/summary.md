# Project Plan: `dep-report`

## 1. Executive Summary

**The Problem**
Dependency updates are often ignored until they break the build. Engineers lack visibility into the *temporal* risk of their stack—a package unreleased for 3 years poses a different threat than one updated yesterday. Teams need a lightweight, auditable "ledger" of dependency health that separates critical upgrades from noise.

**The Solution**
`dep-report` is a zero-config CLI tool that generates version-controlled snapshots of dependency risk. It enriches standard package data with **publish history (Age)** and **Stale Status**, allowing teams to see not just *what* is outdated, but *how badly* it is rotting.

**Core Philosophy**
* **Snapshot-Based:** Reports are stamped with ISO dates (`2026-01-30_outdated.md`), creating an auditable history of technical debt.
* **Agnostic & Robust:** Automatically detects your package manager (`npm` or `pnpm`) and inherits your local environment configuration to handle private registries seamlessly.
* **Human-Centric:** Separates machine data (versions) from human context (notes). Your reasons for postponing upgrades ("Blocked by bug X") are persistent and survive report regeneration.

---

## 2. Edge Cases & Mitigations (Requirements)

The tool must handle the following environmental constraints without crashing. This table serves as the primary "Quality Assurance" checklist.

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

## 3. Directory Specification

The tool must strictly operate within the `./dep-report` namespace.

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

## 4. Feature Specifications

### 4.1. Core Data Engine

- **Auto-Detection:** Identify npm or pnpm usage based on lockfile presence.

- **Normalization:** Convert disparate JSON outputs into a unified schema: `{ name, current, latest, type }`.

- **Enrichment:**
  - Fetch time metadata for every outdated package.
  - Calculate Age (time since latest publish date).
  - Determine Stale Status (Boolean) based on configured threshold.
  - Calculate Semver Risk (Major/Minor/Patch/Exotic/Not Installed).

### 4.2. Configuration System (config.json)

- **staleThreshold:** Accepts human-readable strings (e.g., "18 months", "12w") to define "Stale".

- **ignorePatterns:** Array of globs to exclude specific packages.

- **formats:** Toggle specific output formats (md, html).

### 4.3. Annotation System (notes.json)

- **Persistence:** Notes stored in a standalone JSON file.

- **Injection:** Merged into the report dataset by matching package names.

### 4.4. Caching & Triage Mode

- **Cache Creation:** Successful runs save raw registry data to `.dep-report/.cache.json`.

- **Refresh Flag (`--refresh`):** Skips network requests, loads from cache, re-applies config/notes, and regenerates reports instantly.

### 4.5. Reporting Output

- **Markdown:** Table with columns: Package, Current, Latest, Risk, Age, Stale?, Notes.

- **HTML:** Simplified HTML table mirroring the Markdown.

- **Snapshotting:** Write `YYYY-MM-DD_outdated.*` (daily overwrite) and `latest.*` (mirror).

### 4.6. CI/CD Gatekeeping

- **Exit Codes:** Support flags (`--fail-if-stale`, `--fail-if-major`) to force non-zero exit codes.

## 5. Expected Interface

### Standard Audit (Fetches new data)

```bash
npx dep-report
```

### Triage / Update (Uses cache, instant)

```bash
npx dep-report --refresh
```

### Initialization

```bash
npx dep-report init                 # Basic setup
npx dep-report init --include-config # Eject config & templates
```