---
description: Usage examples for dep-report - CI/CD integration, monorepos, private registries, and more
---

# Examples

Common usage patterns and real-world scenarios.

## CI/CD Integration

### GitHub Actions

Fail the build if major updates are available:

```yaml
name: Dependency Check

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - name: Check dependencies
        run: |
          npx dep-report
          # Configure to fail on major updates
          # See configuration guide for failConditions
```

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

## Tracking Upgrade Blockers

Use notes to track why packages aren't upgraded:

```json
{
  "notes": {
    "lodash": "Waiting for v5.0.0 release (Q2 2026)",
    "axios": "Blocked by breaking changes in v1.0.0",
    "react": "Upgrade planned for next sprint"
  }
}
```

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
