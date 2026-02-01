# Product Enhancements Proposal: Positioning & Polish

## Executive Summary

Feedback received on positioning dep-report from "dependency audit tool" to "dependency risk control plane." The proposal focuses on making the tool feel **essential** rather than **useful**, with emphasis on narrative, decision tracking, and cockpit-style reporting.

**Status**: ✅ Finalized & Ready for Implementation  
**Target**: v0.1.x (pre-v1.0 polish)

---

## Visual Summary: Before vs After

### Current State (v0.0.1)
```
Dependency Report (2026-01-31)

| Package | Current | Latest | Age | Risk |
|---------|---------|--------|-----|------|
| axios   | 0.21.0  | 1.6.7  | 623 | High |
| ...     | ...     | ...    | ... | ...  |
```
*Basic table. No context. No actionability.*

---

### Target State (v0.1.x)
```
Dependency Report (2026-01-31)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              🔴 At Risk (15% stale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 47 | Outdated: 12 | Stale: 7 | Up-to-date: 35
Blocked: 3 | Deferred: 2 | Accepted Risk: 1

━━━ ACTION REQUIRED ━━━━━━━━━━━━━━━━━━━━━━━━

🔴 Critical Risk
  • axios (v0.21.0 → v1.6.7)
    623 days old, behind by 456 days | Major update
  
  • react (v17.0.2 → v19.0.0)
    542 days old, behind by 412 days | Major update
    🔴 BLOCKED: waiting for team migration

🟡 Review Soon
  • moment (v2.29.1 → v2.30.1)
    847 days old, behind by 721 days | Minor update
    🟡 DEFERRED: Q2 2026 refactor to date-fns

━━━ FULL DEPENDENCY LIST ━━━━━━━━━━━━━━━━━━

| Package | Current | Latest | Age | Behind | Risk | Status |
|---------|---------|--------|-----|--------|------|--------|
| axios   | 0.21.0  | 1.6.7  | 623d| 456d   | 🔴 Major | Outdated |
| lodash  | 4.17.21 | 4.17.21| 847d| —      | 🟢 Current | ✅ Stable |
| ...
```
*Dashboard-style. Instant clarity. Actionable priorities.*

---

## Decision Matrix

| # | Enhancement | Priority | Status | Rationale |
|---|-------------|----------|--------|-----------|
| 1 | Product Story Rewrite | ⭐⭐⭐ HIGH | ✅ Approved | README lacks emotional hook; needs "irresponsible to skip" framing |
| 2 | Opinionated Presets | ⭐⭐ MEDIUM | ✅ Approved | Sell decisions, not options; 2-3 ready-made profiles |
| 3 | Cockpit-Style Reports | ⭐⭐⭐ HIGH | ✅ Approved | Reports are the UI; must be scannable & actionable |
| 4 | Critical Dependencies | ⭐ LOW | ❌ Deferred | Feature creep; only useful for large monorepos |
| 5 | Integration Recipes | ⭐⭐ MEDIUM | ✅ Approved | Copy-paste CI/CD patterns; include workflow examples |
| 6 | Notes as Decision Log | ⭐⭐⭐ HIGH | ✅ Approved | Transform tribal knowledge into auditable decisions |
| 7 | DX Polish | ⭐⭐ MEDIUM | ✅ Approved | `--compare`, `--dry-run`, better `--help` |
| 8 | Roadmap & Trust | ⭐ LOW | ⚠️ Partial | Add privacy guarantees; skip roadmap (premature) |

---

## 1. Product Story Rewrite ✅

### Current State
```
"Zero-config CLI tool that generates version-controlled snapshots of dependency risk."
```
Accurate but not visceral. No emotional hook.

### Proposed Narrative

**Hero Statement:**
> "Turn your dependency chaos into a daily, version-controlled risk brief."

**Structure:**
```markdown
## The Problem
Dependency drift is invisible until it explodes.

## The Solution
dep-report gives you a daily, human-readable risk brief, checked into your repo.

## The Outcome
You can see at a glance whether you're getting healthier or rotting.

## Proof Point
"Six months ago we had 34 stale dependencies, 9 majors ignored. 
Today we're at 3 and 1—and we can prove it from the reports in `/.dep-report/reports`."
```

**Tone:** Make readers feel like not having this is **irresponsible**.

### Implementation
- [ ] Rewrite README.md hero section
- [ ] Add narrative example (before/after story)
- [ ] Update package.json description
- [ ] Sync with GitHub repo description

**Effort:** Low (1 hour)  
**Phase:** Phase 1

---

## 2. Opinionated Presets ✅

### Concept
Instead of neutral config, ship ready-made policies as first-class concepts.

### Presets Design

#### **Starter** (Visibility Only)
```json
{
  "staleThreshold": "24 months",
  "failConditions": { "stale": false, "major": false },
  "reportEmptyState": true
}
```
**Message:** *"Just getting visibility - no CI failures"*  
**Use Case:** Teams beginning their dependency hygiene journey

---

#### **Production** (Recommended Default)
```json
{
  "staleThreshold": "12 months",
  "failConditions": { "stale": false, "major": true },
  "reportEmptyState": true
}
```
**Message:** *"Prevent major upgrades from rotting indefinitely"*  
**Use Case:** Mature teams with CI/CD integration

---

#### **Strict** (Security-Sensitive)
```json
{
  "staleThreshold": "6 months",
  "failConditions": { "stale": true, "major": true },
  "reportEmptyState": true
}
```
**Message:** *"Old dependencies break builds"*  
**Use Case:** Financial, healthcare, or security-critical systems

---

### Implementation Options

**Phase 1:** Documentation (Copy-Paste Snippets)
```markdown
## Presets

### Quick Copy
Choose a preset and paste into `.dep-report/config.json`:

**Starter:**
```json
{ "staleThreshold": "24 months", ... }
```

**Phase 2:** CLI Integration
```bash
dep-report init --preset production
```

### Technical Spec
- Add `src/config/presets.ts` with preset definitions
- Extend `init` command with `--preset` flag
- Validate preset names: `starter | production | strict`
- Default to `production` if flag omitted

### Implementation
- [ ] Document 3 presets with use cases
- [ ] Create preset definitions file
- [ ] Add `--preset` flag to `init` command
- [ ] Update `--help` text
- [ ] Add tests for preset loading

**Effort:** Medium (3-4 hours)  
**Phase:** Phase 2 (docs in Phase 1)

---

## 3. Cockpit-Style Reports ✅

### Problem
Current reports are basic tables. No summary, no hierarchy, no risk signal.

### Solution: Make Reports Feel Like a Dashboard

#### 3.1 Summary Block (Top of Report)

```markdown
## Summary

**Status:** 🔴 At Risk (15% stale)

- Total dependencies: 47
- Outdated: 12 (4 major, 5 minor, 3 patch)
- Stale (>12 months): 7 (15% of total)
- Up-to-date: 35
- Blocked upgrades: 3
- Deferred upgrades: 2
- Accepted risks: 1

**Risk Assessment:** 7 stale dependencies and 4 unaddressed major upgrades detected.
```

**Risk Status Levels (Percentage-Based):**
- 🟢 **Healthy:** <5% stale, <10% outdated with majors
- 🟡 **Degrading:** 5-15% stale, 10-20% outdated with majors
- 🔴 **At Risk:** >15% stale OR >20% outdated with majors

**Configuration (Hybrid Approach):**
```json
{
  "riskThresholds": {
    "method": "percentage",  // or "absolute"
    "degrading": {
      "stalePercent": 10,
      "majorPercent": 15
    },
    "atRisk": {
      "stalePercent": 20,
      "majorPercent": 25
    }
  }
}
```

**Presets Use Different Methods:**
- **Starter/Production:** `percentage` (scales with project size)
- **Strict:** `absolute` counts (predictable thresholds)

**HTML Rendering:**
- Color-coded status badge with percentage
- Summary stats in cards/grid layout
- Single-sentence risk assessment

---

#### 3.2 Action Required Section (Urgency-Based Grouping)

**Renamed from "Top Offenders"** - more actionable, less judgmental.

```markdown
## Action Required

### 🔴 Critical Risk
**axios** (v0.21.0 → v1.6.7)
- Age: 623 days
- Behind by: 456 days (latest published 167 days ago)
- Update: Major
- Impact: Breaking changes likely

**react** (v17.0.2 → v19.0.0)
- Age: 542 days
- Behind by: 412 days (latest published 130 days ago)
- Update: Major
- Note: 🔴 BLOCKED: waiting for team migration

### 🟡 Review Soon
**typescript** (v4.5.2 → v5.3.3)
- Age: 398 days
- Behind by: 298 days
- Update: Major

**moment** (v2.29.1 → v2.30.1)
- Age: 847 days
- Behind by: 721 days
- Update: Minor
- Note: 🟡 DEFERRED: Q2 2026 refactor to date-fns
```

**Prioritization Logic:**
```typescript
function calculatePriority(pkg): number {
  let score = 0;
  
  // Age weight (diminishing returns)
  if (pkg.ageInDays > 730) score += 10;  // >2 years
  else if (pkg.ageInDays > 365) score += 5;   // >1 year
  
  // Update type weight
  if (pkg.hasMajorUpdate) score += 8;
  if (pkg.hasMinorUpdate) score += 3;
  
  // Note status weight
  if (pkg.note?.includes('BLOCKED')) score += 15;  // Highest priority
  if (pkg.note?.includes('DEFERRED')) score += 5;
  
  // Behind metric weight
  if (pkg.behindByDays > 365) score += 7;
  
  return score;
}
```

**Display Rules:**
- Only show if packages score >15 (critical threshold)
- Group by urgency: Critical (red) vs Review Soon (yellow)
- Cap at **7 packages total** across all groups
- If no packages are critical, show: "✅ No critical actions required"

**Key Metrics Added:**
- **Behind by:** Gap between installed version publish date and latest version publish date
- **✅ Stable badge:** For packages where installed version = latest version (no action needed)

---

#### 3.3 Full Table (Enhanced)

Add to existing table:
- **Behind** column (shows how long ago latest was published)
- **Status** column with ✅ Stable badge for up-to-date packages
- Color coding by risk level
- Badge icons for note keywords (🔴 BLOCKED, 🟡 DEFERRED, 🔵 ACCEPTED)
- Sticky header for long lists

**Example Table Structure:**
| Package | Installed | Latest | Age | Behind | Risk | Status | Notes |
|---------|-----------|--------|-----|--------|------|--------|-------|
| axios | v0.21.0 | v1.6.7 | 623d | 456d | 🔴 Major | Outdated | |
| lodash | v4.17.21 | v4.17.21 | 847d | — | 🟢 Current | ✅ Stable | |
| react | v17.0.2 | v19.0.0 | 542d | 412d | 🔴 Major | Outdated | 🔴 BLOCKED |

---

---

### Format-Specific Design

#### Markdown (Developer-Focused)
**Audience:** Developers reading in terminal, Git diffs, PR reviews

**Features:**
- Summary with emoji status indicators
- Action Required section with 🔴/🟡 grouping
- Basic table with all data
- Text-based, clean, scannable

**Philosophy:** Full content, minimal styling. Optimized for terminal viewing and version control diffs.

---

#### HTML (Stakeholder-Focused)
**Audience:** Managers, stakeholders viewing in browser

**Features:**
- Rich visual dashboard with color-coded cards
- Summary statistics in grid layout
- Action Required with styled package cards
- Enhanced table with hover states
- Print-friendly CSS

**Color Palette:**
```css
--status-healthy: #10b981 (green)
--status-degrading: #f59e0b (amber)
--status-risk: #ef4444 (red)

--badge-blocked: #dc2626 (red)
--badge-deferred: #f59e0b (amber)
--badge-accepted: #3b82f6 (blue)
--badge-stable: #10b981 (green)
```

**Layout:**
```
┌─────────────────────────────────────┐
│ Status Badge (Color-coded)          │
├─────────────────────────────────────┤
│ Summary Cards (Grid)                │
├─────────────────────────────────────┤
│ Action Required (Package Cards)     │
├─────────────────────────────────────┤
│ Full Dependency Table               │
└─────────────────────────────────────┘
```

**Philosophy:** Rich visuals, same content as Markdown but optimized for browser consumption and stakeholder reporting.

**Future Enhancement (Phase 3):** Visual charts (pie chart, trend lines) - deferred to keep v0.1 simple.

---

### Implementation
- [ ] Add "behind by" calculation logic (latest publish date - installed publish date)
- [ ] Add "stable" detection (installed version == latest version)
- [ ] Create summary calculation with percentage-based risk levels
- [ ] Design risk status algorithm (hybrid percentage/absolute)
- [ ] Build "Action Required" ranking system with priority scoring
- [ ] Update HTML template with rich dashboard layout
- [ ] Update Markdown template with minimal formatting
- [ ] Add color theming and badges to HTML
- [ ] Add emoji indicators to Markdown
- [ ] Write tests for all new calculations

**Effort:** Medium-High (6-8 hours)  
**Phase:** Phase 1

---

## 4. Critical Dependencies ❌ DEFERRED

### Decision
**Deprioritize** until proven demand.

### Rationale
- Adds schema complexity (`criticalPackages: string[]`)
- Most projects <50 deps - just scan whole list
- Only valuable for large monorepos (not v0.1 target)
- Risk of feature creep

### Future Consideration
If users request "highlight my framework deps", revisit in v0.2+.

---

## 5. Integration Recipes ✅

### Goal
Provide copy-paste CI/CD patterns so teams don't have to invent.

### Recipes to Include

#### 5.1 GitHub Actions - Nightly Audit
```yaml
name: Dependency Audit
on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx dep-report
      - name: Commit report if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .dep-report/reports/
          git diff --staged --quiet || git commit -m "chore: update dependency report"
          git push
```

**Narrative:**
> "Run nightly, auto-commit reports. Your audit trail builds itself."

---

#### 5.2 GitHub Actions - PR Enforcement
```yaml
name: Dependency Check
on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx dep-report
        env:
          FAIL_ON_MAJOR: true  # Exit code 1 if majors found
```

**Narrative:**
> "Fail PRs if major upgrades are rotting. Enforce hygiene at merge time."

---

#### 5.3 With Renovate/Dependabot
```markdown
## Workflow

1. Bots create PRs
2. CI runs `dep-report` on main
3. If stale majors >30 days, flag in team standup

**Philosophy:**
Even with bots, you can't prove dependency posture is improving. 
dep-report gives you the proof.
```

---

### Deliverables
- [ ] Create `examples/github-actions/` directory
- [ ] Add `nightly-audit.yml` workflow
- [ ] Add `pr-check.yml` workflow
- [ ] Document bot integration patterns
- [ ] Add narrative explanations
- [ ] Update README with "Integration" section

**Effort:** Low (2 hours)  
**Phase:** Phase 2

---

## 6. Notes as Decision Log ✅

### Problem
Current notes are freeform strings with no structure. Tribal knowledge stays tribal.

### Solution: Intelligent Keyword Highlighting

#### Format (Freeform Text)
```json
{
  "react": "BLOCKED: waiting for team to finish migration",
  "lodash": "DEFERRED: Q2 2026 - requires architecture refactor",
  "axios": "ACCEPTED RISK: pinned for stability @platform-team",
  "typescript": "Just a regular note without keywords"
}
```

**No validation.** Users write naturally.

---

#### Detected Keywords
- `BLOCKED:` or `BLOCKED -` → Red badge
- `DEFERRED:` or `DEFERRED -` → Amber badge  
- `ACCEPTED RISK:` or `ACCEPTED:` → Blue badge

**Regex Pattern:**
```typescript
const NOTE_PATTERNS = {
  blocked: /^BLOCKED[:\-\s]/i,
  deferred: /^DEFERRED[:\-\s]/i,
  accepted: /^ACCEPTED(\s+RISK)?[:\-\s]/i,
};
```

---

#### Rendering

**Markdown:**
```markdown
| Package | Note |
|---------|------|
| react   | 🔴 BLOCKED: waiting for team migration |
| lodash  | 🟡 DEFERRED: Q2 2026 refactor |
| axios   | 🔵 ACCEPTED RISK: pinned @platform-team |
```

**HTML:**
```html
<span class="badge badge-blocked">BLOCKED</span>
<span class="note-text">waiting for team migration</span>
```

---

#### Summary Integration

Add to summary block:
```markdown
- Blocked upgrades: 3
- Deferred upgrades: 2
- Accepted risks: 1
```

---

### Implementation
- [ ] Create note parser with keyword detection
- [ ] Add badge rendering to HTML template
- [ ] Add emoji icons to Markdown template
- [ ] Aggregate counts for summary section
- [ ] Update notes documentation with examples
- [ ] Write tests for pattern matching

**Effort:** Medium (3-4 hours)  
**Phase:** Phase 1

---

## 7. Developer Experience Polish ✅

### 7.1 Better `--help` Output

**Current:**
```
Usage: dep-report [options]
Options:
  -V, --version  output version
  -h, --help     display help
```

**Proposed:**
```
dep-report - Generate dependency risk reports

USAGE
  dep-report [options]

DESCRIPTION
  Scans for outdated packages and generates a daily risk brief 
  showing age, staleness, and major upgrades. Reports are 
  version-controlled in .dep-report/reports/

QUICK START
  dep-report              # Run audit, generate reports
  dep-report init         # Create config files
  dep-report compare      # Compare two reports

OPTIONS
  --dry-run               Print summary, don't write files
  --help                  Show this help
  --version               Show version

EXAMPLES
  dep-report                           # Daily audit
  dep-report --dry-run                 # Preview without files
  dep-report compare 2026-01-15 latest # Show improvement

LEARN MORE
  https://github.com/yourusername/dep-reports
```

---

### 7.2 `dep-report compare` Command

**Purpose:** Show trend between two reports to track dependency health over time

**Usage:**
```bash
dep-report compare 2025-12-01 2026-01-31
dep-report compare 2025-12-01 latest
dep-report compare last-month latest
```

**Output:**
```
Dependency Health Comparison
From: 2025-12-01 → 2026-01-31 (61 days)

📈 Improvements:
  • 2 packages upgraded: axios (v0.21 → v1.6), react (v17 → v18)
  • Stale packages: 15 → 9 (-6)
  • Major upgrades pending: 7 → 3 (-4)

📉 Regressions:
  • 3 new packages added: lodash, moment, dayjs
  • 1 package became stale: typescript (now 366 days old)

➕ Added: lodash, moment, dayjs
➖ Removed: left-pad

✅ Overall: Health improved by 31%
```

**Health Score Calculation:**
```typescript
healthScore = 100 - (staleCount * 5) - (majorCount * 3)
improvement = ((newScore - oldScore) / oldScore) * 100
```

**Features:**
- Compare two specific dates
- Support "latest" keyword for most recent report
- Support relative dates: "last-month" finds report ~30 days ago
- Show packages added/removed (helps explain deltas)
- Exit code 0 if improved, 1 if regressed

**Implementation:**
- Parse date arguments, find matching report files
- Read and parse both reports
- Calculate deltas for all key metrics
- Show added/removed packages with version info
- Format as readable comparison

**Use Case:** Monthly team reviews, tracking progress on dependency hygiene initiatives

---

### 7.3 `--dry-run` Flag

**Purpose:** Preview summary without writing files (user-configurable verbosity)

**Usage:**
```bash
# Default: Summary + Action Required
dep-report --dry-run
dep-report --dry-run=actions

# Minimal: Just summary stats
dep-report --dry-run=summary

# Full: Summary + actions + complete table
dep-report --dry-run=full
```

**Output (Default - Actions Level):**
```
Dry Run Summary
────────────────
Status: 🔴 At Risk (15% stale)

Total dependencies: 47
Outdated: 12 (4 major, 5 minor, 3 patch)
Stale (>12 months): 7

Action Required:
  🔴 axios (623d, behind by 456d) - Major v0.21 → v1.6.7
  🔴 react (542d, behind by 412d, BLOCKED) - Major v17 → v19
  🟡 typescript (398d, behind by 298d) - Major v4.5 → v5.3

[No files written]
```

**Output (Summary Level):**
```
Dry Run Summary
────────────────
Status: 🔴 At Risk (15% stale)
Total dependencies: 47
Outdated: 12 (4 major, 5 minor, 3 patch)
Stale (>12 months): 7

[No files written]
```

**Levels:**
- `summary` - Minimal stats only (quickest check)
- `actions` - Stats + top priority items (default, most useful)
- `full` - Stats + actions + complete dependency table

**Use Case:** Local experimentation, quick health check without committing report files to Git

**Implementation:**
- Add `--dry-run[=level]` flag accepting: `summary`, `actions`, `full`
- Default to `actions` if no level specified
- Skip all file write operations
- Output formatted text to stdout
- Exit codes still apply (fail conditions honored)

---

### 7.4 Interactive `init` Prompts (Phase 2)

**Current:**
```bash
dep-report init  # Creates files with defaults
```

**Proposed:**
```bash
dep-report init

? What's your risk appetite?
  ❯ Starter (just visibility)
    Production (recommended)
    Strict (fail on old deps)

? Fail CI builds on major upgrades? (y/N) 
```

---

### Implementation
- [ ] Rewrite `--help` text in commander.js
- [ ] Create `compare` command with diff logic
- [ ] Add `--dry-run` flag, skip file writes
- [ ] Add interactive prompts to `init` (Phase 2)
- [ ] Write tests for new commands
- [ ] Update documentation

**Effort:** Medium (4-5 hours)  
**Phase:** Phase 2 (except `--help` in Phase 1)

---

## 8. Roadmap & Trust Signals ⚠️ PARTIAL

### Decision
- ✅ Add **privacy/guarantee section**
- ❌ Skip **roadmap** (premature, leads to broken promises)

### Privacy & Guarantees Section

Add to README:

```markdown
## Guarantees

**Privacy:**
- No tracking, no analytics, no phoning home
- All data stays local in your repository
- Registry queries are read-only package metadata

**Control:**
- Outputs are plain files under your version control
- No vendor lock-in, no proprietary formats
- Works offline with cached data

**Transparency:**
- Open source (MIT license)
- Readable templates, editable notes
- Deterministic output (same input = same report)
```

### Implementation
- [ ] Add "Guarantees" section to README
- [ ] Update docs homepage with trust signals
- [ ] Add LICENSE badge to README

**Effort:** Low (30 minutes)  
**Phase:** Phase 1

---

## Phased Implementation Plan

### Phase 1: High-Impact, No Breaking Changes
**Goal:** Make tool feel essential through narrative + UI improvements

**Tasks:**
- [ ] #1: Rewrite README with aggressive narrative
- [ ] #3: Cockpit reports (summary + top offenders)
- [ ] #6: Notes keyword highlighting + decision log
- [ ] #7.1: Better `--help` output
- [ ] #8: Privacy guarantees section

**Deliverables:**
- Updated README.md
- Enhanced HTML/Markdown templates
- Improved note parsing

**PR Title:** `feat: cockpit-style reports & decision tracking`  
**Estimated Effort:** 8-10 hours  
**Success Metric:** Reports feel like a dashboard, not a dump

---

### Phase 2: DX & Adoption
**Goal:** Reduce friction, teach integration patterns

**Tasks:**
- [ ] #2: Presets (CLI flag + docs)
- [ ] #5: Integration recipes with example workflows
- [ ] #7.2: `compare` command
- [ ] #7.3: `--dry-run` flag
- [ ] #7.4: Interactive `init` prompts

**Deliverables:**
- `examples/github-actions/` directory
- New CLI commands
- Preset system

**PR Title:** `feat: presets, integration recipes & DX polish`  
**Estimated Effort:** 6-8 hours  
**Success Metric:** Teams can copy-paste CI setup in <5 minutes

---

## Success Metrics

### Quantitative
- [ ] README engagement (if GitHub stats available)
- [ ] Example workflows usage (clone tracking)
- [ ] Feature adoption (preset vs custom config ratio)

### Qualitative
- [ ] User feedback: "This feels essential" vs "This is useful"
- [ ] Adoption by security-conscious teams
- [ ] Decision log usage (notes with keywords)

---

## Technical Debt & Considerations

### Backward Compatibility
- ✅ All changes are additive (no breaking changes)
- ✅ Existing configs remain valid
- ✅ Old reports still render

### Testing Requirements
- Unit tests for summary calculations
- Unit tests for note keyword parsing
- Integration tests for new CLI flags
- Visual regression tests for HTML output (manual)

### Documentation Updates
- README.md (narrative rewrite)
- docs/guide/understanding-reports.md (new page)
- docs/guide/integration-patterns.md (new page)
- docs/api/cli.md (new commands)

---

## Open Questions - ✅ RESOLVED

All questions have been resolved through discussion. Key decisions:

### 1. Risk Thresholds → RESOLVED
**Decision:** Hybrid percentage + absolute approach
- Use percentage-based thresholds by default (scales with project size)
- Calculate percentage against **total dependencies** (not just outdated)
- Presets use different methods (Starter/Production = percentage, Strict = absolute)
- Configurable via `riskThresholds` in config.json

### 2. Top Offenders → RESOLVED → RENAMED TO "ACTION REQUIRED"
**Decision:** Urgency-based grouping with priority scoring
- Group by Critical Risk (🔴) vs Review Soon (🟡)
- No prescriptive timeline notes (e.g., "act this sprint")
- Show only packages with score >15
- Cap at 7 packages total
- Skip section if no critical items

### 3. Beyond Date-Based Metrics → RESOLVED
**Decision:** Add "Behind By" and "Stable" indicators
- **Behind by:** Shows gap between installed publish date and latest publish date
- **✅ Stable badge:** For packages where installed = latest (no action needed)
- Defer security vulnerability integration to Phase 2

### 4. HTML vs Markdown Parity → RESOLVED
**Decision:** Format-specific optimization
- **Markdown:** Full content, minimal styling (developer-focused)
- **HTML:** Same content, rich visuals (stakeholder-focused)
- Both get: Summary + Action Required + Full Table
- Skip visual charts for v0.1 (defer to future enhancement)

### 5. Compare Command → RESOLVED
**Decision:** Show full comparison including package changes
- Display packages added/removed (helps explain deltas)
- Support relative dates ("last-month" finds report ~30 days ago)
- Show upgrade activity (packages that changed versions)
- Calculate health score improvement percentage

### 6. Dry Run Verbosity → RESOLVED
**Decision:** User-configurable with `--dry-run=level` syntax
- Default to `actions` level (summary + top priorities)
- Levels: `summary` | `actions` | `full`
- Most useful default for quick checks

### 7. Notes Validation → RESOLVED
**Decision:** Silent validation (Option A)
- No warnings or errors for typos
- Only highlight exact keyword matches
- Document proper keywords in usage guide

### 8. Exit Codes → RESOLVED
**Decision:** Keep binary (0 = success, 1 = fail)
- Simple pass/fail for CI systems
- No need for granular exit codes

---

## References

- Original feedback source: User message (2026-02-01)
- Related docs: `docs/todos/refine-github-page-and-api.md`
- Current codebase: v0.0.1 (production-ready)
- Target: v0.1.x (polish phase before v1.0)

---

**Document Status:** ✅ Finalized & Ready for Implementation  
**Next Steps:** Begin Phase 1 implementation  
**Owner:** Product team  
**Last Updated:** 2026-02-01  
**Review Status:** All open questions resolved

---

## Implementation Checklist

### Phase 1 (High-Impact Features)
- [ ] #1: README narrative rewrite
- [ ] #3: Cockpit-style reports with:
  - [ ] Summary block with percentage-based risk levels
  - [ ] "Action Required" section with urgency grouping
  - [ ] "Behind by" metric calculation
  - [ ] "✅ Stable" badge for up-to-date packages
  - [ ] Enhanced HTML with rich dashboard layout
  - [ ] Minimal Markdown with full content
- [ ] #6: Notes keyword highlighting (BLOCKED/DEFERRED/ACCEPTED)
- [ ] #7.1: Enhanced `--help` output
- [ ] #8: Privacy & guarantees section

**Target:** Create PR titled `feat: cockpit-style reports & decision tracking`

### Phase 2 (DX & Adoption)
- [ ] #2: Preset system with CLI integration
- [ ] #5: Integration recipes (GitHub Actions examples)
- [ ] #7.2: `compare` command with relative date support
- [ ] #7.3: `--dry-run` flag with verbosity levels
- [ ] #7.4: Interactive `init` prompts

**Target:** Create PR titled `feat: presets, integration recipes & DX polish`
