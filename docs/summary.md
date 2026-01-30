# Project Plan: `dep-report`

## 1. Executive Summary

**The Problem**
Dependency updates are often ignored until they cause breakage. Engineers lack visibility into how "stale" their packages are. A package unreleased for 3 years poses a different risk profile than one updated yesterday, yet standard tools treat them similarly. Existing solutions (Renovate/Dependabot) are excellent for automation but can be noisy; teams often need a lightweight, auditable "ledger" of dependency health first.

**The Solution**
`dep-report` is a CLI tool that generates a clear, version-controlled snapshot of outdated dependencies. It runs locally or in CI, enriching `npm outdated` data with publish history ("age") and manual engineering notes.

**Key Philosophy**
* **Snapshot-based:** Reports are stamped with ISO dates (`2026-01-30_outdated.md`), allowing teams to track drift over time.
* **Contained Blast Radius:** The tool touches nothing outside of a single `./dep-report/` directory.
* **Separation of Concerns:** Machine data (versions, ages) is auto-generated. Human context (why we aren't updating) lives in a separate `notes.json` file, ensuring reports can be regenerated without losing manual input.
* **Simple by Default, Extensible by Choice:** Works out-of-the-box with zero config, but supports an `init --include-config` mode for teams who want custom templates and logic hooks.

---

## 2. Directory Structure & Architecture

The tool owns the `./dep-report` namespace exclusively.

### File Layout
```text
/
├── package.json
├── .dep-report/
│   ├── config.json         # (Optional) Settings: thresholds, formats
│   ├── notes.json          # (Optional) Manual annotations (key: package name)
│   ├── bin/
│   │   └── transform.js    # (Optional) JS Hook for data manipulation
│   ├── templates/          # (Optional) Custom Handlebars templates
│   │   ├── markdown.hbs
│   │   └── html.hbs
│   └── reports/            # Output directory (Generated)
│       ├── latest.md
│       ├── latest.html
│       ├── 2026-01-30_outdated.md
│       ├── 2026-01-30_outdated.html
│       └── ...
```

### Data Flow Pipeline

1. **Source:** Run `npm outdated --json` to get raw dependency data.
2. **Enrich:** Query `npm view <pkg> time --json` to calculate Age and Stale Status.
3. **Annotate:** Load `notes.json` and merge manual notes into package objects.
4. **Transform:** (Optional) If `bin/transform.js` exists, pass data through it for custom filtering/sorting.
5. **Render:** Generate Markdown and HTML using internal defaults or custom templates.
6. **Write:** Save to YYYY-MM-DD (snapshot) and latest (mirror) files.

## 3. Implementation Phases

### Phase 1: Core Logic & The "Zero Config" Experience

**Goal:** A functional CLI that produces the standard report structure with no setup required.

**1.1. Data Collection:**

- Implement script to parse `npm outdated`.
- Fetch publish dates to calculate `lastPublishedAt` and age (e.g., "2.5 years").
- Flag `isStale` (default > 2 years).

**1.2. Notes Integration:**

- Read `./dep-report/notes.json` (if exists).
- Inject notes into the data model matching by package name.

**1.3. Output Generation:**

- Ensure `./dep-report/reports/` exists.
- Generate Markdown table (Package, Current, Latest, Risk, Age, Stale, Notes).
- Generate HTML table (simple, unstyled).
- Implement overwrite logic: Update `latest.*` and today's `YYYY-MM-DD.*` files.

### Phase 2: The init Workflow & Configuration

**Goal:** Formalize the setup process for teams who want control.

**2.1. Basic Init (`npx dep-report init`):**

- Creates `./dep-report/reports/`.
- Creates empty `notes.json`.
- Adds `"dep:report": "dep-report"` to `package.json`.

**2.2. Eject Init (`npx dep-report init --include-config`):**

- Creates full structure with `config.json`, `templates/`, and `bin/`.

**2.3. Configuration Logic:**

- Update core logic to respect `config.json` (e.g., changing `staleThreshold` from "2 years" to "1 year").

### Phase 3: Customization & Hooks

**Goal:** Allow users to alter data and layout without forking the tool.

**3.1. Transform Hook:**

- Load `./dep-report/bin/transform.js` if present.
- Allow users to filter packages or add custom fields programmatically before rendering.

**3.2. Custom Templates:**

- Switch to Handlebars (or similar lightweight engine).
- Check for `templates/markdown.hbs` to override default output format.

### Phase 4: CI Integration & Reliability

**Goal:** Make the tool robust for automated pipelines.

**4.1. Gatekeeping:**

- Add CLI flags: `--fail-if-stale` and `--fail-if-major`.
- Return non-zero exit codes to break builds on high risk.

**4.2. CI Recipes:**

- Provide copy-paste patterns for GitHub Actions / GitLab CI (generating reports and uploading artifacts).

## 4. Expected CLI Usage

### Local Run (Standard)

```bash
npx dep-report
# Generates ./dep-report/reports/YYYY-MM-DD_outdated.md
```

### Setup (Simple)

```bash
npx dep-report init
```

### Setup (Advanced)

```bash
npx dep-report init --include-config
```

### CI / Gatekeeping

```bash
npx dep-report --fail-if-stale
```