# Sandbox Tests

Manual end-to-end testing with real npm registry calls.

## Prerequisites

- Node.js 18+ (required)
- npm (bundled with Node)
- pnpm (optional) - `npm install -g pnpm`
- bun (optional) - https://bun.sh

Tests will skip package managers that aren't installed.

## Running Tests

```bash
# Run all sandbox tests
bun run test:sandbox

# Validate reports
bun run test:sandbox:validate

# Clean cache (force fresh API calls)
rm -rf .sandbox-cache
```

## Fixtures

Each fixture contains 10 packages with intentionally outdated versions:

- **npm-outdated/** - Tests npm package manager
- **pnpm-basic/** - Tests pnpm package manager
- **bun-basic/** - Tests bun package manager

## Manual Validation

After running tests, visually inspect HTML reports:

```bash
open sandbox/fixtures/npm-outdated/.dep-report/reports/*.html
```

### Checklist

- [ ] All 10 packages visible
- [ ] Ages displayed correctly (lodash ~9y, vitest ~2y)
- [ ] Risk colors visible (red for major, orange/yellow for minor)
- [ ] Stale flags correct (>18 months)
- [ ] Layout is readable and responsive
- [ ] No console errors in browser

## Cache

API responses are cached in `.sandbox-cache/` for 7 days.

- First run: ~15-30 seconds (real API calls)
- Cached runs: ~2-5 seconds (no network)

Cache auto-expires after 7 days.

## Maintenance

**Yearly Review:** Check if package versions need updating (if >10 years old).

Last reviewed: January 2026
