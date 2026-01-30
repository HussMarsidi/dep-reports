# dep-report - Project Overview & Decision Log

## What This Project Is

**dep-report** is a zero-config CLI tool that generates version-controlled snapshots of dependency risk. It enriches standard package manager data with **publish history (Age)** and **Stale Status**, helping teams see not just *what* is outdated, but *how badly* dependencies are aging.

### Core Philosophy
- **Snapshot-Based**: Reports stamped with ISO dates create an auditable history of technical debt
- **Agnostic & Robust**: Auto-detects package manager (npm/pnpm/bun) and respects local configurations
- **Human-Centric**: Separates machine data from human context (notes system)

### The Problem It Solves
Dependency updates are often ignored until they break builds. Teams lack visibility into *temporal* risk—a package unreleased for 3 years poses different threats than one updated yesterday. Engineers need lightweight, auditable "ledger" of dependency health.

---

## Architecture Decision Record (ADR)

### ADR-001: Package Manager Support Strategy
**Date**: Initial Planning  
**Status**: Implemented  

**Decision**: Support npm, pnpm, and bun first; defer Yarn to post-MVP

**Rationale**:
- npm/pnpm/bun share similar `outdated --json` output schemas
- Yarn Classic uses NDJSON format (different parsing logic)
- Yarn Berry has different commands entirely
- 80/20 rule: Most projects use npm/pnpm

**Consequences**:
- Faster MVP delivery
- Cleaner normalization layer
- Yarn can be added later with isolated adapter

---

### ADR-002: Age Calculation Strategy
**Date**: Initial Planning  
**Status**: Implemented  

**Decision**: Calculate age based on **current installed version** publish date, not latest

**Rationale**:
- Answers "How old is the dependency we're *actively using*?"
- If using `lodash@4.0.0` (5 years old) vs `4.17.21` (1 day old), tech debt is the 5-year-old version
- More accurate measure of actual risk in production

**Alternatives Considered**:
- Age = time since latest version published ❌ (misleading for projects on old versions)
- Age = time since package created ❌ (penalizes stable, mature packages)

---

### ADR-003: Tech Stack Selection
**Date**: Initial Planning  
**Status**: Implemented  

**Decision**: 
- Runtime: Bun (dev) + Node.js 18+ (production target)
- Language: TypeScript 5.x (strict mode)
- CLI Framework: `commander`
- HTTP: Native `fetch`
- Build: `tsup` (esbuild wrapper)

**Rationale**:
- Bun for fast development iteration
- Node 18+ for broad compatibility (fetch built-in)
- `commander` is lightweight and industry standard
- `tsup` outputs single executable file
- Minimal dependencies = fewer security/maintenance concerns

**Alternatives Considered**:
- Yargs ❌ (heavier than commander)
- Axios ❌ (unnecessary, fetch is native)
- Webpack/Rollup ❌ (tsup is simpler for CLI tools)

---

### ADR-004: Directory Structure
**Date**: Initial Planning  
**Status**: Implemented  

**Decision**: All tool artifacts live in `./dep-report/` namespace

**Structure**:
```
.dep-report/
├── .gitignore          # Auto-ignores .cache.json
├── config.json         # User settings
├── notes.json          # Manual annotations
├── .cache.json         # Registry data cache (gitignored)
└── reports/
    ├── latest.md       # Mirror of most recent
    ├── latest.html
    ├── 2026-01-30_outdated.md
    └── 2026-01-30_outdated.html
```

**Rationale**:
- Single namespace prevents clutter in project root
- `.gitignore` inside prevents accidental cache commits
- `reports/` folder with timestamps creates audit trail
- `latest.*` mirrors simplify CI/CD integration

---

### ADR-005: Caching Strategy
**Date**: Phase 3  
**Status**: Implemented  

**Decision**: Cache enriched registry data, not raw `outdated` output

**Rationale**:
- Registry API calls are expensive (rate limits, network latency)
- `outdated` command is fast (~1-2s locally)
- Cache enables instant triage workflow:
  1. First run: Full scan + enrichment (slow)
  2. `--refresh`: Skip network, reapply config/notes (instant)

**Cache Invalidation**: Manual via re-running without `--refresh`

---

### ADR-006: Risk Calculation Logic
**Date**: Phase 1  
**Status**: Implemented  

**Decision**: Use `semver.diff()` to classify upgrade risk

**Categories**:
- **Major**: Breaking changes likely (1.x → 2.x)
- **Minor**: New features (1.1 → 1.2)
- **Patch**: Bug fixes (1.1.1 → 1.1.2)
- **Exotic**: Non-semver (file:, git+, workspace:)
- **NotInstalled**: Current version is `-` or empty

**Rationale**:
- Aligns with semver contract
- Clear signal for prioritization
- Handles edge cases (exotic versions) gracefully

---

### ADR-007: Configuration Precedence
**Date**: Phase 2  
**Status**: Implemented  

**Decision**: CLI Args > Config File > Hardcoded Defaults

**Example**:
```bash
# Default threshold: 18 months
# config.json: { "staleThreshold": "12 months" }
# CLI: --threshold "6 months"
# Result: 6 months (CLI wins)
```

**Rationale**:
- Explicit (CLI) beats implicit (config)
- Enables one-off overrides without editing config
- Standard Unix convention

---

### ADR-008: Empty State Handling
**Date**: Phase 4  
**Status**: Implemented  

**Decision**: Generate success report when no outdated packages found

**Output**:
```markdown
# Dependency Report (2026-01-30)
✅ All dependencies are up to date
```

**Rationale**:
- Confirms tool ran successfully
- Creates audit trail even when clean
- Config option `reportEmptyState: false` allows suppression

---

### ADR-009: Private Registry Support
**Date**: Phase 1  
**Status**: Implemented  

**Decision**: Inherit registry from detected package manager

**Implementation**:
```typescript
const registry = execSync(`${manager} config get registry`).toString().trim();
```

**Rationale**:
- Respects `.npmrc` files automatically
- No custom auth token handling needed
- Package manager handles authentication

---

### ADR-010: Monorepo Scope (V1)
**Date**: Initial Planning  
**Status**: Deferred  

**Decision**: V1 scans only CWD's `package.json`, no workspace traversal

**Rationale**:
- Simpler mental model for MVP
- Most projects aren't monorepos
- Workspace support can be added in V2 with `--workspace` flag

**Future Enhancement**: Phase 6 could add recursive workspace scanning

---

## Key Principles

### 1. Zero Config by Default
Tool works with `npx dep-report` in any project—no setup required

### 2. Fail Soft, Not Hard
- Missing registry metadata? → Mark age as `null`, continue
- Offline? → Suggest `--refresh`, don't crash
- Corrupt config? → Show syntax error, fall back to defaults

### 3. Separation of Concerns
- **Machine Data** (.cache.json): Ephemeral, regenerable
- **Human Context** (notes.json): Persistent, version-controlled
- **Reports**: Snapshots for audit trails

### 4. Respect Environment
- Use package manager's registry config
- Inherit authentication tokens
- Don't require tool-specific auth setup

---

## Success Metrics

- ✅ Works with npm, pnpm, bun
- ✅ <5s runtime for typical project (50 deps)
- ✅ Zero config for basic usage
- ✅ Handles exotic versions without crashing
- ✅ Generates markdown + HTML reports
- ✅ Caching enables instant re-runs
- ⏳ Publishable via `npx dep-report`
- ⏳ Test coverage for core logic

---

## Future Enhancements (Post-MVP)

1. **Yarn Support** (Phase 6)
   - Requires NDJSON parser for Yarn Classic
   - Separate adapter for Yarn Berry

2. **Monorepo Support** (Phase 6)
   - Traverse workspace declarations
   - Per-workspace reports
   - `--workspace <name>` flag

3. **JSON Export** (Phase 6)
   - `--format json` for tool integration
   - Machine-readable output for CI/CD

4. **Historical Trending** (Phase 8)
   - Compare snapshots over time
   - Visualize debt accumulation
   - Track upgrade velocity

5. **Transform Hooks** (Phase 7)
   - Load `.dep-report/bin/transform.js`
   - Custom risk scoring
   - Alert integrations (Slack, PagerDuty)

---

## Related Documentation

- **README.md**: User-facing documentation, installation, usage
- **docs/summary.md**: Requirements and feature specifications
- **package.json**: Project metadata, dependencies, scripts

---

## Changelog

### Unreleased (Current)
- ✅ Core engine (detector, scanner, normalizer)
- ✅ Registry enrichment with age calculation
- ✅ Config and notes systems
- ✅ Caching with `--refresh` flag
- ✅ Markdown and HTML report generation
- ⏳ Test suite implementation
- ⏳ npm publication workflow

---

*Last Updated: 2026-01-30*
