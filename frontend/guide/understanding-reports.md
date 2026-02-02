---
description: Learn to interpret dependency reports and prioritize updates
---

# Reading Reports

Understand what the data means and when to act.

## Report Structure

Reports now include five main sections:
1. **Trend Analysis** - Historical health score and risk metrics over time
2. **Summary Block** - Risk status and key statistics at a glance
3. **Action Required** - Prioritized packages grouped by urgency (Security > Critical > High)
4. **Full Dependency List** - Complete table with all packages

## Summary Block

The summary block appears at the top of every report:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              🔴 At Risk (15% stale)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 47 | Outdated: 12 | Stale: 7 | Up-to-date: 35
Blocked: 3 | Deferred: 2 | Accepted Risk: 1

Risk Assessment: 7 stale dependencies and 4 unaddressed major upgrades detected.
```

**Risk Status Levels:**
- 🟢 **Healthy**: <5% stale, <10% outdated with majors
- 🟡 **Degrading**: 5-15% stale, 10-20% outdated with majors
- 🔴 **At Risk**: >15% stale OR >20% outdated with majors

**Key Metrics:**
- **Total**: All dependencies in your project
- **Outdated**: Packages with newer versions available
- **Stale**: Packages older than your threshold (default: 12 months)
- **Up-to-date**: Packages at latest version
- **Blocked/Deferred/Accepted**: Counts from note keywords

## Action Required Section

Prioritized packages that need attention, grouped by urgency:

### 🚨 Security Critical
Packages with known vulnerabilities (CVEs).
- Immediate action required
- Shows vulnerability severity and advisory link

### 🔴 Critical Risk
Packages with highest priority scores:
- Major updates with significant age
- Blocked upgrades (marked with 🔴 BLOCKED)
- Packages behind by >1 year

### ⚠️ High / Review Soon
Packages that should be reviewed:
- Minor updates with significant age
- Deferred upgrades (marked with 🟡 DEFERRED)
- Packages approaching stale threshold

**Display Rules:**
- Only shows packages with priority score >15
- Capped at 7 packages total
- Shows "✅ No critical actions required" if none found

## The Columns Explained

### Package Name
The dependency that needs attention.

### Current vs Latest
- **Current**: Your installed version
- **Latest**: Available version on registry

The version gap matters less than the age.

### Behind By
**Gap between when your installed version was published and when the latest version was published.**

This metric shows how far behind you are in terms of release cadence:
- `456d` - Latest was published 456 days after your installed version
- `—` - No data available (exotic versions, missing metadata)

**Example:**
```
axios: v0.21.0 (published 2020-05-15) → v1.6.7 (published 2021-08-15)
Behind by: 456 days
```

This tells you the latest version has been available for over a year.

### Status
- **✅ Stable**: Installed version equals latest version (no action needed)
- **Outdated**: Newer version available

### Risk Level

Based on semver version difference:

- **Major** (`1.x → 2.x`): Breaking changes likely
- **Minor** (`1.1 → 1.2`): New features, backward-compatible
- **Patch** (`1.1.1 → 1.1.2`): Bug fixes only
- **Exotic**: Non-semver versions (`file:`, `git+`, `workspace:`)
- **NotInstalled**: Listed in package.json but missing from node_modules

### Age (Most Important)

**Time since YOUR installed version was published.**

Not "how old is the latest version."  
Not "time since last update."

**Your actual risk exposure.**

**Example:**
```
axios@0.27.2 → Latest: 1.6.0
Published: May 2022 → Current: January 2026
Age: 20 months
```

A 20-month-old version has:
- Accumulated security issues
- Compatibility gaps with newer tools
- Missing performance improvements
- Higher migration effort

**Age compounds risk over time.**

### Stale Status

**Stale = Age exceeds threshold** (default: 18 months)

Why 18 months?
- Security patches typically slow after 12-18 months
- Community support and documentation becomes outdated
- Peer dependencies may no longer support old versions
- Build tools evolve, creating compatibility issues

Configurable in `config.json` based on your team's risk tolerance.

### Trend Analysis
Reports now track your dependency health over time (default: last 30 days).

**Metrics Tracked:**
- **Health Score**: 0-100 score (100 is perfect). Penalized by security issues, stale deps, and major risks.
- **Stale Count**: Number of packages exceeding your age threshold.
- **Critical Risks**: Number of high-priority interventions needed.

The HTML report includes an interactive chart showing your health score trajectory.

### Security
**Reports now integrate `npm audit` data directly.**

If a package has a known security vulnerability:
- It appears in **Action Required** with a 🚨 SECURITY badge.
- Details include severity (Critical/High), vulnerability title, and a link to the advisory.
- It receives the highest priority in remediation recommendations.

### Notes (Decision Log)

Your custom context for each package, with intelligent keyword detection:

```json
{
  "react": "BLOCKED: waiting for team migration",
  "lodash": "DEFERRED: Q2 2026 - requires architecture refactor",
  "axios": "ACCEPTED RISK: pinned for stability @platform-team",
  "typescript": "Just a regular note without keywords"
}
```

**Keyword Detection:**
Notes starting with keywords are automatically highlighted:
- 🔴 **BLOCKED**: Upgrade blocked by external dependency or team decision
- 🟡 **DEFERRED**: Upgrade planned for specific timeframe
- 🔵 **ACCEPTED RISK**: Risk acknowledged and accepted by team

**In Reports:**
- Keywords appear as badges in the Action Required section
- Counts appear in the Summary block
- Full notes appear in the table

This transforms tribal knowledge into an auditable decision log that makes reports useful months later.

## The Audit Trail

Reports are timestamped: `YYYY-MM-DD_outdated.html`

```
.dep-report/reports/
├── 2026-01-15_outdated.html  # Before sprint
├── 2026-01-30_outdated.html  # After sprint
└── latest.html               # Current state
```

**Compare reports over time:**
```bash
dep-report compare 2026-01-15 latest
```

Shows:
- Packages upgraded, added, removed
- Metric deltas (stale count, major upgrades)
- Health score improvement percentage

**Use cases:**
- Track progress: "Reduced stale packages from 8 to 3 this quarter"
- Identify stuck packages: "These 3 haven't been addressed in 6 months"
- Show stakeholders: Documented evidence of dependency management
- Monthly reviews: Quantify improvement in dependency health

## When to Act

### High Priority: Stale + Major

```
🔴 Critical Risk
• axios (v0.19.0 → v1.6.0)
  24 months old, behind by 456 days | Major update
```

**Action:**
1. Check for known CVEs
2. Review breaking changes in changelog
3. Schedule for next sprint
4. Add note if blocked: `"BLOCKED: waiting for team migration"`

### Medium Priority: Stale + Minor

```
| express | 4.17.1 | 4.18.2 | Minor | 20 months | Yes |
```

**Action:**
1. Review changelog for important fixes
2. Plan for next month
3. Test in staging first

### Low Priority: Recent Minor/Patch

```
| next | 14.0.0 | 14.1.0 | Minor | 3 months | No |
```

**Action:**
- Monitor and batch with other updates
- Not urgent

### Document: Blocked Updates

```
🔴 Critical Risk
• react (v17.0.2 → v18.2.0)
  18 months old, behind by 412 days | Major update
  🔴 BLOCKED: waiting for team migration
```

**Action:**
1. Add note with BLOCKED keyword: `"BLOCKED: waiting for team migration"`
2. Set reminder to revisit
3. Re-evaluate quarterly
4. Update note when blocker is resolved

**Note Keywords:**
- Use `BLOCKED:` for upgrades blocked by external factors
- Use `DEFERRED:` for upgrades planned for specific timeframe
- Use `ACCEPTED RISK:` for risks acknowledged by team

Don't let notes get stale—review them regularly.

## Decision Matrix

| Age       | Risk  | Stale? | Priority              |
|-----------|-------|--------|-----------------------|
| >18 mo    | Major | Yes    | High (this sprint)    |
| >18 mo    | Minor | Yes    | Medium (this month)   |
| 12-18 mo  | Major | No     | Medium (plan ahead)   |
| 12-18 mo  | Minor | No     | Low (quarterly)       |
| <12 mo    | Any   | No     | Monitor               |

**This is guidance, not rules.** Adjust based on your team's velocity and risk tolerance.

## Empty Reports Are Good

When everything is current:

```
✅ All dependencies are up to date
```

This proves you checked. Useful for:
- CI/CD logs
- Compliance audits
- Team accountability

## Next Steps

- [Configuration](/guide/configuration) - Tune stale threshold for your needs
- [Usage](/guide/usage) - Learn more about using dep-report
