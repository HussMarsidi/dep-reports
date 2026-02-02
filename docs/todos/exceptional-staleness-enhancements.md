# dep-report: Exceptional Staleness Enhancements

**Version:** 2.0  
**Date:** February 2, 2026  
**Status:** Specification for Future Implementation  
**Prerequisites:** Document 01 (Core Refinements) must be completed first

---

## Executive Summary

This document specifies enhancements that transform dep-report from a snapshot tool into a world-class dependency health monitoring system. While `npm outdated` shows what's outdated today, dep-report will show trends over time, prove progress, and provide actionable intelligence.

**Key Value Proposition:**

> "npm outdated shows you a snapshot. dep-report shows you the story, proves progress, and helps teams coordinate."

**Core Enhancements:**
1. Historical tracking & trending
2. Health score calculation (0-100 with trend)
3. Diff command (what changed since last scan)
4. Security advisory integration (npm audit)
5. Enhanced HTML visualizations (charts, interactivity)
6. Recommendations engine (prioritized actions)
7. Dashboard generation (historical view)
8. Multi-repo support (organizational view)

---

## Table of Contents

1. [Vision & Differentiation](#vision--differentiation)
2. [Historical Tracking](#historical-tracking)
3. [Health Score System](#health-score-system)
4. [Diff Command](#diff-command)
5. [Security Integration](#security-integration)
6. [Enhanced Visualizations](#enhanced-visualizations)
7. [Recommendations Engine](#recommendations-engine)
8. [Dashboard Generation](#dashboard-generation)
9. [Multi-Repo Support](#multi-repo-support)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Vision & Differentiation

### The Problem with npm outdated

```bash
$ npm outdated

Package        Current  Wanted  Latest  Location
lodash         4.17.21  4.17.21 4.18.0  node_modules/lodash
react          17.0.2   17.0.2  18.3.1  node_modules/react
```

**What it tells you:**
- ✅ What's outdated right now
- ✅ Version numbers

**What it doesn't tell you:**
- ❌ Is this getting better or worse?
- ❌ When were these published?
- ❌ Which ones have security issues?
- ❌ Which ones are related and should be updated together?
- ❌ What's the organizational pattern?
- ❌ Can I prove we're making progress?

---

### The dep-report Difference

**Historical Awareness:**
```
Dependency Health Trend (Last 90 Days)

Week 1: 🔴 At Risk (12 stale, 8 major)
Week 5: ⚠️ Needs Attention (9 stale, 6 major)
Week 9: 📦 Has Stale (5 stale, 3 major)
Week 13: ✅ Healthy (0 stale, 0 major)

📈 Trend: Improving (resolved 12 stale dependencies)
```

**Actionable Intelligence:**
```
💡 Recommended This Week

HIGH PRIORITY (2 items, ~4 hours effort)
1. ⚠️ lodash: Security + 18mo old
   Effort: Low | Risk: Low | Impact: 14 files
   
2. ⚠️ commander: Major + stale
   Effort: Medium | Risk: Medium | Impact: 8 files

MEDIUM PRIORITY (3 items, ~6 hours effort)
[See detailed breakdown...]

BLOCKED (acknowledged, 1 item)
• react: Team migration scheduled Q2
```

**Organizational View:**
```
📊 Organization-wide Health

repo-frontend:    82/100 ✅ (2 stale)
repo-backend:     65/100 ⚠️ (8 stale)
repo-mobile:      91/100 ✅ (0 stale)
repo-admin:       45/100 🔴 (15 stale)

Common Issues Across Org:
• lodash: 14 repos (avg age: 18mo)
• moment: 8 repos (avg age: 22mo)
```

---

### Value Propositions

**For Individual Developers:**
- "Show me what changed since last week"
- "Prove we're making progress"
- "Tell me what to work on today"

**For Teams:**
- "Track dependency health over time"
- "See who's keeping up, who's falling behind"
- "Document decisions for audits"

**For Organizations:**
- "Identify common patterns across repos"
- "Prioritize dependency upgrades org-wide"
- "Prove compliance and diligence"

---

## Historical Tracking

### Overview

Store every report as a versioned snapshot. Enable comparisons, trending, and proof of progress over time.

---

### Storage Structure

**Directory layout:**
```
.dep-report/
├── config.json
├── notes.json
├── reports/
│   ├── 2026-01-01_outdated.md
│   ├── 2026-01-01_outdated.html
│   ├── 2026-01-08_outdated.md
│   ├── 2026-01-08_outdated.html
│   ├── 2026-01-15_outdated.md
│   ├── 2026-01-15_outdated.html
│   ├── latest.md → 2026-01-15_outdated.md
│   └── latest.html → 2026-01-15_outdated.html
└── snapshots/
    ├── 2026-01-01.json
    ├── 2026-01-08.json
    └── 2026-01-15.json
```

**New:** `snapshots/` directory for machine-readable data.

---

### Snapshot Format

**JSON structure for trending/comparison:**

```json
{
  "timestamp": "2026-01-15T09:00:00Z",
  "summary": {
    "total": 13,
    "outdated": 4,
    "stale": 1,
    "upToDate": 9,
    "runtime": {
      "total": 9,
      "outdated": 2,
      "stale": 1
    },
    "dev": {
      "total": 4,
      "outdated": 2,
      "stale": 0
    }
  },
  "riskBreakdown": {
    "critical": 1,
    "high": 3,
    "medium": 0,
    "low": 0,
    "blocked": 1,
    "deferred": 0
  },
  "healthScore": 72,
  "statusLevel": "AT_RISK",
  "dependencies": [
    {
      "name": "commander",
      "current": "12.1.0",
      "latest": "14.0.3",
      "publishedDate": "2024-06-02T10:30:00Z",
      "ageInMonths": 20,
      "updateType": "major",
      "risk": "CRITICAL",
      "isStale": true,
      "isDev": false,
      "hasSecurityAdvisory": false,
      "note": null
    }
    // More dependencies...
  ]
}
```

**Why JSON snapshots:**
- Enables trending analysis
- Machine-readable for dashboards
- Can diff snapshots programmatically
- Supports API/integration use cases

---

### Trending Logic

**Compare current snapshot to history:**

```typescript
interface TrendData {
  period: string; // '7 days', '30 days', '90 days'
  snapshots: Snapshot[];
  metrics: {
    healthScore: TrendMetric;
    staleCount: TrendMetric;
    outdatedCount: TrendMetric;
    criticalCount: TrendMetric;
  };
}

interface TrendMetric {
  current: number;
  previous: number;
  change: number; // positive = improving, negative = worsening
  trend: 'improving' | 'stable' | 'worsening';
  sparkline: number[]; // for visualization
}

function calculateTrend(snapshots: Snapshot[]): TrendData {
  const sorted = snapshots.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const current = sorted[sorted.length - 1];
  const previous = sorted[sorted.length - 2];
  
  return {
    healthScore: {
      current: current.healthScore,
      previous: previous?.healthScore || current.healthScore,
      change: current.healthScore - (previous?.healthScore || current.healthScore),
      trend: current.healthScore > (previous?.healthScore || 0) 
        ? 'improving' 
        : current.healthScore < (previous?.healthScore || 0)
          ? 'worsening'
          : 'stable',
      sparkline: sorted.map(s => s.healthScore)
    },
    // Similar for other metrics...
  };
}
```

---

### Display in Reports

**Add trend section to reports:**

```markdown
# Dependency Report (2026-02-02)

Generated at: 2026-02-02 08:25:15

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🔴 At Risk (1 critical, 1 stale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Trend (Last 30 Days)

Health Score: 68 → 72 → 75 → 78 ✅ Improving (+10 points)
Stale packages: 5 → 3 → 2 → 1 ✅ Decreasing (-4)
Outdated: 12 → 8 → 6 → 4 ✅ Decreasing (-8)
Critical risk: 3 → 2 → 2 → 1 ✅ Improving (-2)

Progress: Resolved 8 outdated dependencies in last 30 days
```

**HTML visualization:**
```html
<div class="trend-section">
  <h2>📈 Health Trend (Last 90 Days)</h2>
  
  <div class="trend-chart">
    <!-- Canvas for sparkline/chart -->
    <canvas id="health-trend"></canvas>
  </div>
  
  <div class="trend-metrics">
    <div class="metric improving">
      <span class="label">Health Score</span>
      <span class="value">78</span>
      <span class="change">+10</span>
      <span class="arrow">↗</span>
    </div>
    
    <div class="metric improving">
      <span class="label">Stale Dependencies</span>
      <span class="value">1</span>
      <span class="change">-4</span>
      <span class="arrow">↘</span>
    </div>
  </div>
</div>
```

---

## Health Score System

### Overview

A 0-100 score that summarizes overall dependency health. Makes it easy to track progress and compare repos.

---

### Calculation Formula

**Weighted scoring system:**

```typescript
function calculateHealthScore(deps: Dependency[]): number {
  const base = 100;
  
  // Count active items (exclude blocked/deferred)
  const active = deps.filter(shouldCountInMetrics);
  
  const total = deps.length;
  const criticalCount = active.filter(d => d.risk === 'CRITICAL').length;
  const highCount = active.filter(d => d.risk === 'HIGH').length;
  const mediumCount = active.filter(d => d.risk === 'MEDIUM').length;
  const staleCount = active.filter(d => d.isStale).length;
  const veryOldCount = active.filter(d => d.ageInMonths > 24).length;
  const securityCount = active.filter(d => d.hasSecurityAdvisory).length;
  
  // Penalty weights
  const penalties = {
    security: 15,        // Security is critical
    critical: 10,        // Stale majors, very old packages
    high: 5,             // Recent majors, stale minors
    medium: 2,           // Recent minors, old patches
    stale: 3,            // Additional penalty for staleness
    veryOld: 5,          // Possibly abandoned
  };
  
  // Calculate deductions
  let score = base;
  score -= securityCount * penalties.security;
  score -= criticalCount * penalties.critical;
  score -= highCount * penalties.high;
  score -= mediumCount * penalties.medium;
  score -= staleCount * penalties.stale;
  score -= veryOldCount * penalties.veryOld;
  
  // Additional penalty for high percentage of outdated
  const outdatedPercent = (active.filter(d => d.risk !== 'LOW').length / total) * 100;
  if (outdatedPercent > 50) {
    score -= 10; // More than half outdated = significant debt
  }
  
  // Floor at 0
  return Math.max(0, Math.round(score));
}
```

---

### Score Tiers

```
90-100: ✅ Excellent
  - 0-1 outdated dependencies
  - 0 stale
  - 0 security issues
  - All major updates addressed

70-89: 📦 Good
  - <15% outdated
  - <3 stale
  - 0 critical security
  - Recent majors acknowledged

50-69: ⚠️ Fair
  - <30% outdated
  - <5 stale
  - <2 security issues
  - Some debt accumulating

25-49: 🔴 Poor
  - >30% outdated
  - Multiple stale dependencies
  - Security issues present
  - Significant debt

0-24: 🆘 Critical
  - Severe dependency debt
  - Many security issues
  - Abandoned dependencies
  - Immediate action required
```

---

### Display

**In summary:**
```markdown
📊 Health Score: 72/100 (Good) ↗ +4 from last week

Breakdown:
  Base: 100
  - Critical dependencies (1 × 10): -10
  - High priority (3 × 5): -15
  - Stale dependencies (1 × 3): -3
  ────────
  Score: 72
  
Trend: Improving (was 68 last week)
```

**Visual indicator:**
```html
<div class="health-score">
  <div class="score-display">
    <span class="score">72</span>
    <span class="max">/100</span>
  </div>
  
  <div class="score-bar">
    <div class="score-fill" style="width: 72%; background: #10b981">
      Good
    </div>
  </div>
  
  <div class="score-trend improving">
    ↗ +4 from last week
  </div>
</div>
```

---

## Diff Command

### Overview

Show what changed since the last scan. Essential for weekly reviews and tracking progress.

---

### Command Syntax

```bash
# Show changes since last scan
dep-report diff

# Compare to specific date
dep-report diff --since 2026-01-01

# Detailed per-package changes
dep-report diff --detailed

# JSON output for automation
dep-report diff --format json
```

---

### Diff Logic

**Compare two snapshots:**

```typescript
interface DiffResult {
  period: string; // "7 days ago"
  summary: {
    healthScoreChange: number;
    staleChange: number;
    outdatedChange: number;
  };
  resolved: Dependency[]; // Packages that were updated
  newIssues: Dependency[]; // Newly outdated packages
  worse: Dependency[]; // Packages that got older/riskier
  unchanged: Dependency[]; // Still the same issues
}

function diffSnapshots(current: Snapshot, previous: Snapshot): DiffResult {
  const resolved: Dependency[] = [];
  const newIssues: Dependency[] = [];
  const worse: Dependency[] = [];
  
  // Find resolved (was outdated, now up-to-date)
  previous.dependencies.forEach(prevDep => {
    const currDep = current.dependencies.find(d => d.name === prevDep.name);
    
    if (!currDep) return; // Package removed
    
    const wasOutdated = prevDep.current !== prevDep.latest;
    const isNowCurrent = currDep.current === currDep.latest;
    
    if (wasOutdated && isNowCurrent) {
      resolved.push(currDep);
    }
  });
  
  // Find new issues (was current, now outdated)
  current.dependencies.forEach(currDep => {
    const prevDep = previous.dependencies.find(d => d.name === currDep.name);
    
    if (!prevDep) {
      // New package added (and already outdated)
      if (currDep.current !== currDep.latest) {
        newIssues.push(currDep);
      }
      return;
    }
    
    const wasCurrent = prevDep.current === prevDep.latest;
    const isNowOutdated = currDep.current !== currDep.latest;
    
    if (wasCurrent && isNowOutdated) {
      newIssues.push(currDep);
    }
    
    // Check if got worse (same package, but older or higher risk)
    if (currDep.ageInMonths > prevDep.ageInMonths + 1) {
      worse.push(currDep);
    }
  });
  
  return {
    period: formatDistanceToNow(new Date(previous.timestamp)),
    summary: {
      healthScoreChange: current.healthScore - previous.healthScore,
      staleChange: current.summary.stale - previous.summary.stale,
      outdatedChange: current.summary.outdated - previous.summary.outdated,
    },
    resolved,
    newIssues,
    worse,
    unchanged: [] // Calculate if needed
  };
}
```

---

### Display Format

**Summary view (default):**

```markdown
📊 Changes Since Last Scan (7 days ago)

Health Score: 68 → 72 ✅ Improved (+4)

Summary:
  ✅ Resolved: 3 packages updated
  ⚠️ New Issues: 2 packages now outdated
  📉 Worse: 1 package got older
  
Breakdown:

✅ Resolved (3)
  • lodash: 4.17.21 → 4.18.0
  • axios: 0.27.2 → 1.6.7
  • prettier: 2.8.8 → 3.0.3

⚠️ New Issues (2)
  • react-router: 6.20.0 → 6.22.0 (minor, 2 weeks old)
  • typescript: 5.3.0 → 5.4.0 (minor, 1 week old)

📉 Got Worse (1)
  • commander: Still at 12.1.0 (was 19mo old, now 20mo)
```

**Detailed view:**

```markdown
📊 Detailed Changes Since Last Scan (7 days ago)

┌─────────────────────────────────────────────┐
│ lodash                                      │
├─────────────────────────────────────────────┤
│ Status: ✅ RESOLVED                         │
│ Was: 4.17.21 (outdated, 14mo old, High)    │
│ Now: 4.18.0 (current)                       │
│ Action: Updated to latest                   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ commander                                   │
├─────────────────────────────────────────────┤
│ Status: 📉 WORSE                            │
│ Was: 12.1.0 → 14.0.3 (19mo old, Critical)  │
│ Now: 12.1.0 → 14.0.3 (20mo old, Critical)  │
│ Action: Still not updated, getting older    │
└─────────────────────────────────────────────┘

[More detailed entries...]
```

---

### JSON Output

```bash
dep-report diff --format json
```

```json
{
  "period": "7 days ago",
  "summary": {
    "healthScoreChange": 4,
    "staleChange": -1,
    "outdatedChange": -3
  },
  "resolved": [
    {
      "name": "lodash",
      "was": "4.17.21",
      "now": "4.18.0",
      "action": "updated"
    }
  ],
  "newIssues": [
    {
      "name": "react-router",
      "current": "6.20.0",
      "latest": "6.22.0",
      "risk": "LOW"
    }
  ],
  "worse": [
    {
      "name": "commander",
      "wasAge": 19,
      "nowAge": 20,
      "risk": "CRITICAL"
    }
  ]
}
```

---

## Security Integration

### Overview

Integrate `npm audit` data to correlate security advisories with dependency staleness. Show which old packages also have security issues.

---

### Data Source

**Use npm audit:**

```bash
npm audit --json
```

**Output structure:**
```json
{
  "vulnerabilities": {
    "lodash": {
      "name": "lodash",
      "severity": "critical",
      "via": [
        {
          "source": 1234,
          "name": "lodash",
          "dependency": "lodash",
          "title": "Prototype Pollution",
          "url": "https://github.com/advisories/GHSA-xxxx",
          "severity": "critical",
          "range": "<4.17.21"
        }
      ]
    }
  }
}
```

---

### Integration Logic

```typescript
async function enrichWithSecurityData(deps: Dependency[]): Promise<Dependency[]> {
  // Run npm audit
  const auditResult = await exec('npm audit --json');
  const audit = JSON.parse(auditResult.stdout);
  
  // Map vulnerabilities to dependencies
  return deps.map(dep => {
    const vuln = audit.vulnerabilities[dep.name];
    
    if (!vuln) {
      return { ...dep, hasSecurityAdvisory: false };
    }
    
    return {
      ...dep,
      hasSecurityAdvisory: true,
      securityAdvisory: {
        severity: vuln.severity,
        title: vuln.via[0]?.title,
        url: vuln.via[0]?.url,
        affectedRange: vuln.via[0]?.range,
      }
    };
  });
}
```

---

### Display

**In action section:**

```markdown
### 🔴 Critical Risk (2)

• lodash (4.17.21 → 4.18.0) - Runtime
  🚨 SECURITY: Prototype Pollution (Critical)
  CVE-2024-XXXX | Published 30 days ago
  [View Advisory](https://github.com/advisories/GHSA-xxxx)
  
  Additionally: 18 months old, stale
  
• commander (12.1.0 → 14.0.3) - Runtime
  Major update, 20 months old, STALE
```

**In table:**

```markdown
| Package | Current | Latest | Age | Risk | Security | Notes |
|---------|---------|--------|-----|------|----------|-------|
| lodash | 4.17.21 | 4.18.0 | 18mo | 🔴 Critical | 🚨 CVE-2024-XXXX | |
| commander | 12.1.0 | 14.0.3 | 20mo | 🔴 Critical | - | |
```

**HTML badge:**

```html
<div class="package-card critical">
  <div class="package-header">
    <strong>lodash</strong> (4.17.21 → 4.18.0)
    <span class="security-badge critical">
      🚨 CRITICAL SECURITY
    </span>
  </div>
  
  <div class="security-details">
    <strong>Prototype Pollution</strong>
    <p>CVE-2024-XXXX | Published 30 days ago</p>
    <a href="https://github.com/advisories/GHSA-xxxx" target="_blank">
      View Advisory →
    </a>
  </div>
  
  <div class="package-details">
    Additionally: 18 months old, stale
  </div>
</div>
```

---

### Summary Stats

**Add security to summary:**

```markdown
📊 Dependency Health Summary

Runtime Dependencies
  Total: 9 | Outdated: 2 (22%) | Stale: 1 (11%)
  🚨 Security Issues: 2 (1 critical, 1 high)

Risk Breakdown
  🔴 Critical: 2 (1 security, 1 stale)
  ⚠️ High: 1
```

---

## Enhanced Visualizations

### Overview

Transform the HTML report from static to interactive with charts, filtering, and responsive design.

---

### Charts & Graphs

**1. Health Score Sparkline**

```html
<div class="health-sparkline">
  <canvas id="health-trend" width="300" height="60"></canvas>
</div>

<script>
// Using Chart.js or similar
const ctx = document.getElementById('health-trend').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Health Score',
      data: [68, 72, 75, 78],
      borderColor: '#10b981',
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  }
});
</script>
```

**2. Risk Distribution Pie Chart**

```html
<div class="risk-distribution">
  <canvas id="risk-pie"></canvas>
</div>

<script>
new Chart(document.getElementById('risk-pie'), {
  type: 'doughnut',
  data: {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      data: [1, 3, 0, 0],
      backgroundColor: ['#dc2626', '#f59e0b', '#3b82f6', '#10b981']
    }]
  }
});
</script>
```

**3. Age Distribution Histogram**

```html
<div class="age-histogram">
  <canvas id="age-chart"></canvas>
</div>

<script>
new Chart(document.getElementById('age-chart'), {
  type: 'bar',
  data: {
    labels: ['0-6mo', '6-12mo', '12-18mo', '18-24mo', '>24mo'],
    datasets: [{
      label: 'Dependencies by Age',
      data: [5, 3, 2, 2, 1],
      backgroundColor: '#3b82f6'
    }]
  }
});
</script>
```

---

### Interactive Features

**1. Sorting**

```html
<table class="sortable-table">
  <thead>
    <tr>
      <th data-sort="name">
        Package <span class="sort-arrow">↕</span>
      </th>
      <th data-sort="age">
        Age <span class="sort-arrow">↕</span>
      </th>
      <th data-sort="risk">
        Risk <span class="sort-arrow">↕</span>
      </th>
    </tr>
  </thead>
</table>

<script>
document.querySelectorAll('[data-sort]').forEach(header => {
  header.addEventListener('click', () => {
    const column = header.dataset.sort;
    sortTable(column);
  });
});
</script>
```

**2. Filtering**

```html
<div class="filters">
  <label>
    <input type="checkbox" id="show-runtime" checked>
    Runtime dependencies
  </label>
  <label>
    <input type="checkbox" id="show-dev" checked>
    Dev dependencies
  </label>
  <label>
    <input type="checkbox" id="show-critical" checked>
    Critical only
  </label>
</div>

<script>
document.getElementById('show-runtime').addEventListener('change', (e) => {
  document.querySelectorAll('.runtime-dep').forEach(row => {
    row.style.display = e.target.checked ? '' : 'none';
  });
});
</script>
```

**3. Search**

```html
<input 
  type="search" 
  placeholder="Search packages..." 
  id="package-search"
>

<script>
document.getElementById('package-search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll('tbody tr').forEach(row => {
    const packageName = row.querySelector('.package-name').textContent.toLowerCase();
    row.style.display = packageName.includes(query) ? '' : 'none';
  });
});
</script>
```

---

### Responsive Design

**Mobile-first CSS:**

```css
/* Mobile */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 0.875rem;
  }
  
  /* Hide less important columns on mobile */
  .hide-mobile {
    display: none;
  }
  
  /* Stack cards vertically */
  .package-card {
    padding: 0.75rem;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Recommendations Engine

### Overview

Prioritize actions based on effort, risk, and impact. Tell developers exactly what to work on.

---

### Recommendation Algorithm

```typescript
interface Recommendation {
  package: Dependency;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  impact: number; // Estimated files affected
  reasoning: string;
  estimatedTime: string; // "30 min", "2 hours", etc.
}

function generateRecommendations(deps: Dependency[]): Recommendation[] {
  const active = deps.filter(shouldCountInMetrics);
  
  return active.map(dep => {
    // Calculate effort
    const effort = calculateEffort(dep);
    
    // Calculate impact
    const impact = estimateImpact(dep);
    
    // Calculate priority
    const priority = calculatePriority(dep, effort, impact);
    
    return {
      package: dep,
      priority,
      effort,
      risk: mapRiskToEffortLevel(dep.risk),
      impact,
      reasoning: generateReasoning(dep, effort, impact),
      estimatedTime: estimateTime(effort, impact)
    };
  });
}

function calculateEffort(dep: Dependency): EffortLevel {
  // Minor/patch = low effort
  if (dep.updateType === 'patch') return 'low';
  if (dep.updateType === 'minor' && dep.ageInMonths < 6) return 'low';
  
  // Major but recent = medium
  if (dep.updateType === 'major' && dep.ageInMonths < 12) return 'medium';
  
  // Stale major = high effort (accumulated breaking changes)
  if (dep.updateType === 'major' && dep.isStale) return 'high';
  
  return 'medium';
}

function calculatePriority(
  dep: Dependency, 
  effort: EffortLevel,
  impact: number
): Priority {
  // Security always high priority
  if (dep.hasSecurityAdvisory) return 'high';
  
  // Low effort + critical = high priority (quick win)
  if (effort === 'low' && dep.risk === 'CRITICAL') return 'high';
  
  // High effort + low impact = low priority (defer)
  if (effort === 'high' && impact < 5) return 'low';
  
  // Critical risk = high priority
  if (dep.risk === 'CRITICAL') return 'high';
  
  // High risk + medium effort = medium priority
  if (dep.risk === 'HIGH') return 'medium';
  
  return 'low';
}

function generateReasoning(
  dep: Dependency,
  effort: EffortLevel,
  impact: number
): string {
  const reasons: string[] = [];
  
  if (dep.hasSecurityAdvisory) {
    reasons.push(`Security vulnerability (${dep.securityAdvisory.severity})`);
  }
  
  if (dep.isStale) {
    reasons.push(`Stale (${dep.ageInMonths} months old)`);
  }
  
  if (dep.updateType === 'major') {
    reasons.push('Major version update (potential breaking changes)');
  }
  
  if (effort === 'low') {
    reasons.push('Low effort upgrade');
  }
  
  if (impact > 10) {
    reasons.push(`High impact (${impact} files affected)`);
  } else if (impact < 5) {
    reasons.push(`Low impact (${impact} files affected)`);
  }
  
  return reasons.join(' • ');
}
```

---

### Display

**Prioritized action list:**

```markdown
💡 Recommended Actions

━━━ HIGH PRIORITY (2 items, ~4 hours total) ━━━

1. lodash (4.17.21 → 4.18.0)
   Effort: Low | Risk: Low | Impact: 14 files | Est: 30 min
   
   Why: Security vulnerability (critical) • Stale (18mo old) • Low effort upgrade
   
   Action: Run `npm update lodash` and test affected files
   
2. commander (12.1.0 → 14.0.3)
   Effort: Medium | Risk: Medium | Impact: 8 files | Est: 2 hours
   
   Why: Stale (20mo old) • Major version update
   
   Action: Review migration guide, update usage patterns

━━━ MEDIUM PRIORITY (3 items, ~6 hours total) ━━━

3. zod (3.25.76 → 4.3.6)
   Effort: Medium | Risk: Medium | Impact: 15 files | Est: 3 hours
   
   Why: Major version update • 8 months old
   
   Action: Test schema validations, check for breaking changes

[More items...]

━━━ LOW PRIORITY / DEFER (5 items) ━━━

8. prettier (3.0.0 → 3.0.3)
   Effort: Low | Risk: Low | Impact: 0 files | Est: 5 min
   
   Why: Patch update • Recent (1mo old)
   
   Action: Can update anytime during regular maintenance
```

---

## Dashboard Generation

### Overview

Generate a standalone HTML dashboard that visualizes all historical data, trends, and insights.

---

### Command

```bash
dep-report dashboard
```

**Output:**
```
✓ Generated dashboard at .dep-report/dashboard.html
✓ Includes data from 12 snapshots (last 90 days)

Open in browser:
  file:///path/to/project/.dep-report/dashboard.html
```

---

### Dashboard Features

**1. Hero Section**

```html
<div class="dashboard-hero">
  <h1>Dependency Health Dashboard</h1>
  <p class="project-name">Project: my-awesome-app</p>
  
  <div class="current-status">
    <div class="status-badge good">
      📦 Good Health (72/100)
    </div>
    <div class="trend improving">
      ↗ Improving (+10 from 30 days ago)
    </div>
  </div>
</div>
```

**2. Health Trend Chart**

```html
<div class="chart-section">
  <h2>Health Score Over Time</h2>
  <canvas id="health-timeline"></canvas>
  
  <div class="chart-insights">
    <p>📈 Peak: 82/100 on Jan 15</p>
    <p>📉 Low: 62/100 on Dec 1</p>
    <p>✅ Trend: +20 points in 90 days</p>
  </div>
</div>
```

**3. Key Metrics**

```html
<div class="metrics-grid">
  <div class="metric-card">
    <h3>Stale Dependencies</h3>
    <div class="metric-chart">
      <canvas id="stale-trend"></canvas>
    </div>
    <p class="metric-summary">
      Down from 12 to 1 (↓92%)
    </p>
  </div>
  
  <div class="metric-card">
    <h3>Outdated Packages</h3>
    <div class="metric-chart">
      <canvas id="outdated-trend"></canvas>
    </div>
    <p class="metric-summary">
      Down from 24 to 4 (↓83%)
    </p>
  </div>
  
  <div class="metric-card">
    <h3>Critical Issues</h3>
    <div class="metric-chart">
      <canvas id="critical-trend"></canvas>
    </div>
    <p class="metric-summary">
      Down from 5 to 1 (↓80%)
    </p>
  </div>
</div>
```

**4. Timeline**

```html
<div class="timeline-section">
  <h2>Activity Timeline</h2>
  
  <div class="timeline">
    <div class="timeline-item resolved">
      <span class="date">Feb 1</span>
      <span class="event">✅ Resolved lodash security issue</span>
    </div>
    
    <div class="timeline-item updated">
      <span class="date">Jan 28</span>
      <span class="event">📦 Updated 3 dependencies</span>
    </div>
    
    <div class="timeline-item blocked">
      <span class="date">Jan 25</span>
      <span class="event">🔴 Blocked react upgrade (team decision)</span>
    </div>
  </div>
</div>
```

**5. Top Issues**

```html
<div class="top-issues-section">
  <h2>Current Top Issues</h2>
  
  <div class="issue-list">
    <div class="issue-card critical">
      <h3>commander</h3>
      <p class="issue-meta">Critical • 20 months old • Major update</p>
      <p class="issue-impact">8 files affected</p>
      <a href="reports/latest.html#commander">View Details →</a>
    </div>
    
    <!-- More issues... -->
  </div>
</div>
```

---

## Multi-Repo Support

### Overview

Scan multiple repositories to get an organizational view of dependency health.

---

### Command Syntax

```bash
# Scan multiple local repos
dep-report --repos "../frontend,../backend,../mobile"

# Scan with custom output
dep-report --repos "../*" --output org-report.html

# Generate org dashboard
dep-report dashboard --org
```

---

### Data Aggregation

```typescript
interface OrgReport {
  repos: RepoHealth[];
  commonIssues: CommonIssue[];
  orgHealthScore: number;
  summary: {
    totalRepos: number;
    healthyRepos: number;
    atRiskRepos: number;
    criticalRepos: number;
  };
}

interface RepoHealth {
  name: string;
  path: string;
  healthScore: number;
  status: StatusLevel;
  summary: {
    total: number;
    outdated: number;
    stale: number;
    critical: number;
  };
}

interface CommonIssue {
  package: string;
  affectedRepos: string[];
  avgAge: number;
  avgHealthImpact: number;
  recommendation: string;
}

async function scanMultipleRepos(repoPaths: string[]): Promise<OrgReport> {
  const results = await Promise.all(
    repoPaths.map(async (path) => {
      const snapshot = await scanRepo(path);
      return {
        name: basename(path),
        path,
        healthScore: snapshot.healthScore,
        status: snapshot.statusLevel,
        summary: snapshot.summary
      };
    })
  );
  
  // Find common issues
  const commonIssues = findCommonIssues(results);
  
  return {
    repos: results,
    commonIssues,
    orgHealthScore: calculateOrgScore(results),
    summary: {
      totalRepos: results.length,
      healthyRepos: results.filter(r => r.healthScore >= 70).length,
      atRiskRepos: results.filter(r => r.healthScore < 70 && r.healthScore >= 50).length,
      criticalRepos: results.filter(r => r.healthScore < 50).length,
    }
  };
}
```

---

### Display

**Org dashboard:**

```markdown
# Organization Dependency Health

Generated: 2026-02-02

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 Org Health Score: 76/100 (Good)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Repository Health

| Repository | Health | Status | Stale | Outdated | Critical |
|------------|--------|--------|-------|----------|----------|
| frontend | 82/100 | ✅ Good | 2 | 4 | 0 |
| backend | 65/100 | ⚠️ Fair | 8 | 12 | 2 |
| mobile | 91/100 | ✅ Excellent | 0 | 1 | 0 |
| admin | 45/100 | 🔴 Poor | 15 | 23 | 5 |

## Common Issues Across Org

### lodash (affects 14 repos)
  Avg age: 18 months | Avg impact: -12 health points
  
  Recommendation: Coordinate org-wide upgrade
  Affected: frontend, backend, admin, api, worker, ...

### moment (affects 8 repos)
  Avg age: 22 months | Avg impact: -8 health points
  
  Recommendation: Consider migration to date-fns or dayjs
  Affected: backend, admin, reporting, analytics, ...

## Recommendations

HIGH PRIORITY:
  1. Address critical issues in 'admin' repo (45/100)
  2. Coordinate lodash upgrade across 14 repos
  3. Migrate away from moment (deprecated)

MEDIUM PRIORITY:
  4. Improve 'backend' repo health (65/100)
  5. Update common dev dependencies org-wide
```

---

## Implementation Roadmap

### Phase 1: Core Refinements (Week 1-2)
**Prerequisites from Document 01:**
- ✅ Risk level system
- ✅ Age tracking with date-fns
- ✅ Runtime vs dev separation
- ✅ Notes system enhancement
- ✅ Status badge logic

---

### Phase 2: Historical Tracking (Week 3-4)

**Tasks:**
1. Create snapshot storage system
2. Implement JSON snapshot format
3. Build trending logic
4. Add trend display to reports
5. Test with historical data

**Deliverables:**
- Snapshots stored in `.dep-report/snapshots/`
- Trend section in reports
- Health score with historical context

---

### Phase 3: Diff Command (Week 5)

**Tasks:**
1. Implement diff logic
2. Build summary view
3. Build detailed view
4. Add JSON output
5. Write CLI command

**Deliverables:**
- `dep-report diff` command
- Summary and detailed views
- JSON output for automation

---

### Phase 4: Security Integration (Week 6)

**Tasks:**
1. Integrate npm audit
2. Parse vulnerability data
3. Enrich dependencies with security info
4. Update displays with security badges
5. Add security to health score

**Deliverables:**
- Security advisories in reports
- Updated health score calculation
- Security-aware prioritization

---

### Phase 5: Enhanced Visualizations (Week 7-8)

**Tasks:**
1. Add Chart.js dependency
2. Implement sparklines
3. Build interactive tables
4. Add filtering/sorting
5. Improve responsive design

**Deliverables:**
- Interactive HTML reports
- Charts and graphs
- Mobile-responsive design

---

### Phase 6: Recommendations Engine (Week 9)

**Tasks:**
1. Implement effort calculation
2. Build priority algorithm
3. Generate reasoning
4. Create recommendations section
5. Test prioritization accuracy

**Deliverables:**
- Prioritized action list
- Effort/impact estimates
- Reasoning for each recommendation

---

### Phase 7: Dashboard Generation (Week 10-11)

**Tasks:**
1. Build dashboard generator
2. Create dashboard template
3. Implement timeline view
4. Add historical charts
5. Polish UI/UX

**Deliverables:**
- `dep-report dashboard` command
- Standalone HTML dashboard
- Historical visualizations

---

### Phase 8: Multi-Repo Support (Week 12+)

**Tasks:**
1. Implement multi-repo scanner
2. Build aggregation logic
3. Find common issues
4. Create org dashboard
5. Test with real org structure

**Deliverables:**
- Multi-repo scanning
- Org-wide health report
- Common issue detection

---

## Success Metrics

**How we know we've succeeded:**

### User Metrics
- Users run `dep-report` weekly (vs monthly for npm outdated)
- Teams reference health score in planning meetings
- Diff command used in PR reviews
- Dashboard shared with stakeholders

### Technical Metrics
- Health score correlates with actual security incidents
- Recommendations followed >70% of the time
- Trending shows improving health over time

### Feedback
- "This saved us during an audit"
- "We can finally prove we're keeping dependencies current"
- "The dashboard helps prioritize sprint work"

---

## Future Enhancements (Beyond Scope)

**Ideas for future versions:**

1. **Automated PRs** - Generate upgrade PRs based on recommendations
2. **CI Integration** - Post reports as GitHub comments
3. **Slack Integration** - Weekly health summaries
4. **Custom Metrics** - User-defined health calculations
5. **Dependency Graph** - Visualize dependency trees
6. **Breaking Change Detection** - Parse changelogs automatically
7. **Team Workflows** - Assign upgrades to team members
8. **SaaS Dashboard** - Hosted dashboard service

---

**End of Document**

**Next Steps:**
1. Complete Document 01 (Core Refinements) first
2. Get feedback from users
3. Implement enhancements in phases
4. Iterate based on usage patterns
