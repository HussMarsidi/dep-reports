---
description: Why choose dep-report over automated PR tools? Understand the philosophy and unique value proposition.
---

# Why dep-report?

## The Visibility Problem

Managing dependencies is reactive by default. Updates pile up unnoticed until something forces action: a security advisory drops, a build breaks, or technical debt comes up in a review.

The challenge isn't updating packages—it's knowing which updates matter, when to act, and having evidence for those decisions. Automated PR tools solve the wrong problem: they create work without context.

**dep-report provides visibility first, automation second.**

## Comparison with Automation Tools

| Feature | dep-report | Renovate | Dependabot |
|---------|------------|----------|------------|
| **Primary Function** | Visibility & decision-making | Automated PR creation | Automated PR creation |
| **Automation** | None (intentional) | Full automation | Full automation |
| **Age Analysis** | ✅ Shows version age | ❌ Version diff only | ❌ Version diff only |
| **Stale Detection** | ✅ Configurable threshold | ❌ Not available | ❌ Not available |
| **Audit Trail** | ✅ Timestamped reports | ❌ PR history only | ❌ PR history only |
| **Decision Context** | ✅ Notes system | ❌ PR comments | ❌ PR comments |
| **Historical Tracking** | ✅ Compare over time | ❌ Current state only | ❌ Current state only |
| **Security Focus** | Age-based risk | CVE alerts | ✅ Native CVE alerts |
| **Configuration** | Flexible, exportable | Highly configurable | Limited options |
| **Integration** | CLI / CI agnostic | Many platforms | GitHub only |
| **Vendor Lock-in** | None (local files) | Self-hosted option | GitHub required |
| **Package Managers** | npm, pnpm, bun | 40+ ecosystems | Multiple supported |

### The Complementary Approach

These tools solve different problems:

**dep-report provides visibility:**
- What's outdated and why it matters
- Decision history with notes
- Quarterly reviews and audit trails
- Team prioritization discussions

**Renovate/Dependabot provide automation:**
- Automated update PRs
- Security patch alerts
- Reduced manual update work

**Together:** Use dep-report to understand and decide, then use automation tools to execute those decisions.

## Core Philosophy

### Evidence Over Automation

Reports create a timestamped record of dependency state. Six months later, you can see what was outdated, what you chose to defer, and why.

**Example:** A major framework update appears. You add a note: "Requires API migration, planned for Q3." That context is preserved in the report, not lost in Slack or Jira.

### Age as a Risk Factor

Version numbers tell you about compatibility. Age tells you about risk accumulation.

A package that hasn't been updated in 18 months likely has:
- Accumulated security issues (even if not Common Vulnerabilities and Exposures (CVE))
- Decreased community support
- Compatibility gaps with modern tooling
- Higher upgrade friction (more changes to review)

**We chose 18 months as a default threshold** based on typical open-source maintenance patterns. You can adjust this to match your team's risk tolerance.

### Context Belongs in Reports

Decision context shouldn't require archaeology through tickets, chat logs, or commit messages.

The notes system lets you document upgrade blockers directly in reports:
- "Waiting for team training on new API"
- "Breaking changes require refactor"
- "Low usage, deferred to Q4"

This context travels with the reports, creating self-documenting dependency history.

### Full Transparency

`--include-config` exports the tool's complete logic: templates, risk calculations, everything. You can:
- Modify HTML for company branding
- Adjust risk scoring to your conventions
- Audit the tool's behavior for compliance
- Fork and customize without limitations

No proprietary algorithms. No vendor lock-in. Your reports are markdown and HTML—readable without the tool.

## When dep-report is Useful

### Strong Fit

**Large dependency trees:** Projects with many dependencies where manual tracking is impractical.

**Infrequent update cycles:** Teams that batch updates quarterly or before releases, rather than updating continuously.

**Audit requirements:** Organizations that need documented evidence of dependency review and decision-making.

**Multi-team coordination:** When dependency updates require cross-team discussion and prioritization.

**Technical debt management:** Tech leads tracking long-term dependency health trends.

### Less Relevant

**Very small projects:** With <10 dependencies, manual review is straightforward.

**Always-current philosophy:** Teams that auto-merge all updates may not need additional visibility.

**Zero dependencies:** Tools and libraries without external dependencies don't need dependency management.

### Inline Context with Notes

Add notes to track upgrade blockers:

```json
{
  "react": "Breaking changes in v18 require team training. Scheduled for Q3 after certification.",
  "webpack": "Migration to v5 blocked by deprecated plugins. Evaluating alternatives."
}
```

Notes appear in reports, connecting technical state with human decisions. This is what makes reports useful months later.

[Get Started →](/guide/getting-started)

<style>
/* Header Styling - Match index.md */
h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 4rem 0 1.5rem 0;
  padding-bottom: 0;
  border-bottom: none;
  color: var(--vp-c-brand);
  transition: text-decoration 0.2s ease-in-out;
  display: inline-block;
}

h2:hover {
  text-decoration: underline;
  text-decoration-style: wavy;
  text-decoration-color: var(--vp-c-brand);
  text-underline-offset: 0.3em;
}

/* Style the anchor link that VitePress adds */
h2 a.header-anchor {
  color: var(--vp-c-brand);
  text-decoration: none;
  margin-left: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

h2:hover a.header-anchor {
  opacity: 1;
}

h2:first-of-type {
  margin-top: 2rem;
}

/* Smooth scroll for anchor links */
html {
  scroll-behavior: smooth;
}
</style>
