# Implementation Plan: `dep-report`

## Tech Stack (Final)

### Core Dependencies
- **Runtime**: Bun (dev) + Node.js 18+ (production target)
- **Language**: TypeScript 5.x (strict mode)
- **CLI Framework**: `commander` (lightweight, industry standard)
- **HTTP Client**: Native `fetch` (available in both Bun & Node 18+)
- **Date Parsing**: `date-fns` (2.3 kB, battle-tested)
- **Semver**: `semver` (official package)
- **HTML Sanitization**: `escape-html` (280 bytes)
- **Build Tool**: `tsup` (esbuild wrapper, outputs single executable)

### Package Manager Support Matrix
| Manager | Detection Method | Command | Priority |
|---------|-----------------|---------|----------|
| **npm** | `package-lock.json` exists | `npm outdated --json` | P0 |
| **pnpm** | `pnpm-lock.yaml` exists | `pnpm outdated --json` | P0 |
| **bun** | `bun.lockb` exists | `bun outdated --json` | P0 |
| **yarn** | `yarn.lock` exists + no other lock | `yarn outdated --json` | P1 (defer if complex) |

**Decision**: Implement npm/pnpm/bun first. Add yarn only if output format is compatible (same JSON schema).

---

## Project Structure

```
dep-report/
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── src/
│   ├── cli.ts                          # Entry point, commander setup
│   ├── commands/
│   │   ├── audit.ts                    # Main command (default)
│   │   └── init.ts                     # Scaffold .dep-report/
│   ├── core/
│   │   ├── detector.ts                 # Package manager detection
│   │   ├── scanner.ts                  # Execute npm/pnpm outdated
│   │   ├── enricher.ts                 # Fetch registry metadata
│   │   ├── normalizer.ts               # Unified schema transform
│   │   └── analyzer.ts                 # Age/Stale/Risk calculation
│   ├── config/
│   │   ├── loader.ts                   # Load & merge config.json + CLI args
│   │   ├── schema.ts                   # Zod schema for validation
│   │   └── defaults.ts                 # Default config values
│   ├── cache/
│   │   ├── manager.ts                  # Read/write .cache.json
│   │   └── types.ts                    # Cache data structures
│   ├── notes/
│   │   ├── loader.ts                   # Load notes.json
│   │   └── merger.ts                   # Inject notes into dataset
│   ├── reports/
│   │   ├── generator.ts                # Orchestrator (calls MD/HTML)
│   │   ├── markdown.ts                 # Markdown table renderer
│   │   ├── html.ts                     # HTML + inline CSS
│   │   └── templates/
│   │       ├── empty-state.ts          # "All Clear" template
│   │       └── html-style.ts           # CSS constants
│   ├── utils/
│   │   ├── network.ts                  # Connectivity check, rate limiter
│   │   ├── sanitize.ts                 # XSS escape functions
│   │   ├── time.ts                     # Parse "18 months" → ms
│   │   ├── fs.ts                       # Preflight checks (node_modules, permissions)
│   │   └── logger.ts                   # Consistent CLI output
│   └── types/
│       └── index.ts                    # Shared TypeScript types
├── tests/
│   ├── unit/
│   │   ├── detector.test.ts
│   │   ├── analyzer.test.ts
│   │   └── time.test.ts
│   └── fixtures/
│       ├── npm-outdated.json
│       └── registry-response.json
└── dist/                               # Build output (gitignored)
    └── cli.js
```

---

## Data Flow Architecture

```
┌─────────────────────┐
│  CLI Entry Point    │
│  (src/cli.ts)       │
└──────────┬──────────┘
           │
           ├─→ init command → Scaffold directories
           │
           └─→ audit command (default)
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
   Load Config            Check --refresh flag
   (config.json)                 │
        │              ┌─────────┴─────────┐
        │              │ YES               │ NO
        │              ▼                   ▼
        │         Load .cache.json    Preflight Checks
        │              │               (node_modules, network)
        │              │                   │
        │              │                   ▼
        │              │            Detect Package Manager
        │              │                   │
        │              │                   ▼
        │              │            Execute `outdated --json`
        │              │                   │
        │              │                   ▼
        │              │            Normalize Output
        │              │                   │
        │              │                   ▼
        │              │            Enrich with Registry API
        │              │            (batched, rate-limited)
        │              │                   │
        │              │                   ▼
        │              │            Save to .cache.json
        │              │                   │
        └──────────────┴───────────────────┘
                       │
                       ▼
              Apply Ignore Patterns
                       │
                       ▼
              Calculate Age/Stale/Risk
                       │
                       ▼
              Merge notes.json
                       │
                       ▼
              Generate Reports
              (MD + HTML)
                       │
                       ▼
              Check Exit Conditions
              (--fail-if-stale, etc.)
                       │
                       ▼
                   Exit 0/1
```

---

## Core Type Definitions

```typescript
// Unified internal schema (post-normalization)
interface OutdatedPackage {
  name: string;
  current: string;        // Installed version
  wanted: string;         // Max version satisfying package.json
  latest: string;         // Absolute latest on registry
  type: 'dependencies' | 'devDependencies' | 'peerDependencies';
}

// Enriched with registry data
interface EnrichedPackage extends OutdatedPackage {
  currentPublishedAt: Date | null;  // When current version was published
  latestPublishedAt: Date | null;   // When latest version was published
  age: number | null;                // Days since current was published
  isStale: boolean;                  // age > threshold
  risk: 'Major' | 'Minor' | 'Patch' | 'Exotic' | 'NotInstalled';
  note?: string;                     // From notes.json
}

// Config schema
interface Config {
  staleThreshold: string;            // e.g., "18 months"
  ignorePatterns: string[];          // Glob patterns
  formats: {
    markdown: boolean;
    html: boolean;
  };
  concurrency: number;               // Registry API batch size
  failConditions: {
    stale: boolean;
    major: boolean;
  };
  reportEmptyState: boolean;         // Create files even if all up-to-date
}

// Cache structure
interface CacheData {
  timestamp: string;                 // ISO date of cache creation
  packageManager: 'npm' | 'pnpm' | 'bun';
  packages: EnrichedPackage[];       // Full enriched data
}
```

---

## Implementation Phases

### ✅ Phase 1: Foundation (Core Engine)
**Goal**: Generate basic markdown report without config/caching

**Tasks**:
1. Project setup
   - `bun init`, install dependencies
   - Configure `tsup` for single-file build
   - Add `bin` entry in package.json
   - Setup TypeScript (strict mode)

2. `detector.ts` - Package manager detection
   - Check for lockfiles in priority order
   - Return manager + command template
   - Abort if no lockfile found

3. `scanner.ts` - Execute outdated command
   - Run `${manager} outdated --json`
   - Parse stdout (handle non-zero exit codes gracefully)
   - Return raw JSON

4. `normalizer.ts` - Unified schema
   - Map npm/pnpm/bun JSON → `OutdatedPackage[]`
   - Handle missing fields (some managers omit `wanted`)

5. `enricher.ts` - Registry API calls
   - For each package: `GET https://registry.npmjs.org/${name}`
   - Extract `time` field: `{ "1.0.0": "2020-01-01T00:00:00.000Z", ... }`
   - Map `current` and `latest` versions to publish dates
   - Implement basic rate limiting (1 request/100ms)

6. `analyzer.ts` - Risk & Age calculation
   - Age = `Date.now() - currentPublishedAt` (in days)
   - Risk = compare `current` vs `latest` using `semver.diff()`
   - Handle exotic versions (file:, git+, link:, workspace:)

7. `markdown.ts` - Basic table output
   - Headers: Package | Current | Latest | Risk | Age (days) | Stale?
   - Write to `./dep-report/reports/YYYY-MM-DD_outdated.md`
   - Mirror to `latest.md`

8. `cli.ts` - Commander setup
   - Default command (no args) → run audit
   - `--version`, `--help` flags

**Acceptance Criteria**:
- `bun run src/cli.ts` outputs markdown report
- Handles exotic versions without crashing
- Works with npm/pnpm/bun lockfiles

---

### ✅ Phase 2: Configuration System
**Goal**: Honor `config.json` and `notes.json`

**Tasks**:
1. `config/schema.ts` - Define defaults
   ```typescript
   const DEFAULT_CONFIG: Config = {
     staleThreshold: "18 months",
     ignorePatterns: [],
     formats: { markdown: true, html: true },
     concurrency: 5,
     failConditions: { stale: false, major: false },
     reportEmptyState: true
   };
   ```

2. `config/loader.ts` - Merge logic
   - Read `.dep-report/config.json` (skip if missing)
   - Merge with defaults (config overrides defaults)
   - Validate with Zod schema
   - Support CLI overrides (future: `--threshold "12 months"`)

3. `utils/time.ts` - Parse human durations
   - Use `date-fns` to parse "18 months", "2 years", "90 days"
   - Convert to milliseconds
   - Return threshold for comparison

4. `analyzer.ts` - Apply threshold
   - `isStale = age > config.staleThreshold`

5. `notes/loader.ts` - Load annotations
   ```json
   {
     "lodash": "Blocked by bug #1234",
     "axios": "Waiting for breaking change review"
   }
   ```

6. `notes/merger.ts` - Inject into dataset
   - Match by package name
   - Add `note` field to `EnrichedPackage`

7. `ignorePatterns` - Filter packages
   - Use `minimatch` to test package names
   - Remove matches before rendering

8. `init` command
   - Create `.dep-report/` directory
   - Write default `config.json`
   - Write empty `notes.json`
   - Create `.gitignore` with `.cache.json`
   - Flag: `--include-config` (more verbose template)

**Acceptance Criteria**:
- `config.json` thresholds affect Stale column
- `notes.json` annotations appear in reports
- `ignorePatterns: ["@types/*"]` filters correctly
- `bun run src/cli.ts init` scaffolds structure

---

### ✅ Phase 3: Caching & Refresh
**Goal**: Instant re-runs with `--refresh`

**Tasks**:
1. `cache/manager.ts` - Read/write logic
   - Save enriched packages to `.dep-report/.cache.json`
   - Include timestamp + package manager
   - Validate cache freshness (optional: expire after 24h)

2. `--refresh` flag
   - Skip detector/scanner/enricher steps
   - Load from cache
   - Re-apply config/notes (allows instant triage)
   - Regenerate reports

3. `utils/network.ts` - Connectivity check
   - Try `fetch('https://registry.npmjs.org/lodash')` with 5s timeout
   - If fails, suggest `--refresh` flag
   - Only run before enrichment phase

4. Improve rate limiting
   - Batch enrichment into chunks of `config.concurrency`
   - Use `Promise.all()` per batch, wait 500ms between batches

**Acceptance Criteria**:
- First run creates `.cache.json`
- `--refresh` completes in <500ms (no network)
- Offline mode prompts user appropriately

---

### Phase 4: HTML Output & Polish
**Goal**: Production-ready, handle all edge cases

**Tasks**:
1. `reports/html.ts` - Generate styled table
   - Inline CSS (color-coded by risk level)
   - Sanitize all user content (package names, notes)
   - Self-contained (no external dependencies)

2. `templates/empty-state.ts` - Success report
   - If `outdated` returns empty AND `reportEmptyState: true`:
     ```markdown
     # Dependency Report (2026-01-30)
     ✅ All dependencies are up to date
     ```

3. Exit code logic
   - Default: Always exit 0
   - `--fail-if-stale`: Exit 1 if any `isStale: true`
   - `--fail-if-major`: Exit 1 if any `risk: 'Major'`
   - Combine flags with OR logic

4. Edge case handling (from spec table):
   - ✅ Preflight: Check `node_modules` exists
   - ✅ Validate versions before processing
   - ✅ Sanitize HTML output
   - ✅ Test write permissions before enrichment
   - ✅ Handle 404/401 registry errors gracefully
   - ✅ Offline detection
   - ✅ Rate limiting
   - ✅ Corrupt JSON handling (try/catch with helpful errors)

5. `utils/fs.ts` - Preflight checks
   ```typescript
   - ensureNodeModules(): Abort if missing
   - ensureWriteAccess(): Test write to ./dep-report/
   - ensureValidJSON(path): Try parse, return error location
   ```

6. `utils/logger.ts` - Better UX
   - Spinners during network calls
   - Progress: "Enriching 15/47 packages..."
   - Color-coded success/error messages

**Acceptance Criteria**:
- HTML output viewable in browser (styled, safe)
- Empty state renders correctly
- All edge cases from spec table handled
- User-friendly error messages

---

### Phase 5: Testing & Publishing
**Goal**: Publishable to npm, reliable

**Tasks**:
1. Unit tests (Bun test runner)
   - `detector.test.ts`: Lockfile detection
   - `analyzer.test.ts`: Age/risk calculation
   - `time.test.ts`: Threshold parsing
   - `normalizer.test.ts`: JSON transforms

2. Integration test
   - Create fixture project with outdated packages
   - Run full audit, validate output structure

3. Build pipeline
   - `bun run build`: Outputs `dist/cli.js`
   - Add shebang: `#!/usr/bin/env node`
   - Make executable: `chmod +x dist/cli.js`

4. `package.json` configuration
   ```json
   {
     "name": "dep-report",
     "version": "1.0.0",
     "bin": {
       "dep-report": "./dist/cli.js"
     },
     "engines": {
       "node": ">=18.0.0"
     },
     "files": ["dist"],
     "scripts": {
       "build": "tsup src/cli.ts --format esm --minify",
       "test": "bun test"
     }
   }
   ```

5. README.md
   - Installation: `npx dep-report`
   - Usage examples
   - Config reference
   - Edge cases & limitations

6. Publish checklist
   - Test locally: `npm link` → `dep-report` in another project
   - Dry run: `npm publish --dry-run`
   - Publish: `npm publish`
   - Verify: `npx dep-report@latest`

**Acceptance Criteria**:
- `npx dep-report` works in fresh project
- Tests pass on CI (GitHub Actions)
- Published to npm registry

---

## Risk Calculation Logic

```typescript
function calculateRisk(current: string, latest: string): Risk {
  // Handle non-semver first
  if (isExotic(current)) return 'Exotic';
  if (!current || current === '-') return 'NotInstalled';
  
  try {
    const diff = semver.diff(current, latest);
    switch (diff) {
      case 'major': return 'Major';
      case 'minor': return 'Minor';
      case 'patch': return 'Patch';
      default: return 'Patch'; // Prerelease/build
    }
  } catch {
    return 'Exotic'; // Parse failed
  }
}

function isExotic(version: string): boolean {
  return /^(file:|git\+|https?:|link:|workspace:)/.test(version);
}
```

---

## Age Calculation (Clarified)

**Strategy**: Calculate age based on when the **current installed version** was published.

**Rationale**: This answers "How old is the dependency we're *actively using*?" If we installed `lodash@4.0.0` (published 5 years ago) but `4.17.21` exists (published yesterday), our tech debt is the 5-year-old version, not the recent release.

```typescript
async function enrichWithAge(pkg: OutdatedPackage): Promise<EnrichedPackage> {
  const registryData = await fetch(`https://registry.npmjs.org/${pkg.name}`);
  const { time } = await registryData.json();
  
  const currentPublishedAt = time[pkg.current];
  const latestPublishedAt = time[pkg.latest];
  
  if (!currentPublishedAt) {
    return { ...pkg, age: null, currentPublishedAt: null, latestPublishedAt: null };
  }
  
  const ageInDays = Math.floor(
    (Date.now() - new Date(currentPublishedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    ...pkg,
    currentPublishedAt: new Date(currentPublishedAt),
    latestPublishedAt: latestPublishedAt ? new Date(latestPublishedAt) : null,
    age: ageInDays
  };
}
```

---

## Private Registry Support

Inherit registry configuration from the detected package manager:

```typescript
async function getRegistry(manager: PackageManager): Promise<string> {
  const commands = {
    npm: 'npm config get registry',
    pnpm: 'pnpm config get registry',
    bun: 'bun config get registry'
  };
  
  const { stdout } = await execCommand(commands[manager]);
  return stdout.trim() || 'https://registry.npmjs.org';
}
```

This automatically respects `.npmrc` files with custom registries and authentication tokens.

---

## Yarn Support Decision

**Analysis**: Yarn Classic and Berry have different JSON output formats. Yarn Classic (`yarn outdated --json`) outputs newline-delimited JSON (NDJSON), requiring different parsing logic.

**Decision**: Defer to Phase 6 (post-MVP) unless implementation takes <2 hours. Priority is npm/pnpm/bun since they share similar JSON schemas.

---

## Open Questions / Future Enhancements

1. **Monorepo Support** (Phase 6?)
   - Traverse `workspaces` field in package.json
   - Generate per-workspace reports
   - Add `--workspace <name>` flag

2. **Transform Hook** (Phase 7?)
   - Load `.dep-report/bin/transform.js`
   - Pass enriched data through user function
   - Use case: Custom risk scoring, alert integrations

3. **JSON Export** (Phase 6?)
   - Add `--format json` flag
   - Useful for piping to other tools

4. **Historical Trending** (Phase 8?)
   - Compare today's report vs previous snapshots
   - Visualize debt accumulation over time

---

## Success Criteria (MVP)

- ✅ Works with npm, pnpm, and bun
- ✅ Generates markdown + HTML reports
- ✅ Enriches with publish age (calculated from current version)
- ✅ Honors config.json thresholds
- ✅ Persists notes.json annotations
- ✅ Caches registry data for instant triage
- ✅ Handles all edge cases from spec table
- ✅ Publishable via `npx dep-report`
- ✅ <5 second runtime for typical project (50 dependencies)
- ✅ Zero config for basic usage

---

## Timeline Estimate

| Phase | Estimated Time | Deliverable |
|-------|---------------|-------------|
| 1. Foundation | 4-6 hours | Basic markdown output |
| 2. Config System | 2-3 hours | Full config/notes support |
| 3. Caching | 2 hours | `--refresh` flag working |
| 4. HTML & Polish | 3-4 hours | Production-ready |
| 5. Testing & Publish | 2-3 hours | Live on npm |
| **Total** | **13-18 hours** | V1.0.0 released |

---

## Next Step

Review this plan and confirm before Phase 1 implementation. Any changes to scope, data structures, or priorities?
