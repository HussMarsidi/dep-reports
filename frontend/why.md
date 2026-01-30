---
description: Why choose dep-report over automated PR tools? Understand the philosophy and unique value proposition.
---

# Why dep-report?

## The Problem We're Solving

Your team ignores dependency updates until:
- ❌ A critical CVE forces a scramble
- ❌ Build breaks from 3-year-old packages  
- ❌ Management asks "why is our tech debt so high?"

You know you should update. But when? Which ones? Why these and not those?

---

## Why Not Just Use Renovate/Dependabot?

Good tools. Wrong job.

| Automated Tools (Renovate)    | dep-report                     |
|-------------------------------|--------------------------------|
| Creates PRs automatically     | Creates evidence               |
| You merge or ignore           | You document and decide        |
| No audit trail of decisions   | Timestamped decision history   |
| Noise-driven                  | Signal-driven                  |
| Opinionated automation        | Zero-opinion documentation     |

**We're not competitors. We're complementary.**

Use Renovate for automation *after* you use dep-report for visibility.

---

## Our Philosophy

### 1. Evidence Over Automation
Documentation > Action. Decision-making > Doing.

### 2. Time is the Hidden Risk
A 3-year-old dependency has more CVEs, less support, higher upgrade friction.
Age matters more than version numbers.

### 3. Human Context Matters
"Why didn't we upgrade?" shouldn't require Jira archaeology.
Notes system: Track blockers inline with reports.

### 4. Transparency is Non-Negotiable
`--include-config` exports templates, logic, everything.
No black boxes. Ever.

---

## Who Should Use This?

### ✅ Perfect For:
- Teams drowning in Renovate PRs
- Projects with infrequent dependency reviews
- Organizations needing audit trails (compliance, finance)
- Tech leads managing technical debt
- Pre-release dependency gates

### 🤷 Not For:
- Projects with zero dependencies
- Teams happy with auto-merge bots
- "Update everything always" philosophies

---

## What Makes Us Different?

### 1. Timestamped Audit Trail
Not "current state"—historical snapshots.
Compare Jan vs Jun: Which packages are still stuck?

### 2. Age-Based Risk (Not Just Version)
Your installed version's age = actual risk.
`lodash@4.0.0` (5 years old) is riskier than version diff suggests.

### 3. Notes System
Separate "can't upgrade" from "didn't upgrade."
Context lives in the report, not Slack history.

### 4. Full Transparency
`--include-config` exports the entire tool's logic.
Modify risk scoring. Customize HTML. It's just JSON and templates.

### 5. No Vendor Lock-In
Reports are markdown + HTML. Templates are yours to edit.
Not dependent on our service, API, or existence.

---

## Ready to Try?

[Get Started (5 minutes) →](/guide/getting-started)
