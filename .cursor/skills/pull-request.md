---
name: workflows:pull-request
description: Create well-structured pull request descriptions that are clear, comprehensive, and easy to review
argument-hint: "[feature branch or PR context]"
---

# Pull Request Structure Guide

Create comprehensive, well-structured pull request descriptions that make reviews faster and more effective.

## Introduction

This guide defines the standard structure for pull requests in this project. A good PR description helps reviewers understand the changes quickly, provides context for future reference, and serves as documentation for the feature.

## PR Structure Template

Every pull request should follow this five-section structure:

### 1. Description

**Purpose:** Quick summary of what the PR does  
**Length:** 2-3 sentences  
**Audience:** Anyone skimming the PR list

```markdown
## Description

[Brief explanation of what this PR accomplishes and how it solves the problem. 
Include technical approach in 1-2 sentences.]
```

**Example:**
```markdown
## Description

This PR introduces a comprehensive three-layer testing infrastructure to ensure code 
quality and prevent regressions before releases. The implementation includes time 
injection for deterministic tests, a mock registry for integration tests, and real 
sandbox fixtures for end-to-end validation.
```

### 2. Motivation

**Purpose:** Explain WHY this change is needed  
**Length:** 1 paragraph problem + 1 paragraph solution  
**Format:** Problem/Solution structure

```markdown
## Motivation

**Problem:**
- [What pain point or issue are we solving?]
- [What was broken, missing, or inefficient?]
- [What was the impact on users/developers?]

**Solution:**
- [High-level approach taken]
- [Key benefits this brings]
- [How this improves the situation]
```

**Example:**
```markdown
## Motivation

**Problem:**
- Age calculations in tests were non-deterministic (using `Date.now()`)
- No way to test enricher logic without making real API calls
- No systematic way to validate the full workflow before releases
- Manual testing was inconsistent and time-consuming

**Solution:**
A three-layer testing strategy:
1. **Unit tests** (~62 tests, <5s) - Fast feedback with mocked dependencies
2. **Integration tests** - Full workflow with mocked network calls
3. **Sandbox tests** (~30s) - Real API validation with intentionally outdated packages

This approach gives us confidence in changes without requiring network access for CI/CD.
```

### 3. Major Changes

**Purpose:** Break down the implementation into digestible sections  
**Length:** 3-7 subsections depending on complexity  
**Format:** Organized by functional area or implementation phase

```markdown
## Major Changes

### 1. [Component/Area Name]
- **What changed**: [Brief description]
- **Why**: [Justification]
- **Impact**: [Who/what is affected]

**Files changed:**
- `path/to/file.ts` - [What changed]
- `path/to/another.ts` - [What changed]

### 2. [Next Component/Area]
[Same structure...]
```

**Guidelines:**
- Use numbered subsections for sequential changes
- Use descriptive subsection titles (not "Changes Part 1")
- Include file paths for major changes
- Highlight breaking changes clearly
- Use tables for data-heavy sections

**Example:**
```markdown
## Major Changes

### 1. Core Refactoring for Testability
- **Time injection**: Added optional `now: Date` parameter to `enrichPackage()` and `enrichPackages()`
  - Enables deterministic age calculations in tests
  - Backwards compatible (defaults to `new Date()`)
  
- **Registry abstraction**: Introduced `IPackageRegistry` interface
  - `NpmRegistryImpl`: Production implementation (real fetch calls)
  - `MockRegistry`: Test implementation (returns pre-defined data)
  - Backwards compatible with string URLs

**Files changed:**
- `src/core/enricher.ts` - Core refactoring
- `src/types/index.ts` - Type definitions (no changes needed)

### 2. Integration Tests with Mocked Network
- Created `src/test/fixtures/mock-registry-data.ts` with sample registry responses
- Enhanced `src/integration.test.ts` with:
  - MockRegistry usage tests
  - Package enrichment validation
  - Report generation snapshot tests
```

### 4. Testing Checklist

**Purpose:** Document what testing was done and results  
**Length:** Comprehensive list with checkmarks  
**Format:** Grouped by test type with status indicators

```markdown
## Testing Checklist

### ✅ Automated Tests
- [x] **Unit tests pass** - `command` (X tests, all passing)
  - [Specific test categories covered]
  
- [x] **Integration tests pass** - `command`
  - [What integration scenarios were tested]
  
- [x] **Type checking passes** - `command`

### ✅ [Additional Test Category]
- [x] **Test name** - `command`
  - Detail 1: ✅ Result
  - Detail 2: ✅ Result
  
### ✅ Manual Validation
- [x] **Visual inspection** - [What was checked]
  - Specific check 1: ✅ Pass
  - Specific check 2: ✅ Pass

### ✅ Backwards Compatibility
- [x] **Existing usage** - No breaking changes
  - [What was verified]
```

**Guidelines:**
- Use checkboxes `- [x]` for completed items
- Use `- [ ]` for items pending review
- Include commands to reproduce tests
- Show concrete results (test counts, timing)
- Group by test type (automated, manual, performance)
- Include backwards compatibility verification

**Example:**
```markdown
## Testing Checklist

### ✅ Automated Tests
- [x] **Unit tests pass** - `bun test` (62 tests, all passing)
  - Core logic tests (detector, normalizer, analyzer)
  - Time parsing tests
  - All tests run in <5 seconds
  
- [x] **Integration tests pass** - Included in `bun test`
  - Init command creates proper structure
  - MockRegistry correctly enriches packages
  - Report generation matches snapshots

### ✅ Manual Validation
- [x] **Visual inspection** - Opened HTML reports in browser
  - All packages visible and formatted correctly
  - Ages display as expected (lodash ~10y, vitest ~3y)
  - Risk colors visible (red for major, orange for minor)
  - No console errors
```

### 5. Additional Sections (Optional)

Include these sections when relevant:

#### Performance Impact
```markdown
## Performance Impact

- **Runtime impact**: [Describe any performance changes]
- **Bundle size**: [If applicable]
- **Memory usage**: [If measured]
- **Benchmark results**: [If applicable]
```

#### Breaking Changes
```markdown
## ⚠️ Breaking Changes

- **Change 1**: [What broke, migration path]
- **Change 2**: [What broke, migration path]

**Migration Guide:**
```

#### Screenshots/Demos
```markdown
## Screenshots

**Before:**
![Before image]

**After:**
![After image]
```

#### Notes
```markdown
## Notes

- Important caveat or consideration
- Known limitations
- Future improvements planned
```

#### Pre-merge Checklist
```markdown
## Pre-merge Checklist

- [x] All tests pass locally
- [x] No linter errors
- [x] Documentation updated
- [ ] Reviewed by maintainer
- [ ] CI passes
```

## Complete Example

Here's a complete PR following this structure:

```markdown
## Description

This PR introduces a comprehensive three-layer testing infrastructure to ensure code quality and prevent regressions before releases. The implementation includes time injection for deterministic tests, a mock registry for integration tests, and real sandbox fixtures for end-to-end validation.

## Motivation

**Problem:**
- Age calculations in tests were non-deterministic (using `Date.now()`)
- No way to test enricher logic without making real API calls
- No systematic way to validate the full workflow before releases
- Manual testing was inconsistent and time-consuming

**Solution:**
A three-layer testing strategy:
1. **Unit tests** (~62 tests, <5s) - Fast feedback with mocked dependencies
2. **Integration tests** - Full workflow with mocked network calls
3. **Sandbox tests** (~30s) - Real API validation with intentionally outdated packages

This approach gives us confidence in changes without requiring network access for CI/CD.

## Major Changes

### 1. Core Refactoring for Testability
- **Time injection**: Added optional `now: Date` parameter to `enrichPackage()` and `enrichPackages()`
  - Enables deterministic age calculations in tests
  - Backwards compatible (defaults to `new Date()`)
  
- **Registry abstraction**: Introduced `IPackageRegistry` interface
  - `NpmRegistryImpl`: Production implementation (real fetch calls)
  - `MockRegistry`: Test implementation (returns pre-defined data)
  - Backwards compatible with string URLs

**Files changed:**
- `src/core/enricher.ts` - Core refactoring
- `src/types/index.ts` - Type definitions (no changes needed)

### 2. Integration Tests with Mocked Network
- Created `src/test/fixtures/mock-registry-data.ts` with sample registry responses
- Enhanced `src/integration.test.ts` with:
  - MockRegistry usage tests
  - Package enrichment validation
  - Report generation snapshot tests
  - Unique test directories to avoid race conditions

## Testing Checklist

### ✅ Automated Tests
- [x] **Unit tests pass** - `bun test` (62 tests, all passing)
  - Core logic tests (detector, normalizer, analyzer)
  - Time parsing tests
  - All tests run in <5 seconds
  
- [x] **Integration tests pass** - Included in `bun test`
  - Init command creates proper structure
  - MockRegistry correctly enriches packages
  - Report generation matches snapshots
  
- [x] **Type checking passes** - `bun run typecheck`

### ✅ Manual Validation
- [x] **Visual inspection** - Opened HTML reports in browser
  - All packages visible and formatted correctly
  - Ages display as expected (lodash ~10y, vitest ~3y)
  - Risk colors visible (red for major, orange for minor)
  - Stale flags correct (>18 months threshold)
  - No console errors

### ✅ Backwards Compatibility
- [x] **Existing CLI usage** - No breaking changes
  - `enrichPackages()` still accepts string URLs
  - Default behavior unchanged
  - All existing code continues to work

## Performance Impact

- **No runtime impact** - Changes only affect tests
- **CI time** - Unit tests remain fast (<5s)
- **Sandbox tests** - Run manually before releases (~30s with cache, ~60s first run)

## Notes

- Sandbox tests intentionally use old packages with deprecation warnings and CVEs (this is the point)
- Cache in `.sandbox-cache/` expires after 7 days
- Fixtures use `typescript@4.5.3` (4.5.0 doesn't exist in registry)
- Sandbox tests are local-only (not in CI yet, planned for Phase 2)

## Pre-merge Checklist

- [x] All tests pass locally
- [x] No linter errors
- [x] Sandbox tests validated
- [x] Documentation updated
- [ ] Reviewed by maintainer
```

## Quick Checklist

When creating a PR, ensure you have:

- [ ] **Description** - Clear 2-3 sentence summary
- [ ] **Motivation** - Problem/Solution format
- [ ] **Major Changes** - Organized by area with file paths
- [ ] **Testing Checklist** - Comprehensive with checkmarks and results
- [ ] **Optional Sections** - Performance, breaking changes, notes as needed
- [ ] **Proper Formatting** - Markdown, headers, lists, code blocks
- [ ] **Concrete Details** - Specific commands, file paths, test counts
- [ ] **Visual Hierarchy** - Easy to skim and find information

## Anti-patterns to Avoid

❌ **Don't:**
- Write vague descriptions like "Fixed some bugs"
- Skip motivation - reviewers need context
- List every file changed without grouping
- Say "tests pass" without showing what was tested
- Use wall-of-text paragraphs
- Include implementation details that belong in commit messages
- Write for yourself - write for reviewers and future maintainers

✅ **Do:**
- Write clear, scannable sections
- Explain WHY not just WHAT
- Group changes logically
- Show comprehensive test coverage
- Use formatting to aid scanning
- Include concrete examples and commands
- Write for your reviewer's understanding

## Tips for Large PRs

For PRs with 20+ files or complex changes:

1. **Add a Table of Contents**
   ```markdown
   ## Table of Contents
   - [Description](#description)
   - [Motivation](#motivation)
   - [Major Changes](#major-changes)
     - [Core Refactoring](#1-core-refactoring-for-testability)
     - [Integration Tests](#2-integration-tests-with-mocked-network)
   - [Testing Checklist](#testing-checklist)
   ```

2. **Use collapsible sections for details**
   ```markdown
   <details>
   <summary>Full list of 50 test cases</summary>
   
   - Test 1
   - Test 2
   ...
   </details>
   ```

3. **Add summary tables**
   ```markdown
   | Component | Files Changed | Tests Added | Status |
   |-----------|--------------|-------------|--------|
   | Core      | 3            | 12          | ✅     |
   | UI        | 8            | 24          | ✅     |
   ```

4. **Link to related docs**
   ```markdown
   See [Design Doc](./docs/design.md) for detailed architecture decisions.
   ```

## Using This Skill

To create a PR using this structure:

```bash
# 1. Ensure your changes are committed and pushed
git push origin feature-branch

# 2. Use this skill to generate PR description
skill: workflows:pull-request feature-branch

# 3. Copy the generated markdown to GitHub PR form
# 4. Review and adjust as needed
# 5. Submit PR
```

Or ask: "Create a PR description for my testing infrastructure changes following the pull-request skill"
