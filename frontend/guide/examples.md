---
description: Usage examples for dep-report - CI/CD integration, monorepos, private registries, and more
---

# Examples

Common usage patterns and real-world scenarios.

## CI/CD Integration

### GitHub Actions - Scheduled Audit

Run on a schedule, auto-commit reports. Your audit trail builds itself:

```yaml
name: Dependency Audit

on:
  schedule:
    - cron: '0 2 * * 1'  # 2 AM every Monday (weekly)
    # Alternative schedules:
    # - cron: '0 2 * * *'  # 2 AM daily (granular audit trail)
    # - cron: '0 2 1,15 * *'  # 2 AM on 1st and 15th (bi-weekly)
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run dependency audit
        run: npx dep-report
      - name: Commit report if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .dep-report/reports/
          git diff --staged --quiet || git commit -m "chore: update dependency report"
          git push
```

### GitHub Actions - PR Enforcement

Fail PRs if major upgrades are rotting. Enforce hygiene at merge time:

```yaml
name: Dependency Check

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run dependency check
        run: npx dep-report
        env:
          FAIL_ON_MAJOR: true  # Exit code 1 if majors found (requires config.json with failConditions.major: true)
```

**See also:** Copy-paste workflows in `examples/github-actions/` directory.

### GitLab CI

```yaml
check-dependencies:
  image: node:18
  script:
    - npm install
    - npx dep-report
  only:
    - main
    - merge_requests
```

### Azure Pipelines

```yaml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
  - script: npm install
    displayName: 'Install dependencies'
  - script: npx dep-report
    displayName: 'Check dependencies'
```

### Package Manager Examples

Install dependencies before running:

::: code-group

```yaml [npm]
- run: npm install
- run: npx dep-report
```

```yaml [pnpm]
- run: pnpm install
- run: npx dep-report
```

```yaml [bun]
- run: bun install
- run: npx dep-report
```

:::

## Monorepo Usage

For monorepos, run `dep-report` in each workspace:

```bash
# Root package.json
{
  "workspaces": ["packages/*"]
}

# Check each workspace
for dir in packages/*/; do
  (cd "$dir" && npx dep-report)
done
```

Or use a script in your root `package.json`:

```json
{
  "scripts": {
    "dep-check": "for dir in packages/*/; do (cd \"$dir\" && npx dep-report); done"
  }
}
```

## Private Registry Configuration

The tool automatically inherits registry settings from your package manager:

```bash
# npm
npm config set registry https://registry.company.com

# pnpm
pnpm config set registry https://registry.company.com

# bun
bun config set registry https://registry.company.com
```

Then run `dep-report` as normal—it will use your configured registry.

## Custom Ignore Patterns

### Ignore Type Definitions

```json
{
  "ignorePatterns": ["@types/*"]
}
```

### Ignore Linting Tools

```json
{
  "ignorePatterns": ["eslint-*", "@eslint/*", "prettier"]
}
```

### Ignore Specific Packages

```json
{
  "ignorePatterns": ["package-name", "another-package"]
}
```

### Combined Example

```json
{
  "ignorePatterns": [
    "@types/*",
    "eslint-*",
    "@eslint/*",
    "typescript",
    "prettier",
    "my-internal-package"
  ]
}
```

## Tracking Upgrade Blockers (Decision Log)

Use notes with keywords to track why packages aren't upgraded:

```json
{
  "react": "BLOCKED: waiting for team migration",
  "lodash": "DEFERRED: Q2 2026 - requires architecture refactor",
  "axios": "ACCEPTED RISK: pinned for stability @platform-team",
  "typescript": "Just a regular note without keywords"
}
```

**Keyword Detection:**
- `BLOCKED:` - Upgrade blocked by external dependency (🔴 badge)
- `DEFERRED:` - Upgrade planned for specific timeframe (🟡 badge)
- `ACCEPTED RISK:` - Risk acknowledged and accepted (🔵 badge)

Keywords are automatically highlighted in reports with badges and counted in the summary.

## Daily Reports Workflow

Generate daily snapshots for tracking over time:

```bash
# Run daily (via cron or scheduled job)
dep-report

# Reports are timestamped:
# .dep-report/reports/2026-01-30_outdated.md
# .dep-report/reports/2026-01-31_outdated.md
# etc.
```

**Track Health Over Time:**

```bash
# Compare reports to see improvement
dep-report compare 2026-01-15 latest
dep-report compare last-month latest
```

Shows packages upgraded, added, removed, and health score improvement.

## Fast Iteration with Cache

When iterating on configuration or notes:

```bash
# First run: full scan (slow)
dep-report

# Edit config.json or notes.json

# Re-run with cache (fast, no network calls)
dep-report --refresh
```

## Report Formats

### Markdown Only

```json
{
  "formats": {
    "markdown": true,
    "html": false
  }
}
```

### HTML Only

```json
{
  "formats": {
    "markdown": false,
    "html": true
  }
}
```

## Custom Stale Thresholds

### Aggressive (6 months)

```json
{
  "staleThreshold": "6 months"
}
```

### Conservative (2 years)

```json
{
  "staleThreshold": "2 years"
}
```

### Days-Based

```json
{
  "staleThreshold": "90 days"
}
```

## Next Steps

- Learn about [Edge Cases](/guide/edge-cases) and limitations
- Check the [API Reference](/api/cli) for all commands
