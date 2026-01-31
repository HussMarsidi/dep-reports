# pnpm-basic Test Fixture

**Last Updated:** January 2026

## Purpose
Test detection of packages at different staleness levels with pnpm package manager.

## Expected Packages
Same as npm-outdated fixture - see that README for package details.

## Visual Validation Checklist
After running `dep-report audit`, verify:
- [ ] All 10 packages appear in report
- [ ] Ages are shown correctly
- [ ] Risk colors visible
- [ ] Stale flags correct
- [ ] Layout is readable
- [ ] No console errors
