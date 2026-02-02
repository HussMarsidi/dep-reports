---
layout: home
description: Stop drowning in dependency PRs. Start tracking dependency decisions with evidence-based reports.

hero:
  name: dep-report
  text: Stop drowning in dependency PRs.
  tagline: Start tracking dependency decisions with evidence-based reports.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Why dep-report?
      link: /why
    - theme: alt
      text: View on GitHub
      link: https://github.com/hussmarsidi/dep-reports
---

## Quick Start
```bash
npx dep-report
npx dep-report open  # View report in browser
```

Generates a timestamped dependency report showing:
- Which packages are outdated
- 🚨 Known security vulnerabilities (npm audit)
- 📈 Health trends over time
- How long since they were updated
- Major vs minor vs patch updates
- Saved to `.dep-report/reports/` for audit trail

First run takes ~10s (fetching metadata), then ~1-2s cached.

[Reading and using reports](/guide/understanding-reports)

## The Problem

Dependency updates pile up. You get bombarded with automated PRs but can't tell which ones actually matter. No context, just version bumps.

A security advisory drops and you're scrambling to figure out your exposure. A build breaks because some package hasn't been touched in 3 years. Management asks about technical debt and you're pulling together an answer on the spot.

The real issue isn't automation - it's visibility. You need to see what's outdated, understand the risk, and have evidence for your decisions. Not just a flood of PRs.

**Renovate/Dependabot create noise. dep-report creates evidence.**

## The Automation Problem

Automated dependency tools are great at creating PRs. They're terrible at helping you decide which PRs matter.

You end up with a pile of open PRs, no context about what's actually important, and no record of why you updated (or didn't update) something months ago.

dep-report flips this: it gives you visibility first. Generate reports showing what's outdated. Review them with your team. Make decisions based on actual data. Build a history of those decisions.

Then use automation tools to execute the updates you've decided on. Complementary, not competitive.

<div class="comparison-wrapper">
<div class="comparison-item">
### With Automated PRs

You have 47 open Renovate PRs:
- `axios: 0.27.2 → 1.6.0`
- `react: 18.2.0 → 18.3.1`
- `lodash: 4.17.19 → 4.17.21`
- ... 44 more

**Your questions:**
- Which ones are breaking changes?
- Which have security fixes?
- Can I batch these?
- Why did we skip the last update?

**Your answer:** ¯\\\_(ツ)_/¯

No context. No history. Just version bumps.
</div>
<div class="comparison-item">
### With dep-report

You run `npx dep-report` and get:
```json
{
  "axios": {
    "current": "0.27.2",
    "latest": "1.6.0",
    "age": "728 days",
    "type": "major"
  },
  "react": {
    "current": "18.2.0", 
    "latest": "18.3.1",
    "age": "145 days",
    "type": "minor"
  }
}
```

**Your decisions:**
- axios: major update, research breaking changes first
- react: safe minor, batch with next sprint
- lodash: patch security fix, update today

**Six months later:** Check previous reports to see why you're still on axios 0.27.2. Find notes about blocking issues in 1.x.

You have context. You have history. You make informed decisions.
</div>
</div>

**The workflow:** Use dep-report to understand and decide. Use Renovate to automate the execution.

## How It Works

### 1. Package Manager Detection

Automatically identifies npm, pnpm, or bun in your project.

### 2. Dependency Analysis

Scans for outdated packages across your entire dependency tree.

### 3. Metadata Enrichment

Fetches publish dates and package age from package registries.

### 4. Report Generation

Creates timestamped reports in `.dep-report/reports/`

**Performance:**
- Initial run: ~10 seconds (network calls)
- Subsequent runs: ~1-2 seconds (cached)

[View example report →](/guide/getting-started#what-you-just-generated)

## Core Principles

### Evidence-Based Documentation

Timestamped snapshots create an auditable history of dependency decisions. Demonstrate to stakeholders that risks were identified and decisions were deliberate.

**Documentation that serves as evidence, not just data.**

### Developer Control

Run manually, integrate into CI pipelines, or add to pre-commit hooks. No automatic PRs. No vendor lock-in. Complete control over your workflow.

**Your process, your timeline, your decisions.**

### Full Transparency

Export complete logic with `--include-config`. Modify report templates. Customize scoring algorithms. Inspect and adjust every aspect of the tool.

**No proprietary algorithms. No black boxes.**

## Learn More

- [Understanding Reports](/guide/understanding-reports) — Learn to interpret findings and prioritize updates
- [Why dep-report?](/why) — Understand the philosophy and benefits

## Advanced Usage

### CI/CD Integration

```bash
npx dep-report --ci
```

Generates reports in your CI pipeline for continuous monitoring.

### Export Configuration

```bash
npx dep-report --include-config
```

Exports templates and logic for full transparency and customization.

For complete configuration options, see [CLI reference](/api/cli).

## Join the Community

See the source code, connect with others, and share your feedback.

[GitHub](https://github.com/hussmarsidi/dep-reports) — View source code, submit a PR, or report an issue

[Discussions](https://github.com/hussmarsidi/dep-reports/discussions) — Ask questions and share your setup

[Issues](https://github.com/hussmarsidi/dep-reports/issues) — Report bugs or request features

<style>
/* Comparison Wrapper */
.comparison-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.comparison-wrapper > div,
.comparison-wrapper > section,
.comparison-item {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.comparison-item h3 {
  margin-top: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 1rem;
}

.comparison-item p {
  margin: 1rem 0;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.comparison-item ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.comparison-item li {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

.comparison-item code {
  background: var(--vp-c-bg-alt);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.comparison-item pre {
  margin: 1rem 0;
  overflow-x: auto;
}

.comparison-item strong {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

@media (max-width: 768px) {
  .comparison-wrapper {
    grid-template-columns: 1fr;
  }
}

/* Clean Typography */
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

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
}

p {
  line-height: 1.7;
  margin: 1rem 0;
}

strong {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* Code Blocks */
div[class*="language-"] {
  margin: 1.5rem 0;
  border-radius: 6px;
}

/* Links */
a {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  text-decoration: underline;
}

/* Lists */
ul, ol {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

li {
  margin: 0.5rem 0;
  line-height: 1.6;
}

/* Section Spacing */
section,
.section-content {
  margin-bottom: 2rem;
}

/* Performance Metrics */
p strong:first-child {
  display: inline-block;
  margin-right: 0.5rem;
}

/* Smooth scroll for anchor links */
html {
  scroll-behavior: smooth;
}
</style>