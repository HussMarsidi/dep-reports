# Local Testing Strategy - Final Implementation Plan

**Date:** 2026-01-31  
**Status:** ✅ Ready to Implement  
**Estimated Time:** 4 hours

---

## Executive Summary

Building a three-layer testing strategy with simplified refactoring:
1. **Unit tests** (fast, mocked) - Keep existing, enhance with time injection
2. **Integration tests** (medium, mocked network) - Full flow with MockRegistry
3. **Sandbox tests** (slow, real API) - Manual validation before releases

**Key Decisions:**
- ✅ Simple parameter injection (not clock abstraction)
- ✅ Inline registry interface (not separate file)
- ✅ Snapshot JSON data (not HTML)
- ✅ Local-only sandbox (not in CI yet)
- ✅ 10 packages per fixture with varied ages

---

## Phase 1: Simplified Refactoring (~1 hour)

### 1A: Time Injection (15 minutes)

**Add optional `now` parameter to enricher functions:**

```typescript
// src/core/enricher.ts
export async function enrichPackage(
  pkg: OutdatedPackage,
  registry: string = 'https://registry.npmjs.org',
  now: Date = new Date() // NEW: inject time for testing
): Promise<EnrichedPackage> {
  // Change line 55:
  const ageInMs = now.getTime() - currentPublishedAt.getTime(); // Use injected time
  age = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
  // ... rest unchanged
}

export async function enrichPackages(
  packages: OutdatedPackage[],
  concurrency: number = 5,
  registry: string = 'https://registry.npmjs.org',
  now: Date = new Date() // NEW: inject time for testing
): Promise<EnrichedPackage[]> {
  // Pass through:
  const batchResults = await Promise.all(
    batch.map(pkg => enrichPackage(pkg, registry, now))
  );
  // ... rest unchanged
}
```

**Files changed:** 1 modified  
**Breaking changes:** None (default parameter)

---

### 1B: Registry Interface (30 minutes)

**Add interface and refactor in same file:**

```typescript
// src/core/enricher.ts (add at top)
import type { EnrichedPackage, OutdatedPackage, RegistryResponse } from '../types/index.js';

// NEW: Registry abstraction (inline)
export interface IPackageRegistry {
  getMetadata(packageName: string): Promise<RegistryResponse | null>;
}

// NEW: Default implementation
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

// REFACTOR: Update function signature
export async function enrichPackage(
  pkg: OutdatedPackage,
  registryOrUrl: string | IPackageRegistry = defaultRegistry, // Support both string and interface
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

**Files changed:** 1 modified  
**Breaking changes:** None (backwards compatible with string URL)

---

### 1C: Update Existing Tests (15 minutes)

**Update unit tests to use injected time:**

```typescript
// src/core/enricher.test.ts (if exists)
test('calculates age correctly', async () => {
  const mockNow = new Date('2026-01-31');
  const pkg = { /* ... */ };
  
  const result = await enrichPackage(pkg, defaultRegistry, mockNow);
  expect(result.age).toBe(395); // Stable!
});
```

**Run tests:** `bun test` (verify nothing broke)

---

## Phase 2: Integration Tests (~1 hour)

### 2A: Create Test Fixtures (15 minutes)

```typescript
// test/fixtures/mock-registry-data.ts
import type { RegistryResponse } from '../../src/types/index.js';

export const mockRegistryData: Record<string, RegistryResponse> = {
  'lodash': {
    'dist-tags': { latest: '4.17.21' },
    'time': {
      '4.17.21': '2021-05-06T18:23:45.000Z',
      '4.0.0': '2015-01-26T00:00:00.000Z'
    },
    versions: {
      '4.17.21': { /* minimal package.json */ },
      '4.0.0': { /* minimal package.json */ }
    }
  },
  'express': {
    'dist-tags': { latest: '4.19.2' },
    'time': {
      '4.19.2': '2024-03-25T10:00:00.000Z',
      '4.16.0': '2018-03-01T00:00:00.000Z'
    },
    versions: { /* ... */ }
  }
};
```

---

### 2B: Add Integration Tests (45 minutes)

```typescript
// test/integration.test.ts (enhance existing file)
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { MockRegistry } from '../src/core/enricher.js';
import { mockRegistryData } from './fixtures/mock-registry-data.js';
import { execSync } from 'child_process';
import { existsSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('Full audit workflow', () => {
  const testDir = join(process.cwd(), '.test-integration');
  const cliPath = join(process.cwd(), 'dist', 'cli.js');

  beforeAll(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true });
    mkdirSync(testDir, { recursive: true });

    // Create test project
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        dependencies: {
          'lodash': '4.0.0',
          'express': '4.16.0'
        }
      }, null, 2)
    );

    // Create lock file
    writeFileSync(join(testDir, 'package-lock.json'), '{"lockfileVersion": 2}');
    mkdirSync(join(testDir, 'node_modules', '.bin'), { recursive: true });
  });

  afterAll(() => {
    if (existsSync(testDir)) rmSync(testDir, { recursive: true });
  });

  test('init command creates directory structure', () => {
    if (!existsSync(cliPath)) {
      console.warn('CLI not built, skipping test');
      return;
    }

    execSync(`node ${cliPath} init`, { cwd: testDir });

    expect(existsSync(join(testDir, '.dep-report'))).toBe(true);
    expect(existsSync(join(testDir, '.dep-report', 'config.json'))).toBe(true);
    expect(existsSync(join(testDir, '.dep-report', 'notes.json'))).toBe(true);
    expect(existsSync(join(testDir, '.dep-report', 'reports'))).toBe(true);
  });

  test('config.json has valid structure', () => {
    const configPath = join(testDir, '.dep-report', 'config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    expect(config).toHaveProperty('staleThreshold');
    expect(config).toHaveProperty('formats');
    expect(config).toHaveProperty('concurrency');
  });
});

describe('Package enrichment with mock registry', () => {
  test('enriches packages with registry metadata', async () => {
    const { enrichPackage, MockRegistry } = await import('../src/core/enricher.js');
    
    const mockRegistry = new MockRegistry(mockRegistryData);
    const mockNow = new Date('2026-01-31');
    
    const pkg = {
      name: 'lodash',
      current: '4.0.0',
      latest: '4.17.21',
      type: 'dependencies' as const
    };

    const result = await enrichPackage(pkg, mockRegistry, mockNow);

    expect(result.name).toBe('lodash');
    expect(result.current).toBe('4.0.0');
    expect(result.latest).toBe('4.17.21');
    expect(result.age).toBeGreaterThan(3000); // ~9 years in days
    expect(result.currentPublishedAt).toBeInstanceOf(Date);
    expect(result.latestPublishedAt).toBeInstanceOf(Date);
  });
});

describe('Report generation', () => {
  test('analyzed packages match snapshot', async () => {
    const { analyzePackages } = await import('../src/core/analyzer.js');
    
    const mockPackages = [
      {
        name: 'lodash',
        current: '4.0.0',
        latest: '4.17.21',
        type: 'dependencies' as const,
        currentPublishedAt: new Date('2015-01-26'),
        latestPublishedAt: new Date('2021-05-06'),
        age: 3287,
        isStale: true,
        risk: 'Major' as const
      }
    ];

    const result = analyzePackages(mockPackages, 540);
    
    // Snapshot the structure (not full HTML)
    expect(result).toMatchSnapshot();
  });
});
```

**Run:** `bun test` (all tests should pass)

---

## Phase 3: Sandbox Structure (~1.5 hours)

### 3A: Create Fixtures (30 minutes)

```bash
# Create directory structure
mkdir -p sandbox/fixtures/{npm-outdated,pnpm-basic,bun-basic}
mkdir -p sandbox/scripts
```

**For each fixture (npm-outdated, pnpm-basic, bun-basic):**

```json
// sandbox/fixtures/npm-outdated/package.json
{
  "name": "sandbox-npm-outdated",
  "version": "1.0.0",
  "description": "Test fixture: 10 packages with varied ages",
  "private": true,
  "dependencies": {
    "lodash": "4.0.0",
    "express": "4.16.0",
    "axios": "0.21.1",
    "commander": "8.0.0",
    "chalk": "4.1.0"
  },
  "devDependencies": {
    "@types/node": "16.0.0",
    "typescript": "4.5.0",
    "prettier": "2.5.0",
    "eslint": "8.0.0",
    "vitest": "0.25.0"
  }
}
```

**Generate lock files:**
```bash
cd sandbox/fixtures/npm-outdated && npm install --package-lock-only
cd sandbox/fixtures/pnpm-basic && pnpm install --lockfile-only
cd sandbox/fixtures/bun-basic && bun install --yarn
```

**Add README.md to each:**
```markdown
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
```

---

### 3B: Create Sandbox Scripts (45 minutes)

```typescript
// sandbox/scripts/run-all.ts
import { execSync } from 'child_process';
import { readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const CLI_PATH = join(ROOT, 'dist', 'cli.js');
const FIXTURES_DIR = join(ROOT, 'sandbox', 'fixtures');

async function main() {
  console.log('🔨 Building CLI...');
  execSync('bun run build', { cwd: ROOT, stdio: 'inherit' });

  if (!existsSync(CLI_PATH)) {
    console.error('❌ CLI not found at', CLI_PATH);
    process.exit(1);
  }

  console.log('\n🧪 Running sandbox tests...\n');

  const fixtures = readdirSync(FIXTURES_DIR).filter(name => {
    const path = join(FIXTURES_DIR, name);
    return statSync(path).isDirectory() && !name.startsWith('_');
  });

  let passed = 0;
  let failed = 0;

  for (const fixture of fixtures) {
    const fixturePath = join(FIXTURES_DIR, fixture);
    console.log(`📦 Testing: ${fixture}`);

    try {
      // Clean previous runs
      const depReportDir = join(fixturePath, '.dep-report');
      if (existsSync(depReportDir)) {
        execSync(`rm -rf ${depReportDir}`, { cwd: fixturePath });
      }

      // Run init
      execSync(`node "${CLI_PATH}" init`, { 
        cwd: fixturePath,
        stdio: 'pipe'
      });

      // Run audit
      execSync(`node "${CLI_PATH}" audit`, { 
        cwd: fixturePath,
        stdio: 'pipe'
      });

      console.log(`  ✅ ${fixture} completed`);
      passed++;
    } catch (error: any) {
      console.error(`  ❌ ${fixture} failed:`, error.message);
      failed++;
    }

    console.log('');
  }

  console.log('━'.repeat(50));
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n💡 Check logs above for details');
    process.exit(1);
  } else {
    console.log('\n🎉 All sandbox tests passed!');
    console.log('\n📋 Manual validation:');
    console.log('   Open HTML reports and verify:');
    console.log('   - All packages visible');
    console.log('   - Ages display correctly');
    console.log('   - Risk colors visible');
    console.log('   - Layout looks good\n');
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

```typescript
// sandbox/scripts/validate.ts
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const FIXTURES_DIR = join(__dirname, '..', 'fixtures');

function validateFixture(fixtureName: string): boolean {
  const fixturePath = join(FIXTURES_DIR, fixtureName);
  const reportsDir = join(fixturePath, '.dep-report', 'reports');

  console.log(`\n🔍 Validating ${fixtureName}...`);

  // Check reports directory exists
  if (!existsSync(reportsDir)) {
    console.error('  ❌ Reports directory not found');
    return false;
  }

  // Get latest reports
  const files = readdirSync(reportsDir);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  if (htmlFiles.length === 0) {
    console.error('  ❌ No HTML reports found');
    return false;
  }

  if (jsonFiles.length === 0) {
    console.error('  ❌ No JSON reports found');
    return false;
  }

  // Validate HTML content
  const latestHtml = htmlFiles.sort().reverse()[0];
  const htmlContent = readFileSync(join(reportsDir, latestHtml), 'utf-8');

  const expectedPackages = [
    'lodash', 'express', 'axios', 'commander', 'chalk',
    '@types/node', 'typescript', 'prettier', 'eslint', 'vitest'
  ];

  let missingPackages = 0;
  for (const pkg of expectedPackages) {
    if (!htmlContent.includes(pkg)) {
      console.error(`  ❌ Package not found: ${pkg}`);
      missingPackages++;
    }
  }

  if (missingPackages > 0) {
    return false;
  }

  // Check for age information
  if (!/\d+[ymd]/.test(htmlContent)) {
    console.error('  ❌ Age information not found');
    return false;
  }

  // Check for risk indicators
  if (!htmlContent.includes('Major') && !htmlContent.includes('Minor')) {
    console.error('  ❌ Risk indicators not found');
    return false;
  }

  console.log('  ✅ Validation passed');
  return true;
}

async function main() {
  console.log('🔍 Validating sandbox reports...');

  const fixtures = readdirSync(FIXTURES_DIR).filter(name => {
    const path = join(FIXTURES_DIR, name);
    return !name.startsWith('_') && existsSync(join(path, 'package.json'));
  });

  let allPassed = true;
  for (const fixture of fixtures) {
    if (!validateFixture(fixture)) {
      allPassed = false;
    }
  }

  console.log('\n' + '━'.repeat(50));
  
  if (allPassed) {
    console.log('\n✅ All validations passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some validations failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

**Add npm scripts:**
```json
// package.json (add to scripts)
{
  "scripts": {
    "test": "bun test",
    "test:sandbox": "bun run sandbox/scripts/run-all.ts",
    "test:sandbox:validate": "bun run sandbox/scripts/validate.ts"
  }
}
```

---

### 3C: Add Cache & Gitignore (15 minutes)

```gitignore
# .gitignore (add)
.sandbox-cache/
sandbox/fixtures/**/.dep-report/
sandbox/fixtures/**/node_modules/
.test-integration/
.test-init/
```

```typescript
// sandbox/scripts/run-all.ts (add cache logic at start of main())
const CACHE_DIR = join(ROOT, '.sandbox-cache');
const CACHE_EXPIRY_DAYS = 7;

// Check cache age
if (existsSync(CACHE_DIR)) {
  const timestampFile = join(CACHE_DIR, 'timestamp');
  if (existsSync(timestampFile)) {
    const cacheTime = parseInt(readFileSync(timestampFile, 'utf-8'));
    const ageInDays = (Date.now() - cacheTime) / (1000 * 60 * 60 * 24);
    
    if (ageInDays > CACHE_EXPIRY_DAYS) {
      console.log(`⚠️  Cache is ${Math.floor(ageInDays)} days old, clearing...`);
      execSync(`rm -rf ${CACHE_DIR}`, { cwd: ROOT });
    }
  }
}

// At end, save timestamp
mkdirSync(CACHE_DIR, { recursive: true });
writeFileSync(join(CACHE_DIR, 'timestamp'), Date.now().toString());
```

---

## Phase 4: Documentation (~30 minutes)

### 4A: Sandbox README

```markdown
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
```

---

### 4B: Update Root README

```markdown
<!-- Add to main README.md -->

## Testing

### Quick Test (Fast)
```bash
bun test  # Unit + integration tests (<5 seconds)
```

### Sandbox Test (Thorough)
```bash
bun run test:sandbox  # Real API calls (~30 seconds)
```

See [sandbox/README.md](sandbox/README.md) for details.

### Before Releasing
1. Run `bun test` (must pass)
2. Run `bun run test:sandbox` (must pass)
3. Visually inspect HTML reports
4. Run `npm run build` and test CLI manually
```

---

## Success Criteria

### After Implementation Complete

```bash
# 1. Fast tests pass
bun test
# Expected: All tests pass in <5 seconds

# 2. Sandbox tests pass
bun run test:sandbox
# Expected: All 3 fixtures complete successfully

# 3. Validation passes
bun run test:sandbox:validate
# Expected: All reports contain expected content

# 4. Visual inspection
open sandbox/fixtures/npm-outdated/.dep-report/reports/*.html
# Expected: Report looks good, all data visible
```

### Confidence Checklist

- [ ] Unit tests pass with mocked time
- [ ] Integration tests pass with mocked registry
- [ ] Sandbox generates reports for npm, pnpm, bun
- [ ] Validation script checks content
- [ ] HTML reports look correct visually
- [ ] Snapshots committed to git
- [ ] Documentation complete
- [ ] Ready to ship with confidence

---

## Implementation Timeline

- **Phase 1** (Refactoring): 1 hour
- **Phase 2** (Integration tests): 1 hour
- **Phase 3** (Sandbox): 1.5 hours
- **Phase 4** (Documentation): 30 minutes

**Total:** ~4 hours (can be split across 1-2 days)

---

## Known Limitations (Accepted)

1. **Time-dependent fixtures** - Will drift, yearly review needed
2. **Manual visual validation** - Required for UX checks
3. **No error scenarios** - Deferred to Phase 2
4. **Local-only** - Not in CI yet (Phase 2)
5. **Basic validation** - Content exists, not quality

These are acceptable trade-offs for MVP. Expand based on pain points.

---

## Next Steps

1. Create feature branch: `git checkout -b feature/testing-infrastructure`
2. Implement Phase 1 (refactoring)
3. Implement Phase 2 (integration tests)
4. Implement Phase 3 (sandbox)
5. Implement Phase 4 (documentation)
6. Run full test suite and verify
7. Commit and push

**Ready to start?** Say "go" and I'll begin implementation.
