# Documentation Refinement: Findings & Action Plan

## Executive Summary

Received detailed feedback on documentation structure. The feedback proposes shifting from **feature-focused** to **problem-focused** documentation, emphasizing dep-report's unique value proposition: creating **evidence** rather than **noise**.

---

## Key Findings

### 1. **Core Value Proposition Identified**
> "Renovate/Dependabot create noise. dep-report creates evidence."

**Current State:**
- Homepage focuses on features ("Zero-config", "Age-based risk analysis")
- Missing the "why choose this over automated PR tools" narrative

**Proposed:**
- Lead with the problem (PR spam, lack of visibility, audit trail gaps)
- Position as a documentation/decision-making tool, not automation
- Emphasize: Evidence, Control, Transparency

### 2. **Documentation Structure Gap Analysis**

#### What We Have (Current):
```
Home (feature-focused)
├── Guide/
│   ├── Getting Started (introduction + quick start)
│   ├── Installation
│   ├── Usage (basic commands)
│   ├── Configuration (reference-style)
│   ├── Examples (scenarios)
│   └── Edge Cases
└── API/
    ├── CLI Commands
    └── Config Schema
```

#### What's Missing:
- **Problem statement** on homepage (why not Renovate?)
- **Visual comparison** (noise vs evidence)
- **"Understanding Reports"** page (how to interpret data)
  - Age vs Stale explained
  - Risk levels with actionable guidance
  - Audit trail concept
  - Notes system rationale
- **Integration patterns** (CI/CD, team workflows)
- **Advanced topics** (--include-config, architecture, transparency)
- **Progressive disclosure** (5-minute value → deep dive)

### 3. **Content Quality Issues**

#### Homepage:
- ❌ Doesn't explain the problem being solved
- ❌ No visual demonstration
- ❌ Features list reads like spec, not benefits
- ✅ Quick start section is good

#### Getting Started:
- ✅ Clear first-run workflow
- ✅ Good technical explanation
- ❌ Missing "What you just generated" walkthrough
- ❌ No annotated screenshot to teach report reading

#### Usage:
- ✅ Basic commands covered
- ❌ Missing "when to act on findings"
- ❌ No team workflow patterns
- ❌ Notes system poorly explained (just JSON editing)

#### Configuration:
- ❌ Reference-style, no guidance on choosing values
- ❌ Missing philosophy (zero-config → config-when-needed)
- ❌ No stale threshold tuning guidance

### 4. **Unique Differentiators Not Highlighted**
The feedback identifies features that competitors don't have:
- **--include-config** (full transparency, exportable logic)
- **Timestamped audit trail** (not just current state)
- **Notes system** (separating "can't" from "didn't")
- **No vendor lock-in** (just JSON and templates)

Current docs mention these but don't position them as unique advantages.

---

## Proposed Documentation Structure

```
Homepage (The "Why")
├── Hero: Problem-focused tagline
├── Visual comparison (Renovate vs dep-report)
├── One-liner demo
├── Three core benefits (Evidence, Control, Transparency)
└── CTA: "See it in action"

Quick Start (The "How" - 5 Minutes)
├── Run it
├── What you just generated (annotated screenshot)
├── Add context (notes demo)
├── Next steps (by intent)
└── FAQ (commit?, how often?, updates for me?)

Understanding Reports (The "What" - NEW)
├── Anatomy of a report (visual breakdown)
├── Risk levels explained (with actions)
├── Age vs Stale (why both matter)
├── Audit trail concept
├── Notes system (rationale + usage)
└── When to act on findings

Configuration (The "Customize")
├── Philosophy section (zero-config first)
├── Stale threshold tuning (guidance, not just options)
├── Report formats (with use cases)
├── CLI overrides (precedence explained)
└── Full reference

Integration (The "Scale" - NEW)
├── GitHub Actions (complete example)
├── Team workflows (weekly triage, quarterly review)
├── Exporting for management (HTML use case)
└── Pre-commit hooks (advanced)

Advanced (The "Deep Dive" - NEW)
├── --include-config (transparency USP)
├── Architecture diagram
├── Caching & performance
├── Future: middleware system
└── Troubleshooting

API Reference (The "Technical")
├── Commands (keep current)
└── Config schema (keep current)
```

---

## Action Plan

### Phase 1: MVP (Launch-Ready) ✅ Priority
Estimated: 4-6 hours

1. **Rewrite Homepage** (1.5 hours)
   - [ ] Add problem statement section
   - [ ] Visual comparison (can use text-based for MVP)
   - [ ] Reframe features as benefits (Evidence/Control/Transparency)
   - [ ] Update hero tagline

2. **Enhance Quick Start** (1 hour)
   - [ ] Add "What you just generated" section
   - [ ] Include annotated report example (code block with callouts)
   - [ ] Add FAQ section
   - [ ] Add "Next steps by intent" section

3. **Create "Understanding Reports" Page** (2 hours)
   - [ ] NEW PAGE: `/guide/understanding-reports.md`
   - [ ] Visual breakdown of report table
   - [ ] Risk levels with actionable guidance
   - [ ] Age vs Stale explanation
   - [ ] Audit trail section
   - [ ] Notes system rationale
   - [ ] "When to act" decision matrix

4. **Refine Configuration Page** (45 mins)
   - [ ] Add philosophy section at top
   - [ ] Guidance on choosing stale threshold values
   - [ ] Explain CLI precedence
   - [ ] Connect settings to use cases

5. **Update Navigation** (15 mins)
   - [ ] Add "Understanding Reports" to sidebar
   - [ ] Update config.js

### Phase 2: Team Adoption (After First Users)
Estimated: 3-4 hours

6. **Create Integration Page** (2 hours)
   - [ ] NEW PAGE: `/guide/integration.md`
   - [ ] GitHub Actions complete example
   - [ ] Team workflow patterns
   - [ ] Management reporting (HTML export)
   - [ ] Pre-commit hook example

7. **Create Advanced Page** (1.5 hours)
   - [ ] NEW PAGE: `/guide/advanced.md`
   - [ ] --include-config explanation
   - [ ] Architecture section
   - [ ] Caching details
   - [ ] Troubleshooting

8. **Consolidate Examples** (30 mins)
   - [ ] Merge examples.md content into relevant sections
   - [ ] Update examples to follow new narrative

### Phase 3: Polish (Optional)
Estimated: 2-3 hours

9. **Visual Enhancements**
   - [ ] Create actual comparison graphic (Renovate vs dep-report)
   - [ ] Screenshot of HTML report with annotations
   - [ ] Architecture diagram
   - [ ] Risk level color coding in docs

10. **Video/Interactive Content**
    - [ ] 2-minute demo video
    - [ ] Interactive tutorial (future consideration)

---

## Design Principles to Follow

From the feedback, apply these principles to all rewrites:

1. **Problem-first, not feature-first**
   - Lead with pain points before solutions
   
2. **Show, don't tell**
   - Annotated examples > paragraphs
   - Code snippets with context
   
3. **Progressive disclosure**
   - Quick Start = minimal (5 minutes to value)
   - Advanced = depth
   
4. **Connect features to outcomes**
   - Not "has notes system"
   - But "track blocked upgrades for audit trail"
   
5. **Respect user intelligence**
   - Assume technical competence
   - No hand-holding, but clear guidance
   
6. **Transparency as differentiator**
   - Emphasize --include-config
   - No black boxes

---

## Content Migrations

Some existing content needs to move:

- **getting-started.md** → Split "First Run" section to new "Understanding Reports" page
- **usage.md** → "Adding Notes" section → expand in "Understanding Reports"
- **usage.md** → "Caching & Refresh" → move to "Advanced"
- **examples.md** → Distribute scenarios to relevant sections
- **edge-cases.md** → Move to "Advanced > Troubleshooting"

---

## Metrics for Success

After implementation, measure:
- Time to first successful run (target: < 5 minutes from landing page)
- Reduction in "how do I read this report?" questions
- GitHub stars/forks (positioning clarity)
- Adoption in CI/CD (integration examples)


---

## Notes

- Feedback emphasizes **narrative** over **reference**
- Current docs are technically correct but lack persuasion
- The tool's unique value (evidence vs noise) isn't communicated
- Documentation should "sell" the tool while educating

---

## Proposed Page Restructuring (Radical Redesign)

### Overview

Complete documentation overhaul focusing on **user journey** rather than **feature catalog**. Each page serves a specific purpose in the user's progression from "I have a problem" to "I'm an expert."

---

## New Site Structure

```
┌─────────────────────────────────────────────────────────┐
│  Navigation: Home | Why | Learn | Integrate | Reference │
└─────────────────────────────────────────────────────────┘

├── 🏠 Home (/)
│   └── Landing page with demo
│
├── 🤔 Why dep-report? (/why)
│   ├── The Problem (PR spam, no visibility)
│   ├── Why Not Renovate/Dependabot?
│   ├── Core Philosophy (Evidence > Automation)
│   └── Who Should Use This?
│
├── 📚 Learn (Section)
│   ├── Quick Start (/learn/quick-start)
│   ├── Reading Reports (/learn/reading-reports)
│   ├── Making Decisions (/learn/making-decisions)
│   └── Team Workflows (/learn/workflows)
│
├── 🔧 Integrate (Section)
│   ├── GitHub Actions (/integrate/github-actions)
│   ├── GitLab CI (/integrate/gitlab)
│   ├── Pre-commit Hooks (/integrate/hooks)
│   └── Custom Workflows (/integrate/custom)
│
└── 📖 Reference (Section)
    ├── Configuration (/reference/config)
    ├── CLI Commands (/reference/cli)
    ├── Architecture (/reference/architecture)
    └── Troubleshooting (/reference/troubleshooting)
```

---

## Detailed Page Specifications

### 🏠 **Home Page** (/)

**Goal**: Hook users in 30 seconds, get them to Quick Start in 2 minutes.

**Content Structure**:

```markdown
┌─────────────────────────────────────────────┐
│ HERO SECTION                                 │
│ ─────────────────────────────────────────── │
│ Stop drowning in dependency PRs.             │
│ Start tracking dependency decisions.         │
│                                              │
│ [Try it now →]  [Why? →]                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ THE PROBLEM (Visual Split)                   │
│ ─────────────────────────────────────────── │
│                                              │
│  ❌ With Renovate          ✅ With dep-report│
│  ─────────────────         ────────────────  │
│  47 open PRs               1 timestamped     │
│  Merge conflicts           audit trail       │
│  Noise                     Evidence          │
│  No context                Full context      │
│                                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ONE-LINE DEMO                                │
│ ─────────────────────────────────────────── │
│                                              │
│  $ npx dep-report                            │
│                                              │
│  ✓ Found 12 outdated packages                │
│  ✓ 3 are stale (>18 months old)             │
│  ✓ Generated audit trail in .dep-report/    │
│                                              │
│  [See example report →]                      │
│                                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ THREE CORE BENEFITS (Cards)                  │
│ ─────────────────────────────────────────── │
│                                              │
│  🗂️ Evidence                                 │
│  Timestamped snapshots create an auditable   │
│  history. Show management "we knew this      │
│  was risky, here's why we waited."           │
│                                              │
│  🎛️ Control                                  │
│  Run manually, in CI, or pre-commit—you      │
│  decide. No auto-PRs, no vendor lock-in.     │
│                                              │
│  🔍 Transparency                             │
│  Export the entire logic with --include-     │
│  config. Modify templates, customize         │
│  scoring. No black boxes.                    │
│                                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ CTA SECTION                                  │
│ ─────────────────────────────────────────── │
│                                              │
│  Ready to try it?                            │
│  [Get Started (5 min) →]                     │
│                                              │
│  Want to learn more first?                   │
│  [Why dep-report? →]                         │
│                                              │
└─────────────────────────────────────────────┘
```

**Remove**: Feature list, badges, project status (move to footer/about)

---

### 🤔 **Why dep-report?** (/why)

**Goal**: Convince skeptics. Position against competitors. Establish credibility.

**Content Structure**:

```markdown
# Why dep-report?

## The Problem We're Solving

Your team ignores dependency updates until:
- ❌ A critical CVE forces a scramble
- ❌ Build breaks from 3-year-old packages  
- ❌ Management asks "why is our tech debt so high?"

You know you should update. But when? Which ones? Why these and not those?

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

## Ready to Try?

[Get Started (5 minutes) →](/learn/quick-start)
```

**This is the MOST IMPORTANT page.** It answers "why not just use what I have?"

---

### 📚 **Learn Section**

#### **Learn > Quick Start** (/learn/quick-start)

**Goal**: 5 minutes to first successful report and understanding what it means.

```markdown
# Quick Start

Get your first dependency report in 5 minutes.

## Step 1: Run It

```bash
npx dep-report
```

**What just happened?**
1. ✓ Detected your package manager (npm/pnpm/bun)
2. ✓ Scanned for outdated packages
3. ✓ Enriched with publish dates from registry
4. ✓ Generated reports in `.dep-report/reports/`

⏱️ First run: ~10 seconds (network calls)

## Step 2: View Your Report

Open `.dep-report/reports/latest.html` in a browser.

### What You're Looking At

[VISUAL: Annotated screenshot with numbered callouts]

┌────────────────────────────────────────────┐
│ Package  Current  Latest  Risk  Age  Stale │
│ ──────────────────────────────────────────│
│ ① lodash  4.0.0    4.17.21 ②Major ③5yr ④Yes │
│ ⑤ react   17.0.2   18.2.0  Major  2yr  No  │
└────────────────────────────────────────────┘

① **Package**: What needs attention
② **Risk**: Major/Minor/Patch (breaking changes likely?)
③ **Age**: How old is YOUR installed version
④ **Stale**: Exceeds 18-month threshold
⑤ **Your data**: Real packages from your project

## Step 3: Understand the Data

### Risk Levels (What to do)
- 🔴 **Major**: Breaking changes likely (1.x → 2.x)
  - **Action**: Schedule in sprint, test thoroughly
  
- 🟡 **Minor**: New features (1.1 → 1.2)  
  - **Action**: Review changelog, low-risk update
  
- 🟢 **Patch**: Bug fixes (1.1.1 → 1.1.2)
  - **Action**: Safe to batch with other patches

### Age vs Latest Version
**Key insight**: Age = time since YOUR version was published.

Example:
- You use `lodash@4.0.0` (published 5 years ago)
- Latest is `lodash@4.17.21` (published yesterday)
- **Your risk**: 5 years of accumulated CVEs, tech debt

### Stale Status
**Stale = Age > 18 months** (default, configurable)

Why 18 months?
- Security patches slow down
- Community support decreases  
- Upgrade friction increases exponentially

## Step 4: Add Context (Optional)

Found a package you can't upgrade yet?

```bash
dep-report init  # Creates config structure
```

Edit `.dep-report/notes.json`:

```json
{
  "lodash": "Blocked by legacy auth module. Upgrade planned Q2 2026"
}
```

Re-run `dep-report`—your note appears in the report.

## What's Next?

### For Solo Developers:
→ [Learn: Reading Reports](/learn/reading-reports)  
Understand when to act on findings

### For Teams:
→ [Learn: Team Workflows](/learn/workflows)  
Weekly triage, quarterly reviews, audit trails

### For CI/CD:
→ [Integrate: GitHub Actions](/integrate/github-actions)  
Automated dependency gates

## Common First Questions

**Q: Do I commit `.dep-report/` to git?**  
A: Yes, commit `reports/`, `notes.json`, `config.json`.  
   No, ignore `.cache.json` (already in `.gitignore`).

**Q: How often should I run this?**  
A: Weekly for awareness, before releases for rigor.

**Q: Does this update packages for me?**  
A: No. This is a **reporting tool**, not automation.
```

**Key principle**: Get to value FAST, then branch by intent.

---

#### **Learn > Reading Reports** (/learn/reading-reports)

**Goal**: Teach users to interpret data and make decisions.

```markdown
# Reading Reports

Learn to interpret the data and decide when to act.

## Anatomy of a Report

[DETAILED VISUAL BREAKDOWN]

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

**You can tune this.** See [Configuration](/reference/config).

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

- [Making Decisions](/learn/making-decisions) - How teams should use reports
- [Team Workflows](/learn/workflows) - Weekly triage, quarterly audits
- [Configuration](/reference/config) - Tune stale threshold for your needs
```

**This page teaches INTERPRETATION, not just mechanics.**

---

#### **Learn > Making Decisions** (/learn/making-decisions)

**Goal**: Teach teams how to use reports for decision-making, not just awareness.

```markdown
# Making Decisions

How to use reports for team decision-making, not just awareness.

## The Core Question

Reports tell you **what's outdated**.  
You decide **what matters and when**.

**dep-report doesn't make decisions. You do.**

## Individual Contributors

### Your Weekly Workflow

1. **Monday**: Run `dep-report`
2. **Scan for red flags**: Stale + Major
3. **Research**: Check changelogs, CVEs
4. **Propose**: "We should upgrade X because Y"
5. **Document**: Add notes for deferrals

### When to Raise Concerns

🚨 **Immediate escalation**:
- Stale package with known CVEs
- Breaking changes in dependencies of dependencies
- Build tool (webpack, vite) >2 years old

📋 **Sprint planning topic**:
- Multiple stale packages accumulating
- Major version jump available (React 17→18)

💬 **FYI in stand-up**:
- Minor updates available, batching this week
- Successfully upgraded X, no issues

## Tech Leads

### Your Quarterly Audit

1. **Generate report**
2. **Compare to last quarter**: Progress or regression?
3. **Identify chronic stale packages**: Why are they stuck?
4. **Prioritize**: Which packages need attention?
5. **Delegate**: Assign research to team members
6. **Export HTML**: Share with management/stakeholders

### Making Trade-offs

**Upgrade cost vs Risk cost**

| Scenario | Decision |
|----------|----------|
| Major upgrade, low usage in codebase | ✅ High value, do it |
| Major upgrade, touches 50+ files | 📅 Schedule dedicated sprint |
| Minor upgrade, no blockers | ✅ Batch with other minors |
| Stale but isolated (e.g. testing tool) | ⏸️ Lower priority |

### The Notes System for Leaders

Use notes to:
- **Track decisions**: "Deferred: refactor required"
- **Set expectations**: "Planned for Q2"
- **Document risk acceptance**: "Known issue, acceptable for now"

**Future you (or your successor) will thank you.**

## Team Workflows

### Pattern 1: Weekly Triage (Small Teams)

**When**: Every Monday, 15 minutes

**Process**:
1. Designated person runs `dep-report`
2. Team reviews `latest.html` in stand-up
3. Discuss high-priority findings (Stale + Major)
4. Assign action items or add notes

**Outcome**: Continuous awareness, low overhead

### Pattern 2: Sprint Planning Input (Medium Teams)

**When**: Before each sprint

**Process**:
1. Tech lead runs `dep-report`
2. Identifies 1-3 high-priority upgrades
3. Adds to sprint backlog with context
4. Team estimates and commits

**Outcome**: Dependency debt as first-class work

### Pattern 3: Quarterly Deep Dive (Large Teams)

**When**: End of each quarter

**Process**:
1. Generate report from each workspace/service
2. Tech leads present findings to management
3. Export HTML reports for stakeholders
4. Allocate dedicated sprint for debt reduction

**Outcome**: Executive visibility, dedicated time

## Communicating with Non-Technical Stakeholders

### The HTML Report is Your Friend

**What managers care about**:
- ❌ Not: "We have 47 outdated packages"
- ✅ But: "We have 3 high-risk stale dependencies"

**Show the HTML report**:
- Color-coded risk levels (visual)
- Age column (time = money = risk)
- Notes show we're aware and have a plan

### Sample Stakeholder Email

```
Subject: Q1 Dependency Audit Results

Team,

Attached is our dependency health report for Q1.

Key findings:
- ✅ Reduced stale dependencies from 12 to 5
- 🚨 2 packages need attention (see notes)
- 📅 3 major upgrades planned for Q2

No action needed from you—sharing for transparency.

Full report: [Attach latest.html]
```

**This is how you turn data into trust.**

## The Audit Trail Value

### Before dep-report:
- "Why didn't we upgrade that package?"  
  → "I don't remember, check Slack history from 2024"

### After dep-report:
- "Why didn't we upgrade that package?"  
  → "See 2025-03-15 report: 'Blocked by auth module refactor'"

**Decisions are documented automatically.**

## Anti-Patterns to Avoid

### ❌ "Update Everything" Reflex
Not all updates are urgent. Age + risk = priority.

### ❌ Analysis Paralysis
Don't research every package. Focus on Stale + Major first.

### ❌ Ignoring Notes
If you defer, document why. Future you needs context.

### ❌ Running Once and Forgetting
Reports are snapshots. Run regularly for trend data.

### ❌ Treating Reports as Tasks
Reports inform decisions. They're not a to-do list.

## Next Steps

- [Team Workflows](/learn/workflows) - Detailed workflow patterns
- [Integrate: GitHub Actions](/integrate/github-actions) - Automate report generation
- [Reading Reports](/learn/reading-reports) - Deep dive on interpretation
```

**This is about PROCESS, not tools.**

---

#### **Learn > Team Workflows** (/learn/workflows)

**Goal**: Specific, copy-paste team processes.

```markdown
# Team Workflows

Proven patterns for integrating dep-report into your team's routine.

## Overview

dep-report is flexible. You choose:
- **When**: Manual, weekly, daily, pre-release
- **Who**: Individual, tech lead, automated CI
- **Action**: Awareness, CI gate, audit trail

Here are battle-tested patterns.

---

## Pattern 1: Solo Developer (You + CI)

**Best for**: Side projects, solo SaaS, consultants

### Setup (5 minutes)

1. Add GitHub Action:

```yaml
# .github/workflows/dependencies.yml
name: Weekly Dependency Check
on:
  schedule:
    - cron: '0 9 * * 1'  # Monday 9am
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npx dep-report
      - uses: actions/upload-artifact@v4
        with:
          name: dep-report
          path: .dep-report/reports/latest.html
```

2. Check Actions tab Monday mornings
3. Download HTML, review over coffee

### Workflow

- **Monday**: Review report, note high-priority items
- **During week**: Upgrade if time permits
- **Before release**: Re-run, ensure no critical staleness

**Effort**: 10 min/week

---

## Pattern 2: Small Team Weekly Triage

**Best for**: 2-5 engineers, weekly sprints

### Setup

1. Designate "dependency owner" (rotates weekly)
2. Add to Monday stand-up agenda (5 minutes)
3. Configure Slack reminder:
   ```
   /remind #engineering "Run dep-report" every Monday at 8am
   ```

### Workflow

**Monday 8am** (5 minutes):
1. Dependency owner runs `dep-report`
2. Scans for Stale + Major (red flags only)
3. Posts screenshot to Slack:
   ```
   📊 Dependency Report:
   - ✅ 2 stale packages (down from 5 last week)
   - 🚨 axios still blocked (see notes)
   - 📅 Planning react upgrade for next sprint
   
   [Link to HTML report]
   ```

**During stand-up** (5 minutes):
- Discuss red flags
- Assign research if needed ("Can you check if axios 1.0 would break us?")
- Update notes for deferrals

**Weekly sprint planning**:
- Add 1-2 dependency upgrades to backlog
- Estimate like any other task

**Effort**: 15 min/week (team), 30 min/week (owner)

---

## Pattern 3: Medium Team Sprint Planning Input

**Best for**: 5-15 engineers, 2-week sprints

### Setup

1. Tech lead runs `dep-report` before sprint planning
2. Create dashboard view (optional):
   ```bash
   # Save to wiki/Confluence
   cp .dep-report/reports/latest.html ~/wiki/dependency-report.html
   ```

### Workflow

**Pre-planning** (Tech lead, 20 minutes):
1. Run `dep-report`
2. Compare to previous sprint's report
3. Identify 1-3 high-priority upgrades
4. Create tickets with context:
   ```
   Title: Upgrade axios to 1.6.0 (currently 0.19.0, 4 years old)
   
   Context:
   - Age: 4 years (stale)
   - Risk: Major version jump
   - Reason: Security fixes, performance improvements
   - Effort: ~5 points (breaking changes in API)
   
   See: .dep-report/reports/2026-01-30_outdated.html
   ```

**During sprint planning**:
- Present top 1-3 dependency tasks
- Team discusses feasibility
- Commit to 1-2 upgrades per sprint

**Mid-sprint**:
- Engineer completes upgrade
- Updates notes if issues found
- Re-runs `dep-report` to verify

**Retrospective**:
- "Did we complete dependency work?"
- "Should we prioritize more/less next sprint?"

**Effort**: 30 min/sprint (lead), varies (team)

---

## Pattern 4: Large Team Quarterly Audit

**Best for**: 15+ engineers, multiple services, compliance needs

### Setup

1. Quarterly dependency sprint (1 week dedicated)
2. Each service owner runs `dep-report` in their domain
3. Aggregate results for management

### Workflow

**Week before quarter end** (Service owners, 1 hour each):
1. Run `dep-report` in each service
2. Export HTML reports
3. Fill out summary template:
   ```markdown
   ## Service: auth-service
   
   **Status**:
   - Total outdated: 12
   - Stale: 3
   - High priority (Stale + Major): 1
   
   **Action items**:
   - Upgrade express (3 years old)
   - Defer react upgrade (blocked by UI refactor)
   
   **Report**: [Attach HTML]
   ```

**Quarterly review meeting** (Tech leads + management, 1 hour):
1. Present aggregated findings
2. Show trend: "Stale packages: Q4=20, Q1=12"
3. Request resources if needed: "We need 1 sprint for framework upgrades"
4. Set goals for next quarter: "Reduce stale to <5"

**Dependency sprint** (Full team, 1 week):
- Dedicated time for upgrades
- No new features this week
- Goal: Address all high-priority findings

**Outcome**:
- ✅ Executive visibility
- ✅ Dedicated time allocated
- ✅ Measurable progress (compare quarters)

**Effort**: 2 hours/quarter (per person), 1 sprint/quarter (team)

---

## Pattern 5: Pre-Release Gate (Advanced)

**Best for**: Regulated industries, high-reliability systems

### Setup

Add to CI before release:

```yaml
# .github/workflows/release.yml
name: Release Checks
on:
  push:
    tags: ['v*']

jobs:
  dependency-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - name: Dependency Gate
        run: |
          npx dep-report
          
          # Fail if >5 stale packages
          STALE_COUNT=$(grep -c "Stale: Yes" .dep-report/reports/latest.md || true)
          if [ "$STALE_COUNT" -gt 5 ]; then
            echo "❌ Too many stale dependencies ($STALE_COUNT)"
            exit 1
          fi
          
          echo "✅ Dependency gate passed"
```

### Workflow

**During development**:
- Normal workflow (weekly checks)

**Before release**:
- Tag triggers check
- If >5 stale: Release blocked
- Team addresses critical stale packages
- Re-tag to release

**Outcome**: Dependency quality gate enforced

**Warning**: This is aggressive. Start with high threshold (e.g., 10) and lower over time.

---

## Anti-Patterns

### ❌ Running Daily (Overkill)
Dependencies don't change that fast. Weekly is enough.

### ❌ No Ownership
If "everyone" is responsible, no one is. Assign a rotating owner.

### ❌ Generate But Don't Review
Reports aren't useful if no one looks at them.

### ❌ Treating It Like CI Tests
dep-report informs decisions, it's not pass/fail (unless you configure it that way).

---

## Choosing Your Pattern

| Team Size | Frequency | Pattern |
|-----------|-----------|---------|
| 1 | Weekly | Solo + CI |
| 2-5 | Weekly | Small Team Triage |
| 5-15 | Per Sprint | Sprint Planning Input |
| 15+ | Quarterly | Quarterly Audit |
| Any | Pre-release | Release Gate (optional) |

**Mix and match.** Many teams do Weekly + Quarterly.

---

## Next Steps

- [Integrate: GitHub Actions](/integrate/github-actions) - Complete CI/CD guide
- [Making Decisions](/learn/making-decisions) - Decision framework
- [Configuration](/reference/config) - Tune for your workflow
```

**This gives CONCRETE, ACTIONABLE patterns.**

---

### 🔧 **Integrate Section**

All integration pages follow the same structure:

```markdown
# [Platform Name]

## Why Use This Integration?

[1 sentence value prop]

## Complete Example

[Copy-paste ready code]

## What It Does

[Step-by-step explanation]

## Common Variations

[3-5 common tweaks with code]

## Troubleshooting

[Common issues + solutions]

## Next Steps

[Related pages]
```

Each integration page is STANDALONE and COMPLETE.

---

### 📖 **Reference Section**

#### **Reference > Configuration** (/reference/config)

Replaces current `configuration.md`. Changes:

1. **Add "Philosophy" section at top**:
   ```markdown
   ## Philosophy
   
   dep-report works zero-config.
   
   Configuration exists for tuning to YOUR team's needs:
   - Your "stale" might be 6 months (startup)
   - Your "stale" might be 3 years (regulated)
   
   Start with defaults. Configure when you feel friction.
   ```

2. **Add guidance to each option**:
   ```markdown
   ### staleThreshold
   
   **How to choose**:
   - Fast-moving project? 6-12 months
   - Legacy system? 2-3 years
   - Somewhere between? 18 months (default)
   
   **Examples**: ...
   ```

3. **Add "Precedence" section**:
   ```markdown
   ## Configuration Precedence
   
   CLI Args > Config File > Defaults
   
   Example:
   ```bash
   # Config says 18 months
   $ dep-report --threshold "6 months"  # Uses 6 months
   ```
   ```

**Structure**: Reference + Guidance

---

#### **Reference > Architecture** (/reference/architecture)

NEW PAGE. Content:

```markdown
# Architecture

## How dep-report Works

[Diagram: package.json → detector → scanner → normalizer → enricher → reporter]

### 1. Detection Phase
Looks for lockfiles in priority order:
- `pnpm-lock.yaml` → pnpm
- `bun.lock` → bun
- `package-lock.json` → npm

### 2. Scanning Phase
Runs package manager's outdated command:
```bash
npm outdated --json      # npm
pnpm outdated --json     # pnpm
bun outdated --json      # bun
```

### 3. Normalization Phase
Converts different package manager outputs to unified schema.

### 4. Enrichment Phase
For each outdated package:
1. Fetch registry metadata
2. Extract publish date of current version
3. Calculate age (now - publishDate)
4. Determine if stale (age > threshold)
5. Cache for future runs

### 5. Reporting Phase
1. Load templates (markdown + HTML)
2. Load notes (if exists)
3. Render reports
4. Write timestamped files
5. Update `latest.*` symlinks

## Full Transparency: --include-config

```bash
dep-report --include-config
```

Exports:
```
.dep-report/
├── templates/
│   ├── report.md.template
│   └── report.html.template
├── logic/
│   ├── risk-calculator.js
│   └── age-calculator.js
└── config-full.json
```

**What you can do**:
- Modify HTML styling (company branding)
- Customize risk scoring (your conventions)
- Add middleware (future: webhooks)
- Audit tool's logic (security/compliance)

**This is unique to dep-report.**

## Caching & Performance

### First Run
~5-10 seconds (network calls to registry)

### Subsequent Runs
~1-2 seconds (cached data)

### Cache Location
`.dep-report/.cache.json` (gitignored)

### Cache Invalidation
```bash
dep-report          # Uses cache if available
dep-report --force  # Bypasses cache
```

### When to Force Refresh
- Weekly CI runs (fresh data)
- After major dependency changes
- When cache seems stale

## Data Flow

```
package.json
    ↓
Detector (which PM?)
    ↓
Scanner (npm outdated)
    ↓
Normalizer (unified format)
    ↓
Enricher (fetch publish dates)
    ↓
Risk Calculator (age, stale, risk level)
    ↓
Reporter (templates + notes)
    ↓
.dep-report/reports/YYYY-MM-DD_outdated.{md,html}
```

## Next Steps

- [CLI Commands](/reference/cli) - All commands
- [Troubleshooting](/reference/troubleshooting) - Common issues
```

**This satisfies "how does it work?" questions.**

---

#### **Reference > Troubleshooting** (/reference/troubleshooting)

Merge current `edge-cases.md` content. Add troubleshooting guide:

```markdown
# Troubleshooting

## Common Issues

### "No package manager detected"

**Cause**: No lockfile found

**Solution**:
```bash
npm install  # Creates package-lock.json
pnpm install # Creates pnpm-lock.yaml
bun install  # Creates bun.lock
```

### "Registry unreachable"

**Cause**: Network issues or private registry misconfiguration

**Solutions**:
1. Check internet: `ping registry.npmjs.org`
2. Verify registry: `npm config get registry`
3. Use cache: `dep-report --refresh`

[... continue with all edge cases ...]

## Limitations

### Current (V1)
- No Yarn support (coming in V2)
- No monorepo workspace traversal (workaround: loop)
- No CLI args override (coming in V2)

### By Design
- Requires node_modules installed
- Requires internet on first run
- One project at a time (no multi-project mode)

## Getting Help

1. Check this page first
2. Search [GitHub Issues](...)
3. Open new issue with:
   - `dep-report --version`
   - Steps to reproduce
   - Expected vs actual behavior

```

---

## Content Migration Map

### Current → New Structure

| Current File | Action | New Location |
|--------------|--------|--------------|
| **index.md** | ❌ Rewrite from scratch | `/` (Home) |
| **getting-started.md** | ✂️ Split | → `/why` (intro)<br>→ `/learn/quick-start` (tutorial) |
| **installation.md** | 🗑️ Delete | Merge into `/learn/quick-start` |
| **usage.md** | ✂️ Split | → `/learn/reading-reports` (reports)<br>→ `/learn/workflows` (patterns)<br>→ `/reference/architecture` (caching) |
| **configuration.md** | ✏️ Enhance | `/reference/config` (add guidance) |
| **examples.md** | ✂️ Distribute | → `/integrate/*` (CI examples)<br>→ `/learn/workflows` (patterns)<br>→ `/reference/config` (config examples) |
| **edge-cases.md** | 🔀 Merge | → `/reference/troubleshooting` |
| **api/cli.md** | ✏️ Keep | `/reference/cli` (no changes) |
| **api/config-schema.md** | 🔀 Merge | → `/reference/config` |

---

## Navigation Structure

```javascript
// .vitepress/config.js
export default {
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Why?', link: '/why' },
      { 
        text: 'Learn', 
        items: [
          { text: 'Quick Start', link: '/learn/quick-start' },
          { text: 'Reading Reports', link: '/learn/reading-reports' },
          { text: 'Making Decisions', link: '/learn/making-decisions' },
          { text: 'Team Workflows', link: '/learn/workflows' }
        ]
      },
      { 
        text: 'Integrate', 
        items: [
          { text: 'GitHub Actions', link: '/integrate/github-actions' },
          { text: 'GitLab CI', link: '/integrate/gitlab' },
          { text: 'Pre-commit Hooks', link: '/integrate/hooks' },
          { text: 'Custom', link: '/integrate/custom' }
        ]
      },
      { 
        text: 'Reference', 
        items: [
          { text: 'Configuration', link: '/reference/config' },
          { text: 'CLI Commands', link: '/reference/cli' },
          { text: 'Architecture', link: '/reference/architecture' },
          { text: 'Troubleshooting', link: '/reference/troubleshooting' }
        ]
      },
      { text: 'GitHub', link: 'https://github.com/hussmarsidi/dep-reports' }
    ],
    
    sidebar: {
      '/learn/': [
        {
          text: 'Learn',
          items: [
            { text: 'Quick Start', link: '/learn/quick-start' },
            { text: 'Reading Reports', link: '/learn/reading-reports' },
            { text: 'Making Decisions', link: '/learn/making-decisions' },
            { text: 'Team Workflows', link: '/learn/workflows' }
          ]
        }
      ],
      '/integrate/': [
        {
          text: 'Integrations',
          items: [
            { text: 'GitHub Actions', link: '/integrate/github-actions' },
            { text: 'GitLab CI', link: '/integrate/gitlab' },
            { text: 'Pre-commit Hooks', link: '/integrate/hooks' },
            { text: 'Custom Workflows', link: '/integrate/custom' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Configuration', link: '/reference/config' },
            { text: 'CLI Commands', link: '/reference/cli' },
            { text: 'Architecture', link: '/reference/architecture' },
            { text: 'Troubleshooting', link: '/reference/troubleshooting' }
          ]
        }
      ]
    }
  }
}
```

---

## Visual Design Enhancements

### Homepage Hero
```vue
<!-- Custom hero component -->
<div class="hero-split">
  <div class="problem">
    <h3>❌ With Renovate</h3>
    <ul>
      <li>47 open PRs</li>
      <li>Merge conflicts</li>
      <li>No context</li>
    </ul>
  </div>
  <div class="solution">
    <h3>✅ With dep-report</h3>
    <ul>
      <li>1 audit trail</li>
      <li>Full context</li>
      <li>Evidence-based</li>
    </ul>
  </div>
</div>
```

### Report Anatomy Visuals
Use VitePress containers for callouts:

```markdown
::: info Package Name
The dependency that needs attention
:::

::: warning Risk Level
Major = breaking changes likely
:::

::: danger Age
How old is YOUR version (not latest)
:::
```

### Color Coding
```css
/* Risk levels */
.risk-major { color: #dc2626; }
.risk-minor { color: #ea580c; }
.risk-patch { color: #16a34a; }
.risk-exotic { color: #6b7280; }
```

---

## Implementation Priority

### Week 1: Foundation
1. ✅ Create `/why` page (most important!)
2. ✅ Rewrite home page
3. ✅ Create `/learn/quick-start`
4. ✅ Update navigation

**Ship this first.** It changes the narrative.

### Week 2: Depth
5. ✅ Create `/learn/reading-reports`
6. ✅ Create `/learn/making-decisions`
7. ✅ Enhance `/reference/config`
8. ✅ Create `/reference/architecture`

### Week 3: Integration
9. ✅ Create `/integrate/github-actions`
10. ✅ Create `/learn/workflows`
11. ✅ Merge troubleshooting
12. ✅ Delete old pages

### Week 4: Polish
13. ✅ Add visuals (screenshots, diagrams)
14. ✅ Add code syntax highlighting
15. ✅ Add search optimization
16. ✅ Final review & publish

---

## Success Metrics

After restructuring, track:

1. **Time to first run**: < 5 minutes from homepage
2. **Bounce rate**: Users who leave after homepage (should decrease)
3. **Page views**: `/why` should be top 3 most visited
4. **GitHub stars**: Clearer positioning = more stars
5. **Support questions**: "How do I read this?" should decrease

---

## Key Differences from Current Structure

| Current | New |
|---------|-----|
| Feature-focused | Problem-focused |
| Reference-style | Narrative-driven |
| Flat (all equal weight) | Progressive (quick → deep) |
| Technical | Persuasive + Technical |
| "Here's what it does" | "Here's why you need it" |
| Installation first | Problem first |
| One "Getting Started" | Separate: Why, Quick Start, Reading |
| Examples scattered | Dedicated Integration section |
| No "Why" page | **Why** is second page (critical) |
| Age buried in features | Age as core differentiator |
| Notes mentioned | Notes as audit trail USP |

**The biggest change**: We're not just documenting features. We're making a case.
