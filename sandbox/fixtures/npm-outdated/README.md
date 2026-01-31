# npm-outdated Test Fixture

**Last Updated:** January 2026

## Purpose
Test detection of packages at different staleness levels with npm package manager.

## Expected Packages
- `lodash 4.0.0`: Ancient (2015, ~9 years) - Major behind
- `express 4.16.0`: Old (2018, ~6 years) - Minor behind
- `axios 0.21.1`: Old (2021, ~3 years) - Major behind (CVE)
- `commander 8.0.0`: Medium (2021, ~3 years) - Minor behind
- `chalk 4.1.0`: Old (2020, ~4 years) - Major behind (ESM)
- `@types/node 16.0.0`: Old (2021, ~3 years) - Major behind
- `typescript 4.5.0`: Old (2021, ~3 years) - Minor behind
- `prettier 2.5.0`: Medium (2021, ~3 years) - Minor behind
- `eslint 8.0.0`: Medium (2021, ~3 years) - Minor behind
- `vitest 0.25.0`: Recent (2022, ~2 years) - Minor behind

## Visual Validation Checklist
After running `dep-report audit`, verify:
- [ ] All 10 packages appear in report
- [ ] Ages are shown (lodash ~9y, vitest ~2y)
- [ ] Risk colors visible (red for major, yellow/orange for minor)
- [ ] Stale flags correct (>18 months threshold)
- [ ] Layout is readable
- [ ] No console errors
