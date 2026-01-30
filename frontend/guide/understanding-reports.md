---
description: Learn to interpret the data and decide when to act on dependency findings
---

# Reading Reports

Learn to interpret the data and decide when to act.

## Anatomy of a Report

### The Table Columns

#### 1. Package
Self-explanatory. The dependency name.

#### 2. Current vs Latest
- **Current**: What you have installed right now
- **Latest**: What's available on the registry

**The gap matters less than age.**

#### 3. Risk Level

Your upgrade risk based on semver:

- **Major** (🔴): `1.x → 2.x` - Breaking changes likely
- **Minor** (🟡): `1.1 → 1.2` - New features, backward-compatible
- **Patch** (🟢): `1.1.1 → 1.1.2` - Bug fixes only
- **Exotic** (⚪): Non-semver (`file:`, `git+`, `workspace:`)
- **NotInstalled** (❌): Listed but missing from node_modules

#### 4. Age ⭐ Most Important Column

**Age = Time since your installed version was published.**

Not "how old is the latest version."  
Not "when was it last updated."

**Your actual risk in production.**

**Example**:
```
lodash@4.0.0 → Latest: 4.17.21
Age: 5 years ⚠️
```

A 5-year-old dependency has:
- ✗ More accumulated CVEs
- ✗ Less community support
- ✗ Higher upgrade friction
- ✗ Potential performance issues
- ✗ Missing modern features

**Age is compound risk.**

#### 5. Stale Status

**Stale = Age exceeds threshold** (default: 18 months)

Visual indicator: ⚠️ or 🚨

Why 18 months?
- Security: Most projects slow patch releases after ~1 year
- Community: Stack Overflow answers get stale
- Dependencies: Peer deps may no longer work
- Tooling: Build tools evolve, old packages break

**You can tune this.** See [Configuration](/guide/configuration).

#### 6. Notes

Your custom context. Answers:
- "Why haven't we upgraded?"
- "What's blocking this?"
- "When are we planning to address this?"

**This is what makes the audit trail useful.**

## Reading the Report as a Whole

### The Audit Trail Concept

Reports are timestamped: `YYYY-MM-DD_outdated.md`

```
.dep-report/reports/
├── 2026-01-15_outdated.html  ← Pre-sprint
├── 2026-01-30_outdated.html  ← Post-sprint
└── latest.html               ← Always newest
```

**Compare reports over time:**
- "We reduced stale packages from 12 to 3 this quarter"
- "These 5 packages have been stuck for 6 months—why?"
- "Show management: here's our progress"

**This is evidence, not just data.**

### Empty Reports Are Good

If all deps are up-to-date:

```
✅ All dependencies are up to date
```

**This proves you checked.** Useful in CI logs, audit trails.

## When to Act

### Immediate Action Required

**Stale + Major = High Priority**

```
| axios | 0.19.0 | 1.6.0 | Major | 4 years | Stale |
```

This is a ticking time bomb.

**Action**:
1. Check for known CVEs
2. Review breaking changes in changelog
3. Schedule upgrade in next sprint
4. Add note if blocked

### Quarterly Review

**Minor/Patch Updates + Not Stale**

```
| react | 18.0.0 | 18.2.0 | Minor | 8 months | No |
```

Not urgent, but don't ignore.

**Action**:
1. Batch with other minor updates
2. Test in staging
3. Deploy with next release

### Monitor

**Recent packages, small gaps**

```
| next | 14.0.0 | 14.1.0 | Minor | 2 months | No |
```

You're in good shape. Check again next quarter.

### Document & Defer

**Blocked upgrades**

```
| react | 17.0.2 | 18.2.0 | Major | 2 years | Stale | "Waiting for team training" |
```

**Action**:
1. Add note explaining blocker
2. Set reminder to revisit
3. Re-evaluate blocker validity quarterly

**Don't let notes get stale too.**

## Decision Matrix

| Age       | Risk  | Stale? | Action                      |
|-----------|-------|--------|-----------------------------|
| >2 years  | Major | Yes    | 🚨 Sprint this week         |
| >2 years  | Minor | Yes    | 📅 Schedule this month      |
| 1-2 years | Major | Yes    | 📅 Plan for next quarter    |
| 1-2 years | Minor | No     | 🔄 Quarterly review         |
| <1 year   | Any   | No     | ✅ Monitor                  |

**This is guidance, not gospel.** Tune to your team's velocity and risk tolerance.

## Next Steps

- [Making Decisions](/guide/making-decisions) - How teams should use reports
- [Team Workflows](/guide/workflows) - Weekly triage, quarterly audits
- [Configuration](/guide/configuration) - Tune stale threshold for your needs
