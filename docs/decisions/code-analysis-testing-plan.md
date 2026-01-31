# Code Structure Analysis - Testing Implementation Plan

## Analysis Complete ✅

**Date:** 2026-01-31  
**Reviewed:** `src/core/enricher.ts`, `src/utils/network.ts`, `src/utils/time.ts`, `src/core/analyzer.ts`

---

## 1. Network Call Structure

### Current State: ✅ GOOD - Already Centralized!

**Location:** `src/core/enricher.ts`

```typescript
// Lines 6-27: Single private function handles all network calls
async function fetchPackageMetadata(packageName: string, registry: string): Promise<RegistryResponse | null> {
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' }
  });
  // Error handling: 404 returns null, others throw
}

// Public API:
export async function enrichPackage(pkg: OutdatedPackage, registry: string): Promise<EnrichedPackage>
export async function enrichPackages(packages: OutdatedPackage[], concurrency: number, registry: string): Promise<EnrichedPackage[]>
```

**Assessment:**
- ✅ All npm API calls go through ONE function (`fetchPackageMetadata`)
- ✅ Registry URL is configurable (already accepts custom registry)
- ✅ Basic error handling exists (404 → null, others → null)
- ✅ Rate limiting implemented (500ms between batches)

**Refactoring Effort:** 🟢 **LOW** - Only need to extract interface, not restructure

---

## 2. Time/Date Usage

### Current State: ⚠️ NEEDS WORK - Direct Date.now() calls

**Problem Locations:**

| File | Line | Code | Issue |
|------|------|------|-------|
| `enricher.ts` | 55 | `Date.now() - currentPublishedAt.getTime()` | ❌ Not mockable |
| `cli.ts` | 88, 155 | `new Date()` for report filenames | ✅ OK (not tested) |
| `html.ts` | 62 | `date: Date = new Date()` | ⚠️ Function parameter (can inject) |
| `markdown.ts` | 28 | `date: Date = new Date()` | ⚠️ Function parameter (can inject) |

**Critical Issue:** Line 55 in `enricher.ts`

```typescript
const ageInMs = Date.now() - currentPublishedAt.getTime();
age = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
```

This is the **core age calculation** - must be mockable for stable tests.

**Refactoring Effort:** 🟡 **MEDIUM** - Need to inject clock dependency

---

## 3. Error Handling

### Current State: ⚠️ BASIC - Silent failures

**What exists:**
```typescript
// enricher.ts lines 15-26
if (!response.ok) {
  if (response.status === 404) {
    return null; // Package not found
  }
  throw new Error(`Registry request failed: ${response.status}`);
}
// But catch block returns null anyway!
catch (error) {
  return null; // Swallows ALL errors
}
```

**Problems:**
- ❌ No distinction between 404, 500, timeout, network error
- ❌ Errors are silently ignored (caller doesn't know what failed)
- ❌ No retry logic
- ❌ No logging/telemetry

**Impact on Testing:**
- Can't test error scenarios (all errors → null)
- Can't assert on specific error types
- Need to refactor to expose error details

**Refactoring Effort:** 🟡 **MEDIUM** - Need better error handling before testing it

---

## Recommended Refactoring Strategy (SIMPLIFIED)

### Phase 1A: Add Time Injection (Required for MVP)

**Goal:** Make time calculations mockable with minimal changes

**Decision:** Use simple parameter injection instead of clock abstraction

**Changes:**

```typescript
// src/core/enricher.ts (MODIFIED)
export async function enrichPackage(
  pkg: OutdatedPackage,
  registry: string = 'https://registry.npmjs.org',
  now: Date = new Date() // NEW: inject time for testing
): Promise<EnrichedPackage> {
  // Line 55 change:
  if (currentPublishedAt) {
    const ageInMs = now.getTime() - currentPublishedAt.getTime(); // Use injected time
    age = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
  }
  // ... rest unchanged
}

export async function enrichPackages(
  packages: OutdatedPackage[],
  concurrency: number = 5,
  registry: string = 'https://registry.npmjs.org',
  now: Date = new Date() // NEW: inject time for testing
): Promise<EnrichedPackage[]> {
  // Pass through to enrichPackage:
  const batchResults = await Promise.all(
    batch.map(pkg => enrichPackage(pkg, registry, now))
  );
  // ... rest unchanged
}
```

**Why Simplified:**
- No new files or abstractions needed
- Explicit parameter passing (easy to understand)
- Backwards compatible (default parameter)
- Sufficient for testing needs

**Effort:** ~15 minutes  
**Files Changed:** 1 modified  
**Breaking Changes:** None (default parameter)

---

### Phase 1B: Add Registry Abstraction (Required for MVP)

**Goal:** Make network calls mockable with inline interface

**Decision:** Keep interface in same file, don't create separate registry.ts

**Changes:**

```typescript
// src/core/enricher.ts (MODIFIED - add at top)

// NEW: Registry abstraction (inline)
export interface IPackageRegistry {
  getMetadata(packageName: string): Promise<RegistryResponse | null>;
}

// NEW: Default implementation (inline)
class NpmRegistryImpl implements IPackageRegistry {
  constructor(private baseUrl: string = 'https://registry.npmjs.org') {}
  
  async getMetadata(packageName: string): Promise<RegistryResponse | null> {
    try {
      const url = `${this.baseUrl}/${encodeURIComponent(packageName)}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Registry request failed: ${response.status}`);
      }
      
      return await response.json() as RegistryResponse;
    } catch (error) {
      return null;
    }
  }
}

// NEW: Export for testing
export class MockRegistry implements IPackageRegistry {
  constructor(private data: Record<string, RegistryResponse>) {}
  
  async getMetadata(packageName: string): Promise<RegistryResponse | null> {
    return this.data[packageName] || null;
  }
}

// Default instance
const defaultRegistry: IPackageRegistry = new NpmRegistryImpl();

// REFACTOR: Update function signature (support both string URL and interface)
export async function enrichPackage(
  pkg: OutdatedPackage,
  registryOrUrl: string | IPackageRegistry = defaultRegistry,
  now: Date = new Date()
): Promise<EnrichedPackage> {
  // Handle backwards compatibility
  const registry = typeof registryOrUrl === 'string' 
    ? new NpmRegistryImpl(registryOrUrl)
    : registryOrUrl;
    
  const metadata = await registry.getMetadata(pkg.name);
  // ... rest of logic unchanged
}

// REMOVE: Old fetchPackageMetadata function (logic moved to NpmRegistryImpl)
```

**Why Simplified:**
- One file instead of two
- Less file navigation
- Interface is close to implementation
- Still fully mockable for tests

**Effort:** ~30 minutes  
**Files Changed:** 1 modified  
**Breaking Changes:** None (backwards compatible with string URL)

---

### Phase 1C: Improve Error Handling (Optional for MVP, Required for Phase 2)

**Goal:** Expose error details for testing

**Changes:**

```typescript
// src/types/index.ts (ADD)
export type RegistryError = {
  type: '404' | '500' | 'timeout' | 'network' | 'parse';
  message: string;
  packageName: string;
};

export type EnrichedPackage = {
  // ... existing fields
  error?: RegistryError; // NEW: optional error field
};
```

```typescript
// src/core/registry.ts (MODIFIED)
export class NpmRegistry implements IPackageRegistry {
  async getMetadata(packageName: string): Promise<RegistryResponse | null> {
    try {
      // ... fetch logic
      if (response.status === 404) {
        throw { type: '404', message: 'Package not found', packageName };
      }
      if (response.status >= 500) {
        throw { type: '500', message: 'Registry error', packageName };
      }
      // ... parse response
    } catch (error) {
      if (error.type) throw error; // Re-throw our errors
      throw { type: 'network', message: 'Network error', packageName };
    }
  }
}
```

```typescript
// src/core/enricher.ts (MODIFIED)
export async function enrichPackage(
  pkg: OutdatedPackage,
  registryInstance: IPackageRegistry = registry,
  clockInstance: IClock = clock
): Promise<EnrichedPackage> {
  try {
    const metadata = await registryInstance.getMetadata(pkg.name);
    // ... success path
  } catch (error) {
    // Return package with error details
    return {
      ...pkg,
      currentPublishedAt: null,
      latestPublishedAt: null,
      age: null,
      isStale: false,
      risk: 'Exotic',
      error: error as RegistryError, // NEW: preserve error
    };
  }
}
```

**Effort:** ~1.5 hours  
**Files Changed:** 3 modified  
**Breaking Changes:** None (error field is optional)  
**Defer to:** Phase 2 (after MVP tests working)

---

## Fixture Package Selection (Question 4)

### Recommended 10 Packages Per Fixture

**Criteria:**
- Popular packages (realistic)
- Mix of ages (ancient, old, recent)
- Mix of semver (major, minor, patch)
- Mix of types (runtime deps, dev deps, types)

**Recommended List:**

```json
{
  "dependencies": {
    "lodash": "4.0.0",          // 2015 - Ancient (9y) - Major behind
    "express": "4.16.0",        // 2018 - Old (6y) - Minor behind
    "axios": "0.21.1",          // 2021 - Old (3y) - Major behind (security!)
    "commander": "8.0.0",       // 2021 - Medium (3y) - Minor behind
    "chalk": "4.1.0"            // 2020 - Old (4y) - Major behind (v5 is ESM-only)
  },
  "devDependencies": {
    "@types/node": "16.0.0",    // 2021 - Old (3y) - Major behind
    "typescript": "4.5.0",      // 2021 - Old (3y) - Minor behind
    "prettier": "2.5.0",        // 2021 - Medium (3y) - Minor behind
    "eslint": "8.0.0",          // 2021 - Medium (3y) - Minor behind
    "vitest": "0.25.0"          // 2022 - Recent (2y) - Minor behind
  }
}
```

**Age Distribution:**
- Ancient (>7 years): 1 package (lodash)
- Old (4-6 years): 4 packages (express, axios, chalk, @types/node)
- Medium (2-3 years): 4 packages (commander, typescript, prettier, eslint)
- Recent (1-2 years): 1 package (vitest)

**Semver Distribution:**
- Major behind: 4 packages (lodash, axios, chalk, @types/node)
- Minor behind: 5 packages (express, commander, typescript, prettier, eslint)
- Patch behind: 1 package (vitest)

**Why These Packages?**
- ✅ Extremely popular (everyone knows them)
- ✅ Real versions that existed
- ✅ Varied ages (tests all risk levels)
- ✅ axios 0.21.1 had CVE (good security test case)
- ✅ chalk 4→5 is major ESM migration (good breaking change example)

---

## Implementation Order (Refined)

### Before Starting
- [x] Review decision log
- [x] Analyze code structure
- [x] Decide on fixture packages
- [ ] Create feature branch

### Phase 1A: Time Injection (~15 min)
1. Update `src/core/enricher.ts` to add `now: Date` parameter
2. Update `enrichPackage` and `enrichPackages` to use injected time
3. Update existing unit tests to pass mock Date
4. Run tests, verify nothing broke

### Phase 1B: Registry Abstraction Inline (~30 min)
1. Add `IPackageRegistry` interface in `src/core/enricher.ts`
2. Create `NpmRegistryImpl` and `MockRegistry` classes (inline)
3. Refactor `enrichPackage` to accept string or interface
4. Remove old `fetchPackageMetadata` function
5. Run tests, verify nothing broke

### Phase 1C: Integration Tests (~1 hour)
1. Create `test/fixtures/mock-packages.json` with test data
2. Update `src/integration.test.ts`:
   - Add full audit flow test with `MockRegistry`
   - Add test for each package manager (skip if missing)
   - Verify report files generated
3. Run `bun test`, verify passes

### Phase 1D: Sandbox Structure (~30 min)
1. Create `sandbox/fixtures/npm-outdated/` with recommended packages
2. Create `sandbox/fixtures/pnpm-basic/` (copy of npm)
3. Create `sandbox/fixtures/bun-basic/` (copy of npm)
4. Add lock files to each fixture
5. Add README.md documenting expected behavior

### Phase 1E: Sandbox Scripts (~1 hour)
1. Create `sandbox/scripts/run-all.ts`:
   - Loop through fixtures
   - Run `dep-report init` and `dep-report audit`
   - Collect results
2. Create `sandbox/scripts/validate.ts`:
   - Check report files exist
   - Grep for expected content (package names, versions, ages)
   - Exit with error if validation fails
3. Add npm scripts: `test:sandbox`, `test:sandbox:validate`
4. Test manually: `bun run test:sandbox`

### Phase 1F: Snapshot Tests (~15 min)
1. Add snapshot tests in `test/integration.test.ts`:
   - Analyzed package data structure (JSON, not HTML)
   - Assert on HTML elements (not full HTML snapshot)
2. Run `bun test --update-snapshots` to create baselines
3. Verify snapshots committed to git

**Note:** Snapshotting data structure instead of full HTML to avoid noisy diffs

### Phase 1G: Cache Implementation (~30 min)
1. Create `.sandbox-cache/` directory (gitignored)
2. Update `sandbox/scripts/run-all.ts`:
   - Check cache age
   - Clear if >7 days old
   - Save timestamp after run
3. Test: run twice, second run should be fast

### Phase 1H: Documentation (~30 min)
1. Create `sandbox/README.md`:
   - How to run sandbox tests
   - Prerequisites (Node, npm, pnpm optional, bun optional)
   - Visual validation checklist
2. Update root `README.md`:
   - Add "Testing" section
   - Link to sandbox README
3. Commit decision log to `docs/decisions/testing-strategy-2026-01.md`

### Total Estimated Time: ~4 hours
(Simplified from 6 hours - parameter injection instead of abstractions)
(Can be spread over 1-2 days with breaks and testing)

---

## Success Criteria

### After Phase 1 Complete
```bash
# Fast tests (should pass in <5 seconds)
bun test

# Sandbox tests (should pass in ~30 seconds)
bun run test:sandbox

# Manual validation
open sandbox/fixtures/npm-outdated/.dep-report/reports/*.html
# Verify:
# - [ ] 10 packages visible
# - [ ] Ages shown correctly (lodash ~9 years, vitest ~2 years)
# - [ ] Risk colors visible (red for major, yellow for minor)
# - [ ] Layout looks good
# - [ ] No console errors
```

### Confidence Checklist
- [ ] Can mock time in tests (time injection works)
- [ ] Can mock network in tests (registry interface works)
- [ ] Integration tests cover full flow (init + audit + report)
- [ ] Sandbox runs against 3 package managers (npm, pnpm, bun)
- [ ] Snapshots catch unintended output changes
- [ ] Manual visual inspection confirms quality
- [ ] Ready to ship with confidence

---

## Known Limitations (Accepted)

1. **Time-dependent fixtures** - Will drift over time (yearly review needed)
2. **Manual visual inspection** - Still required for UX validation
3. **No error scenario tests** - Deferred to Phase 2
4. **No CI integration** - Local-only for MVP
5. **Basic validation** - Only checks content exists, not quality
6. **Single registry** - Only tests npm registry, not custom registries

These are acceptable for MVP. Expand based on pain points.

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Refactoring breaks production | Medium | High | Keep default parameters, backwards compatible |
| Tests take too long | Low | Medium | Optimize if >10s, but 6 hours setup is one-time |
| Snapshots too noisy | Medium | Low | Can split into smaller snapshots if needed |
| Fixtures become stale | High | Low | Yearly review (acceptable trade-off) |
| Contributors can't run sandbox | Low | Medium | Document prerequisites, skip if missing |

---

## Decision: Simplified Approach ✅

**Finalized:** 2026-01-31

After discussion, we simplified the refactoring strategy:

1. ✅ **Time injection via parameter** (not clock abstraction)
   - Simpler to understand
   - Less code to maintain
   - Still fully testable
   
2. ✅ **Registry interface inline** (not separate file)
   - One file instead of two
   - Interface near implementation
   - Still mockable for tests

3. ✅ **Snapshot data structure** (not full HTML)
   - Smaller diffs
   - Easier to review
   - Less brittle

**Time saved:** 2 hours (from 6h to 4h)

## Next Action

Ready to implement Phase 1A (Time Injection)?

**Command to start:**
```bash
git checkout -b feature/testing-infrastructure
mkdir -p test/fixtures sandbox/{fixtures,scripts}
```

**Implementation order:**
1. Phase 1A: Time injection (15 min)
2. Phase 1B: Registry inline (30 min)
3. Phase 1C: Integration tests (1 hour)
4. Phase 3: Sandbox (1.5 hours)
5. Phase 4: Documentation (30 min)

**Total:** ~4 hours

See `docs/todos/local-testing-strategy.md` for detailed implementation steps.

Say "go" and I'll start implementing, or ask any questions first.
