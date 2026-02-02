# dep-report: Core Refinements & Bug Fixes

**Version:** 1.0  
**Date:** February 2, 2026  
**Status:** Specification for Implementation

---

## Executive Summary

This document specifies refinements to the existing dep-report implementation to resolve ambiguities, fix inconsistencies, and establish a solid foundation for future enhancements. These changes focus on clarifying the risk model, improving age tracking, and enhancing the display logic—all while maintaining backward compatibility.

**Key Changes:**
- Multi-tier risk level system (4 levels + blocked/deferred)
- Simplified age tracking (single metric with date-fns)
- Runtime vs dev dependency separation in display
- Enhanced notes system with keyword badges
- Improved status badge logic
- Minimal config additions

---

## Table of Contents

1. [Current Problems](#current-problems)
2. [Risk Level System](#risk-level-system)
3. [Age Tracking](#age-tracking)
4. [Runtime vs Dev Dependencies](#runtime-vs-dev-dependencies)
5. [Notes System](#notes-system)
6. [Status Badge Logic](#status-badge-logic)
7. [Summary Statistics](#summary-statistics)
8. [Configuration Changes](#configuration-changes)
9. [Display Changes](#display-changes)
10. [Implementation Guide](#implementation-guide)

---

## Current Problems

### Problem 1: Unclear Risk Prioritization

**Current state:**
- Only `commander` (major + stale) appears in "Action Required" section
- Other major updates (`zod`, `@types/*`) are ignored
- No clear logic for what makes something "critical"

**Example from current output:**
```markdown
## Action Required

### 🔴 Critical Risk
  • commander (12.1.0 → 14.0.3)
    1y 8m old, behind by 1y 8m | Major update

[zod with 6mo major update not shown - why?]
[@types/* with major updates not shown - why?]
```

**Impact:** Users can't tell what to prioritize, leading to confusion and missed important updates.

---

### Problem 2: Confusing Age Metrics

**Current state:**
- "Age" column shows: `1y 8m`
- "Behind by" column shows: `1y 8m` (identical)
- Users don't understand the difference
- `@types/*` packages show "Unknown" age with no explanation

**Example:**
```
| commander | 12.1.0 | 14.0.3 | 1y 8m | 1y 8m | Major | Outdated |
                                 ^^^^^^  ^^^^^^
                                  Age   Behind
                               (What's the difference?)
```

**Impact:** Confusion about what age means, duplicate information cluttering the display.

---

### Problem 3: Dev Dependencies Treated Identically

**Current state:**
- Dev dependencies tagged with `(dev)` but treated the same as runtime
- Appear in same table, same risk calculations, same priority
- Teams are typically less strict about dev dependency updates

**Example:**
```
Total: 13 | Outdated: 4 | Stale: 1
(Doesn't distinguish runtime vs dev)
```

**Impact:** Can't quickly focus on runtime dependencies that affect production.

---

### Problem 4: Notes System Underutilized

**Current state:**
- Notes column exists but is always empty in examples
- No visual distinction for different note types
- Blocked/deferred items still counted in risk metrics

**Example from config:**
```json
{
  "react": "BLOCKED: waiting for team migration"
}
```

But in report:
```
| react | ... | ... | BLOCKED: waiting for team migration |
(Just plain text, no badge, still counted as critical)
```

**Impact:** Important context (blocked/deferred items) not visually prominent, still nagging users about acknowledged issues.

---

### Problem 5: Status Badge Too Narrow

**Current state:**
```
🔴 At Risk (8% stale)
```

Only considers staleness percentage, ignores:
- Major updates count
- Security advisories
- Overall risk distribution

**Impact:** Misleading summary—could have 10 major updates but show "healthy" if none are stale.

---

## Risk Level System

### Overview

Replace the implicit risk logic with an explicit 4-tier system plus special categories for blocked/deferred items.

### Risk Tiers

#### 🔴 CRITICAL (Requires Immediate Action)

**Criteria (any of):**
1. Has security advisory (any severity)
2. Major update + stale (>18 months old)
3. Any update + very old (>24 months old) - possibly abandoned

**Why critical:**
- Security = production vulnerability
- Stale major = significant drift, accumulated breaking changes
- Very old = package might be abandoned, security risk even if no CVE

**Example packages:**
```
• lodash (4.17.21 → 4.18.0)
  🚨 Security: CVE-2024-XXXX (Critical)
  
• commander (12.1.0 → 14.0.3)
  Major update, 20 months old, STALE
  
• moment (2.29.1 → 2.30.1)
  Minor update, 28 months old, VERY OLD
```

---

#### ⚠️ HIGH (Should Address Soon)

**Criteria (any of):**
1. Major update + moderately old (6-12 months)
2. Minor update + stale (>18 months)

**Why high:**
- Major updates often have breaking changes, 6-12mo means battle-tested
- Stale minors = missing important features/fixes

**Example packages:**
```
• zod (3.25.76 → 4.3.6)
  Major update, 8 months old
  
• axios (0.27.2 → 1.6.0)
  Minor update, 19 months old, STALE
```

---

#### 📦 MEDIUM (Plan to Address)

**Criteria (any of):**
1. Major update + recent (<6 months)
2. Minor update + moderately old (6-12 months)
3. Patch update + old (>12 months)

**Why medium:**
- Recent majors = not yet battle-tested, can wait
- Moderate minors = should update but not urgent
- Old patches = accumulated bug fixes

**Example packages:**
```
• react (18.2.0 → 18.3.0)
  Major update, 3 months old (wait for stability)
  
• typescript (5.1.0 → 5.2.0)
  Minor update, 8 months old
  
• prettier (2.8.8 → 2.9.0)
  Patch update, 14 months old
```

---

#### ✅ LOW (Optional, Convenience)

**Criteria (any of):**
1. Minor update + recent (<6 months)
2. Patch update + any age (if <12 months old)

**Why low:**
- Recent minors = can wait for next sprint
- Patches = usually safe but not urgent

**Example packages:**
```
• eslint (8.50.0 → 8.51.0)
  Minor update, 2 months old
  
• prettier (3.0.0 → 3.0.1)
  Patch update, 1 month old
```

---

### Special Categories

#### 🚫 BLOCKED

**Criteria:**
- Note contains `BLOCKED:` keyword (case-insensitive)

**Treatment:**
- Shown in separate "Blocked Items" section
- **NOT counted** in risk metrics (acknowledged issue)
- **NOT counted** toward status badge
- Still visible for review

**Example:**
```markdown
### 🚫 Blocked Items (1)
• react (17.0.2 → 18.3.1) - Runtime
  🔴 BLOCKED: waiting for team migration Q2 2026
  (Would be Critical, but blocked by team decision)
```

---

#### 📅 DEFERRED

**Criteria:**
- Note contains `DEFERRED:` keyword (case-insensitive)

**Treatment:**
- Shown in separate "Deferred Items" section
- **NOT counted** in risk metrics (acknowledged postponement)
- **NOT counted** toward status badge
- Still visible for review

**Example:**
```markdown
### 📅 Deferred Items (1)
• lodash (4.17.21 → 4.18.0) - Runtime
  🟡 DEFERRED: Q3 2026 - low priority, no security issues
```

---

#### 🔵 ACCEPTED RISK

**Criteria:**
- Note contains `ACCEPTED RISK:` keyword (case-insensitive)

**Treatment:**
- **DOES count** in risk metrics (risk acknowledged but not resolved)
- Shows badge in normal risk section
- Signals conscious decision

**Example:**
```markdown
### 📦 Medium Priority
• axios (0.27.2 → 1.6.7) - Runtime
  🔵 ACCEPTED RISK: pinned for API stability @platform-team
```

---

### Risk Calculation Algorithm

```typescript
function calculateRisk(dep: Dependency): RiskLevel {
  const ageInMonths = getAgeInMonths(dep.publishedDate);
  const updateType = getUpdateType(dep.current, dep.latest); // major|minor|patch
  
  // Special handling for noted items
  if (dep.note) {
    if (/BLOCKED:/i.test(dep.note)) return 'BLOCKED';
    if (/DEFERRED:/i.test(dep.note)) return 'DEFERRED';
    // ACCEPTED RISK falls through to normal risk calculation
  }
  
  // Security always critical
  if (dep.hasSecurityAdvisory) return 'CRITICAL';
  
  // Very old (possibly abandoned)
  if (ageInMonths > 24) return 'CRITICAL';
  
  // Stale major
  if (updateType === 'major' && ageInMonths > 18) return 'CRITICAL';
  
  // Moderately old major
  if (updateType === 'major' && ageInMonths >= 6) return 'HIGH';
  
  // Stale minor
  if (updateType === 'minor' && ageInMonths > 18) return 'HIGH';
  
  // Recent major
  if (updateType === 'major') return 'MEDIUM';
  
  // Moderately old minor
  if (updateType === 'minor' && ageInMonths >= 6) return 'MEDIUM';
  
  // Old patch
  if (updateType === 'patch' && ageInMonths > 12) return 'MEDIUM';
  
  // Everything else
  return 'LOW';
}
```

---

## Age Tracking

### Current Implementation Issues

**Problem 1: Duplicate columns**
- "Age" and "Behind by" show identical values
- Confusing and wastes space

**Problem 2: Unknown ages**
- `@types/*` packages show "Unknown"
- No explanation or tooltip

**Problem 3: Unclear semantics**
- What does "age" mean? Published date? Install date? Latest date?

---

### Refined Implementation

#### Single Age Metric

**Definition:** Age = time elapsed since the **installed version** was published

**Why this metric:**
- Answers: "How old is the code we're running?"
- Directly correlates with security risk, bug accumulation
- Clear, unambiguous

**Example:**
```
You're using: commander@12.1.0
Published: June 2, 2024
Today: February 2, 2026
Age: 20 months
```

---

#### Date Handling with date-fns

**Use `date-fns` library for robust date parsing and formatting:**

```bash
npm install date-fns
```

```typescript
import { formatDistanceToNow, parseISO } from 'date-fns';

async function getPackageAge(name: string, version: string): Promise<string | null> {
  try {
    const response = await fetch(`https://registry.npmjs.org/${name}`);
    const data = await response.json();
    
    const publishDate = data.time?.[version];
    if (!publishDate) {
      console.warn(`${name}@${version}: publish date not available`);
      return null;
    }
    
    const age = formatDistanceToNow(parseISO(publishDate), { 
      addSuffix: false 
    });
    
    return age; // Returns: "20 months", "6 months", "2 weeks", etc.
  } catch (error) {
    console.error(`${name}@${version}: fetch failed`, error);
    return null;
  }
}
```

**Why date-fns:**
- ✅ Automatic formatting ("20 months", "6 months", "2 weeks")
- ✅ Handles edge cases (leap years, DST, etc.)
- ✅ Tree-shakeable (small bundle size)
- ✅ TypeScript support
- ✅ Well-maintained, industry standard

---

#### Handling Unknown Ages

**Causes of unknown age:**
1. Package not in registry
2. Version not found
3. Registry missing `time` metadata
4. Network error

**Display treatment:**

**In table:**
```markdown
| Package | Current | Latest | Age | Risk |
|---------|---------|--------|-----|------|
| @types/node | 22.19.7 | 25.2.0 | ⚠️ Unknown | ⚠️ High |
```

**In HTML:**
```html
<td title="Age data unavailable from registry">
  <span class="unknown-age">⚠️ Unknown</span>
</td>
```

**In risk calculation:**
```typescript
// Treat unknown age as moderate risk (not critical, not low)
if (ageInMonths === null) {
  // Can't determine staleness, fall back to update type
  if (updateType === 'major') return 'HIGH'; // Cautious
  if (updateType === 'minor') return 'MEDIUM';
  return 'LOW';
}
```

---

#### Display Format

**Markdown table:**
```markdown
| Package | Current | Latest | Age | Risk |
|---------|---------|--------|-----|------|
| commander | 12.1.0 | 14.0.3 | 20 months | 🔴 Critical |
| zod | 3.25.76 | 4.3.6 | 8 months | ⚠️ High |
| eslint | 8.50.0 | 8.51.0 | 2 months | ✅ Low |
```

**HTML with tooltip:**
```html
<td class="age" title="Published: June 2, 2024">
  20 months
</td>
```

**Remove "Behind By" column entirely** - it's redundant.

---

## Runtime vs Dev Dependencies

### Separation Strategy

**Goal:** Make runtime dependencies immediately visible while keeping dev dependencies accessible but visually distinct.

**Implementation:** Separate display sections, same staleness threshold (18 months for both).

---

### Summary Statistics

**Separated counts:**

```markdown
📊 Dependency Health Summary

Runtime Dependencies
  Total: 9 | Outdated: 2 (22%) | Stale: 1 (11%) | Up-to-date: 7

Dev Dependencies
  Total: 4 | Outdated: 2 (50%) | Stale: 0 (0%) | Up-to-date: 2

Risk Breakdown
  🔴 Critical: 1 runtime, 0 dev
  ⚠️ High: 1 runtime, 2 dev
  📦 Medium: 0 runtime, 0 dev
  🚫 Blocked: 1 runtime
  📅 Deferred: 0
```

---

### Full Dependency List

**Separate tables:**

```markdown
## Runtime Dependencies

| Package | Current | Latest | Age | Risk | Notes |
|---------|---------|--------|-----|------|-------|
| commander | 12.1.0 | 14.0.3 | 20 months | 🔴 Critical | |
| zod | 3.25.76 | 4.3.6 | 8 months | ⚠️ High | |
| express | 4.18.2 | 4.18.3 | 3 months | ✅ Low | |

## Dev Dependencies

| Package | Current | Latest | Age | Risk | Notes |
|---------|---------|--------|-----|------|-------|
| @types/node | 22.19.7 | 25.2.0 | Unknown | ⚠️ High | |
| @types/minimatch | 5.1.2 | 6.0.0 | Unknown | 📦 Medium | |
| prettier | 3.0.0 | 3.0.3 | 1 month | ✅ Low | |
```

---

### Action Section Tags

**Tag each item with category:**

```markdown
## Action Required

### 🔴 Critical Risk (1)
• commander (12.1.0 → 14.0.3) - Runtime
  Major update, 20 months old, STALE

### ⚠️ High Priority (3)
• zod (3.25.76 → 4.3.6) - Runtime
  Major update, 8 months old
  
• @types/node (22.19.7 → 25.2.0) - Dev
  Major update, age unknown
  
• @types/minimatch (5.1.2 → 6.0.0) - Dev
  Major update, age unknown

### 🚫 Blocked Items (1)
• react (17.0.2 → 18.3.1) - Runtime
  🔴 BLOCKED: waiting for team migration
```

**Benefit:** Quick scan shows if issues are production or dev-only.

---

### HTML Filtering (Future Enhancement)

**Optional toggle in HTML report:**

```html
<div class="filters">
  <label>
    <input type="checkbox" id="hide-dev"> Hide dev dependencies
  </label>
</div>
```

**Note:** Not required for initial implementation, can add in enhancement phase.

---

## Notes System

### Current State

Notes defined in `.dep-report/notes.json`:
```json
{
  "react": "BLOCKED: waiting for team migration",
  "lodash": "DEFERRED: Q2 2026 - requires architecture refactor",
  "axios": "ACCEPTED RISK: pinned for stability @platform-team"
}
```

But displayed as plain text with no visual distinction.

---

### Enhanced Implementation

#### Keyword Detection

**Parse these patterns (case-insensitive):**

```typescript
function parseNoteStatus(note: string): NoteStatus {
  if (/BLOCKED:/i.test(note)) return 'BLOCKED';
  if (/DEFERRED:/i.test(note)) return 'DEFERRED';
  if (/ACCEPTED\s+RISK:/i.test(note)) return 'ACCEPTED_RISK';
  return 'NONE';
}
```

**Requirements:**
- Keyword must be followed by colon `:`
- Case-insensitive matching
- Supports variations: "Blocked:", "BLOCKED:", "blocked:"

---

#### Badge Display

**Markdown:**
```markdown
| Package | Notes |
|---------|-------|
| react | 🔴 BLOCKED: waiting for team migration |
| lodash | 🟡 DEFERRED: Q2 2026 - requires refactor |
| axios | 🔵 ACCEPTED RISK: pinned @platform-team |
```

**HTML:**
```html
<td class="notes">
  <span class="badge badge-blocked">BLOCKED</span>
  waiting for team migration
</td>
```

**CSS (already in your HTML):**
```css
.badge-blocked {
  background: #dc2626;
  color: white;
}
.badge-deferred {
  background: #f59e0b;
  color: white;
}
.badge-accepted {
  background: #3b82f6;
  color: white;
}
```

---

#### Action Section Treatment

**Blocked/Deferred get separate sections:**

```markdown
### 🔴 Critical Risk (1)
• commander (12.1.0 → 14.0.3) - Runtime
  Major update, 20 months old, STALE

### 🚫 Blocked Items (1)
• react (17.0.2 → 18.3.1) - Runtime
  🔴 BLOCKED: waiting for team migration
  [Would be Critical, but team has acknowledged]

### 📅 Deferred Items (1)
• lodash (4.17.21 → 4.18.0) - Runtime
  🟡 DEFERRED: Q2 2026 - requires architecture refactor
  [Scheduled for later, not forgotten]
```

**Accepted Risk stays in normal sections:**

```markdown
### 📦 Medium Priority (1)
• axios (0.27.2 → 1.6.7) - Runtime
  Minor update, 10 months old
  🔵 ACCEPTED RISK: pinned for API stability @platform-team
```

---

#### Impact on Risk Calculations

```typescript
function shouldCountInMetrics(dep: Dependency): boolean {
  const status = parseNoteStatus(dep.note);
  
  // Blocked and deferred are acknowledged, don't count
  if (status === 'BLOCKED' || status === 'DEFERRED') {
    return false;
  }
  
  // Accepted risk is acknowledged but still a risk
  return true;
}

// When calculating summary:
const activeCritical = dependencies
  .filter(shouldCountInMetrics)
  .filter(d => d.risk === 'CRITICAL')
  .length;
```

**Result:** Status badge won't say "Critical Risk" if the only critical item is blocked/deferred.

---

## Status Badge Logic

### Current Implementation

```
🔴 At Risk (8% stale)
```

**Problems:**
- Only considers staleness percentage
- Ignores major updates, security, etc.
- Not actionable

---

### Refined Logic

```typescript
function calculateStatusBadge(deps: Dependency[]): StatusBadge {
  // Exclude blocked/deferred from counts
  const active = deps.filter(shouldCountInMetrics);
  
  const criticalCount = active.filter(d => d.risk === 'CRITICAL').length;
  const highCount = active.filter(d => d.risk === 'HIGH').length;
  const staleCount = active.filter(d => d.isStale).length;
  const securityCount = active.filter(d => d.hasSecurityAdvisory).length;
  
  // Security is always critical
  if (securityCount > 0) {
    return {
      level: 'CRITICAL',
      emoji: '🔴',
      message: `Critical Risk (${securityCount} security, ${criticalCount} stale)`
    };
  }
  
  // Critical issues exist
  if (criticalCount > 0) {
    return {
      level: 'AT_RISK',
      emoji: '🔴',
      message: `At Risk (${criticalCount} critical, ${staleCount} stale)`
    };
  }
  
  // Many high priority items
  if (highCount > 3) {
    return {
      level: 'NEEDS_ATTENTION',
      emoji: '⚠️',
      message: `Needs Attention (${highCount} high priority)`
    };
  }
  
  // Has stale dependencies
  if (staleCount > 0) {
    return {
      level: 'HAS_STALE',
      emoji: '📦',
      message: `Has Stale Dependencies (${staleCount})`
    };
  }
  
  // All good
  return {
    level: 'HEALTHY',
    emoji: '✅',
    message: `Healthy (all dependencies current)`
  };
}
```

---

### Display Examples

**Critical (security):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔴 Critical Risk (2 security, 1 stale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**At Risk (no security, but critical items):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔴 At Risk (2 critical, 2 stale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Needs Attention (many high priority):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ⚠️ Needs Attention (5 high priority)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Has Stale (but low priority):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📦 Has Stale Dependencies (3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Healthy:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✅ Healthy (all dependencies current)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Summary Statistics

### Current Display

```
Total: 13 | Outdated: 4 | Stale: 1 | Up-to-date: 9
```

**Problems:**
- Doesn't separate runtime vs dev
- Missing risk breakdown
- No percentages for context

---

### Enhanced Display

```markdown
📊 Dependency Health Summary

Runtime Dependencies
  Total: 9 | Outdated: 2 (22%) | Stale: 1 (11%) | Up-to-date: 7

Dev Dependencies
  Total: 4 | Outdated: 2 (50%) | Stale: 0 (0%) | Up-to-date: 2

Risk Breakdown
  🔴 Critical: 1 runtime, 0 dev
  ⚠️ High: 1 runtime, 2 dev
  📦 Medium: 0 runtime, 0 dev
  ✅ Low: 0 runtime, 0 dev
  
Acknowledged Issues
  🚫 Blocked: 1
  📅 Deferred: 1
  🔵 Accepted Risk: 1
```

---

### HTML Card Layout

```html
<div class="summary-grid">
  <div class="summary-card">
    <strong>9</strong>
    <span>Runtime Dependencies</span>
  </div>
  <div class="summary-card">
    <strong>4</strong>
    <span>Dev Dependencies</span>
  </div>
  <div class="summary-card critical">
    <strong>1</strong>
    <span>Critical Risk</span>
  </div>
  <div class="summary-card high">
    <strong>3</strong>
    <span>High Priority</span>
  </div>
  <div class="summary-card">
    <strong>1</strong>
    <span>Stale (>18mo)</span>
  </div>
  <div class="summary-card">
    <strong>0</strong>
    <span>Security Issues</span>
  </div>
</div>
```

---

## Configuration Changes

### Current Config

```json
{
  "staleThreshold": "18 months",
  "ignorePatterns": [],
  "formats": {
    "markdown": true,
    "html": true
  },
  "concurrency": 5,
  "failConditions": {
    "stale": false,
    "major": false
  },
  "reportEmptyState": true
}
```

---

### Minimal Addition

```json
{
  "staleThreshold": "18 months",
  "ignorePatterns": [],
  "formats": {
    "markdown": true,
    "html": true
  },
  "concurrency": 5,
  "failConditions": {
    "stale": false,
    "major": false,
    "critical": false  // NEW: Exit code 1 if critical risk exists
  },
  "reportEmptyState": true
}
```

---

### Config Behavior

#### `staleThreshold`

**Applies to both runtime and dev dependencies.**

- Runtime deps: Stale if age > 18 months
- Dev deps: Stale if age > 18 months (same threshold)

**Rationale:** 18 months is already lenient; both types should be kept reasonably current.

**Implementation:**
```typescript
const staleThresholdMs = parseThreshold(config.staleThreshold);

function isStale(dep: Dependency): boolean {
  const ageMs = Date.now() - new Date(dep.publishedDate).getTime();
  return ageMs > staleThresholdMs;
}
```

---

#### `failConditions.critical`

**Exit with code 1 if any critical risk exists (excluding blocked/deferred).**

**Usage in CI:**
```yaml
- name: Check dependency health
  run: |
    dep-report
    # Exits with code 1 if critical risks found and critical: true
```

**Logic:**
```typescript
if (config.failConditions.critical) {
  const activeCritical = dependencies
    .filter(shouldCountInMetrics)
    .filter(d => d.risk === 'CRITICAL')
    .length;
  
  if (activeCritical > 0) {
    console.error(`❌ Critical risks found: ${activeCritical}`);
    process.exit(1);
  }
}
```

**Existing fail conditions still work:**
- `stale: true` → Exit if any stale dependencies
- `major: true` → Exit if any major updates available

---

## Display Changes

### Markdown Report Structure

```markdown
# Dependency Report (2026-02-02)

Generated at: 2026-02-02 08:25:15

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔴 At Risk (1 critical, 1 stale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Dependency Health Summary

Runtime Dependencies
  Total: 9 | Outdated: 2 (22%) | Stale: 1 (11%) | Up-to-date: 7

Dev Dependencies
  Total: 4 | Outdated: 2 (50%) | Stale: 0 (0%) | Up-to-date: 2

Risk Breakdown
  🔴 Critical: 1 runtime, 0 dev
  ⚠️ High: 1 runtime, 2 dev
  📦 Medium: 0 runtime, 0 dev

━━━ ACTION REQUIRED ━━━━━━━━━━━━━━━━━━━━━━━━━

### 🔴 Critical Risk (1)
• commander (12.1.0 → 14.0.3) - Runtime
  Major update, 20 months old, STALE

### ⚠️ High Priority (3)
• zod (3.25.76 → 4.3.6) - Runtime
  Major update, 8 months old
  
• @types/node (22.19.7 → 25.2.0) - Dev
  Major update, age unknown
  
• @types/minimatch (5.1.2 → 6.0.0) - Dev
  Major update, age unknown

### 🚫 Blocked Items (1)
• react (17.0.2 → 18.3.1) - Runtime
  🔴 BLOCKED: waiting for team migration

━━━ FULL DEPENDENCY LIST ━━━━━━━━━━━━━━━━━━━

## Runtime Dependencies

| Package | Current | Latest | Age | Risk | Notes |
|---------|---------|--------|-----|------|-------|
| commander | 12.1.0 | 14.0.3 | 20 months | 🔴 Critical | |
| zod | 3.25.76 | 4.3.6 | 8 months | ⚠️ High | |
| react | 17.0.2 | 18.3.1 | 12 months | 🚫 Blocked | 🔴 BLOCKED: team migration |

## Dev Dependencies

| Package | Current | Latest | Age | Risk | Notes |
|---------|---------|--------|-----|------|-------|
| @types/node | 22.19.7 | 25.2.0 | ⚠️ Unknown | ⚠️ High | |
| @types/minimatch | 5.1.2 | 6.0.0 | ⚠️ Unknown | 📦 Medium | |
```

---

### HTML Report Changes

#### Enhanced Summary Cards

```html
<div class="summary-section">
  <h2>📊 Dependency Health Summary</h2>
  
  <div class="summary-subsection">
    <h3>Runtime Dependencies</h3>
    <p>Total: 9 | Outdated: 2 (22%) | Stale: 1 (11%) | Up-to-date: 7</p>
  </div>
  
  <div class="summary-subsection">
    <h3>Dev Dependencies</h3>
    <p>Total: 4 | Outdated: 2 (50%) | Stale: 0 (0%) | Up-to-date: 2</p>
  </div>
  
  <div class="risk-breakdown">
    <h3>Risk Breakdown</h3>
    <div class="risk-grid">
      <div class="risk-item critical">
        <span class="count">1</span>
        <span class="label">Critical (Runtime)</span>
      </div>
      <div class="risk-item high">
        <span class="count">3</span>
        <span class="label">High (1 runtime, 2 dev)</span>
      </div>
    </div>
  </div>
</div>
```

#### Action Section with Tags

```html
<div class="action-section">
  <h2>Action Required</h2>
  
  <div class="action-group critical">
    <h3 class="action-title critical">🔴 Critical Risk (1)</h3>
    <div class="package-card">
      <div class="package-header">
        <strong>commander</strong> (12.1.0 → 14.0.3)
        <span class="dep-type">Runtime</span>
      </div>
      <div class="package-details">
        Major update, 20 months old, STALE
      </div>
    </div>
  </div>
  
  <div class="action-group high">
    <h3 class="action-title high">⚠️ High Priority (3)</h3>
    <div class="package-card">
      <div class="package-header">
        <strong>zod</strong> (3.25.76 → 4.3.6)
        <span class="dep-type">Runtime</span>
      </div>
      <div class="package-details">
        Major update, 8 months old
      </div>
    </div>
    <!-- More high priority items... -->
  </div>
  
  <div class="action-group blocked">
    <h3 class="action-title blocked">🚫 Blocked Items (1)</h3>
    <div class="package-card">
      <div class="package-header">
        <strong>react</strong> (17.0.2 → 18.3.1)
        <span class="dep-type">Runtime</span>
        <span class="badge badge-blocked">BLOCKED</span>
      </div>
      <div class="package-details">
        waiting for team migration
      </div>
    </div>
  </div>
</div>
```

#### Separate Dependency Tables

```html
<h2>Runtime Dependencies</h2>
<table class="runtime-deps">
  <thead>
    <tr>
      <th>Package</th>
      <th>Current</th>
      <th>Latest</th>
      <th>Age</th>
      <th>Risk</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="package-name">commander</td>
      <td>12.1.0</td>
      <td>14.0.3</td>
      <td title="Published: June 2, 2024">20 months</td>
      <td><span class="risk-badge critical">Critical</span></td>
      <td></td>
    </tr>
    <!-- More runtime deps... -->
  </tbody>
</table>

<h2>Dev Dependencies</h2>
<table class="dev-deps">
  <!-- Similar structure... -->
</table>
```

---

## Implementation Guide

### Phase 1: Risk Level System

**Files to modify:**
- Core dependency analyzer
- Risk calculation logic
- Display formatters

**Steps:**
1. Implement `calculateRisk()` function with 4-tier system
2. Add special handling for BLOCKED/DEFERRED/ACCEPTED RISK
3. Update action section grouping logic
4. Add risk breakdown to summary stats

**Testing:**
- Create test cases for each risk tier
- Verify blocked items don't count in metrics
- Check edge cases (unknown age, no updates)

---

### Phase 2: Age Tracking

**Dependencies to add:**
```bash
npm install date-fns
```

**Files to modify:**
- Package metadata fetcher
- Age calculation logic
- Display formatters

**Steps:**
1. Implement `getPackageAge()` with date-fns
2. Remove "Behind By" column
3. Add graceful handling for unknown ages
4. Add tooltips with exact publish dates in HTML

**Testing:**
- Test with packages of various ages
- Test with scoped packages (@types/*)
- Test error handling (registry unavailable)

---

### Phase 3: Runtime vs Dev Separation

**Files to modify:**
- Summary statistics calculator
- Table generators (markdown & HTML)
- Action section grouping

**Steps:**
1. Split dependency lists by type
2. Calculate separate stats for runtime/dev
3. Generate separate tables
4. Add dep-type tags in action section

**Testing:**
- Test with projects that have both types
- Test with dev-only projects
- Verify percentages are calculated correctly

---

### Phase 4: Notes System Enhancement

**Files to modify:**
- Notes parser
- Badge renderer
- Action section logic
- Risk metric calculations

**Steps:**
1. Implement keyword detection regex
2. Add badge rendering (markdown & HTML)
3. Create separate sections for blocked/deferred
4. Update `shouldCountInMetrics()` logic

**Testing:**
- Test all keyword variations (case-insensitive)
- Test notes without keywords
- Verify blocked items don't affect status badge

---

### Phase 5: Status Badge & Summary

**Files to modify:**
- Status badge calculator
- Summary stats generator
- Report header

**Steps:**
1. Implement `calculateStatusBadge()` logic
2. Update summary to show runtime/dev split
3. Add risk breakdown section
4. Update HTML summary cards

**Testing:**
- Test all status levels (Critical → Healthy)
- Verify blocked items don't affect status
- Check security advisory handling

---

### Phase 6: Config & Documentation

**Files to modify:**
- Config schema
- Config validator
- README.md

**Steps:**
1. Add `failConditions.critical` to schema
2. Update config documentation
3. Add migration notes for existing users
4. Update CLI help text

**Testing:**
- Test with missing config fields (defaults)
- Test fail condition in CI environment
- Verify backward compatibility

---

## Testing Strategy

### Unit Tests

```typescript
describe('Risk Calculation', () => {
  test('security advisory = critical', () => {
    const dep = {
      hasSecurityAdvisory: true,
      updateType: 'patch',
      ageInMonths: 1
    };
    expect(calculateRisk(dep)).toBe('CRITICAL');
  });
  
  test('major + stale = critical', () => {
    const dep = {
      hasSecurityAdvisory: false,
      updateType: 'major',
      ageInMonths: 20
    };
    expect(calculateRisk(dep)).toBe('CRITICAL');
  });
  
  test('blocked = separate category', () => {
    const dep = {
      updateType: 'major',
      ageInMonths: 20,
      note: 'BLOCKED: team decision'
    };
    expect(calculateRisk(dep)).toBe('BLOCKED');
  });
  
  // More test cases...
});

describe('Age Parsing', () => {
  test('formats age correctly', () => {
    const publishDate = new Date('2024-06-02');
    const age = formatDistanceToNow(publishDate, { addSuffix: false });
    expect(age).toMatch(/\d+ months?/);
  });
  
  test('handles unknown age', () => {
    const age = getPackageAge('nonexistent', '1.0.0');
    expect(age).toBeNull();
  });
});
```

---

### Integration Tests

```typescript
describe('Report Generation', () => {
  test('generates correct markdown structure', async () => {
    const report = await generateReport(mockDeps, config);
    
    expect(report).toContain('## Runtime Dependencies');
    expect(report).toContain('## Dev Dependencies');
    expect(report).toContain('### 🔴 Critical Risk');
    expect(report).toContain('### 🚫 Blocked Items');
  });
  
  test('HTML contains all sections', async () => {
    const html = await generateHTMLReport(mockDeps, config);
    
    expect(html).toContain('summary-section');
    expect(html).toContain('action-section');
    expect(html).toContain('runtime-deps');
    expect(html).toContain('dev-deps');
  });
});
```

---

### Manual Testing Checklist

**Before release:**

- [ ] Run against real project with mixed dependencies
- [ ] Verify all risk tiers appear correctly
- [ ] Check notes with all keyword types
- [ ] Test with unknown ages (@types/*)
- [ ] Verify runtime/dev separation
- [ ] Check status badge accuracy
- [ ] Test fail conditions in CI
- [ ] Verify HTML renders correctly in browser
- [ ] Check mobile responsiveness
- [ ] Test with empty state (no outdated deps)

---

## Migration Notes

### For Existing Users

**No breaking changes** - existing configs will continue to work.

**What changes automatically:**
- Reports now show runtime/dev sections separately
- Risk levels are more granular
- Status badge logic is more accurate
- Notes with keywords get badges

**Optional enhancements:**
- Add `failConditions.critical: true` for CI
- Add notes with BLOCKED/DEFERRED keywords
- Review new risk categorizations

**No action required** - just update and run.

---

## Success Metrics

**How we know this is working:**

1. **Clarity:** Users can explain what each risk level means
2. **Actionability:** Action section shows clear priorities
3. **Accuracy:** Status badge reflects actual risk state
4. **Completeness:** No confusion about age/staleness
5. **Separation:** Runtime vs dev distinction is clear

**User feedback to gather:**
- "Is the risk categorization making sense?"
- "Do blocked/deferred items show up correctly?"
- "Is the runtime/dev split helpful?"
- "Are the age displays clear?"

---

## Appendix A: Example Complete Report

See next page for full markdown and HTML examples showing all features.

---

### Markdown Example

```markdown
# Dependency Report (2026-02-02)

Generated at: 2026-02-02 08:25:15

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔴 At Risk (1 critical, 1 stale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Dependency Health Summary

Runtime Dependencies
  Total: 9 | Outdated: 3 (33%) | Stale: 1 (11%) | Up-to-date: 6

Dev Dependencies
  Total: 4 | Outdated: 2 (50%) | Stale: 0 (0%) | Up-to-date: 2

Risk Breakdown
  🔴 Critical: 1 runtime, 0 dev
  ⚠️ High: 1 runtime, 2 dev
  📦 Medium: 1 runtime, 0 dev
  
Acknowledged Issues
  🚫 Blocked: 1
  🔵 Accepted Risk: 1

━━━ ACTION REQUIRED ━━━━━━━━━━━━━━━━━━━━━━━━━

### 🔴 Critical Risk (1)
• commander (12.1.0 → 14.0.3) - Runtime
  Major update, 20 months old, STALE

### ⚠️ High Priority (3)
• zod (3.25.76 → 4.3.6) - Runtime
  Major update, 8 months old
  
• @types/node (22.19.7 → 25.2.0) - Dev
  Major update, age unknown
  
• @types/minimatch (5.1.2 → 6.0.0) - Dev
  Major update, age unknown

### 📦 Medium Priority (1)
• axios (0.27.2 → 1.6.7) - Runtime
  Minor update, 10 months old
  🔵 ACCEPTED RISK: pinned for API stability

### 🚫 Blocked Items (1)
• react (17.0.2 → 18.3.1) - Runtime
  🔴 BLOCKED: waiting for team migration Q2 2026

━━━ FULL DEPENDENCY LIST ━━━━━━━━━━━━━━━━━━━

## Runtime Dependencies

| Package | Current | Latest | Age | Risk | Notes |
|---------|---------|--------|-----|------|-------|
| commander | 12.1.0 | 14.0.3 | 20 months | 🔴 Critical | |
| zod | 3.25.76 | 4.3.6 | 8 months | ⚠️ High | |
| react | 17.0.2 | 18.3.1 | 12 months | 🚫 Blocked | 🔴 BLOCKED: team migration |
| axios | 0.27.2 | 1.6.7 | 10 months | 📦 Medium | 🔵 ACCEPTED RISK: API stability |
| express | 4.18.2 | 4.18.3 | 3 months | ✅ Low | |

## Dev Dependencies

| Package | Current | Latest | Age | Risk | Notes |
|---------|---------|--------|-----|------|-------|
| @types/node | 22.19.7 | 25.2.0 | ⚠️ Unknown | ⚠️ High | |
| @types/minimatch | 5.1.2 | 6.0.0 | ⚠️ Unknown | 📦 Medium | |
| prettier | 3.0.0 | 3.0.3 | 1 month | ✅ Low | |
```

---

## Appendix B: Risk Level Quick Reference

```
🔴 CRITICAL
├─ Security advisory (any)
├─ Major + stale (>18mo)
└─ Any + very old (>24mo)

⚠️ HIGH
├─ Major + moderately old (6-12mo)
└─ Minor + stale (>18mo)

📦 MEDIUM
├─ Major + recent (<6mo)
├─ Minor + moderately old (6-12mo)
└─ Patch + old (>12mo)

✅ LOW
├─ Minor + recent (<6mo)
└─ Patch + any age (<12mo)

🚫 BLOCKED
└─ Note contains "BLOCKED:"

📅 DEFERRED
└─ Note contains "DEFERRED:"

🔵 ACCEPTED RISK
└─ Note contains "ACCEPTED RISK:"
```

---

**End of Document**
