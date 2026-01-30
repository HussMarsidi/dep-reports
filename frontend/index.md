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
```

Then continue [reading your first report](/guide/understanding-reports).

---

## The Problem with Dependency Management

Your team ignores dependency updates until a critical CVE forces a scramble, builds break from 3-year-old packages, or management asks "why is our tech debt so high?"

You know you should update dependencies. But **when?** **Which ones?** **Why these and not those?**

**Renovate/Dependabot create noise. dep-report creates evidence.**

---

## Traditional Tools vs. Evidence-Based Approach

<div class="comparison-wrapper">

### Renovate / Dependabot
Automation-first approach

- 47 open pull requests
- Constant merge conflicts
- Noise-driven decision making
- No context or audit trail
- Opinionated automation

### dep-report
Evidence-first approach

- Single timestamped audit trail
- Complete context with annotations
- Evidence-based decision making
- Full transparency and history
- Zero-opinion documentation

</div>

**We're complementary, not competitive.** Use dep-report for visibility and decision-making. Use Renovate for automation after you've established your update strategy.

---

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

---

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

---

## Next Steps

### Get Started

Generate your first dependency report in 5 minutes.

```bash
npx dep-report
```

[Read the getting started guide →](/guide/getting-started)

### Review & Analysis

- [Understanding Reports](/guide/understanding-reports) — Learn to interpret findings and prioritize updates
- [Team Workflows](/guide/workflows) — Establish weekly triage and quarterly review processes

### Automation

- [GitHub Actions Integration](/integrate/github-actions) — Automated dependency monitoring and gates

---

## Deploy from CLI

### Track dependencies in CI

```bash
npx dep-report --ci
```

This command generates reports in your CI pipeline for continuous monitoring.

### Generate custom reports

```bash
npx dep-report --include-config
```

For complete configuration options, see [our CLI reference](/cli/reference).

---

## Discover More

Try out dep-report in minutes and learn how to get the most out of dependency evidence trails.

### Speed up your workflow with automated reporting

[Start Automation Tutorial](/guide/automation)

### Discover the benefits of evidence-based dependency management

[Learn More](/why)

---

## Join the Community

See the source code, connect with others, and share your feedback.

[GitHub](https://github.com/hussmarsidi/dep-reports) — View source code, submit a PR, or report an issue

[Discussions](https://github.com/hussmarsidi/dep-reports/discussions) — Ask questions and share your setup

[Issues](https://github.com/hussmarsidi/dep-reports/issues) — Report bugs or request features

---

<style>
/* Comparison Wrapper */
.comparison-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
}

.comparison-wrapper > div,
.comparison-wrapper > section {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.comparison-wrapper h3 {
  margin-top: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.comparison-wrapper p {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.comparison-wrapper ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.comparison-wrapper li {
  padding: 0.5rem 0;
  color: var(--vp-c-text-2);
  line-height: 1.6;
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
  margin: 3rem 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
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

/* Horizontal Rules */
hr {
  margin: 3rem 0;
  border: none;
  border-top: 1px solid var(--vp-c-divider);
}

/* Performance Metrics */
p strong:first-child {
  display: inline-block;
  margin-right: 0.5rem;
}
</style>