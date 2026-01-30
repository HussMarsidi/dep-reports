---
description: Learn to interpret dependency reports and prioritize updates
---

# Reading Reports

Understand what the data means and when to act.

## The Columns Explained

### Package Name
The dependency that needs attention.

### Current vs Latest
- **Current**: Your installed version
- **Latest**: Available version on registry

The version gap matters less than the age.

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

### Notes

Your custom context for each package:

```json
{
  "react": "Breaking changes require team training. Q3 2026.",
  "webpack": "Blocked by deprecated loaders. Evaluating Vite."
}
```

This context makes reports useful months later when reviewing decisions.

## The Audit Trail

Reports are timestamped: `YYYY-MM-DD_outdated.html`

```
.dep-report/reports/
├── 2026-01-15_outdated.html  # Before sprint
├── 2026-01-30_outdated.html  # After sprint
└── latest.html               # Current state
```

Compare reports over time:
- Track progress: "Reduced stale packages from 8 to 3 this quarter"
- Identify stuck packages: "These 3 haven't been addressed in 6 months"
- Show stakeholders: Documented evidence of dependency management

## When to Act

### High Priority: Stale + Major

```
| axios | 0.19.0 | 1.6.0 | Major | 24 months | Yes |
```

**Action:**
1. Check for known CVEs
2. Review breaking changes in changelog
3. Schedule for next sprint
4. Add note if blocked

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
| react | 17.0.2 | 18.2.0 | Major | 18 months | Yes | "Team training scheduled Q3" |
```

**Action:**
1. Add note explaining blocker
2. Set reminder to revisit
3. Re-evaluate quarterly

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
