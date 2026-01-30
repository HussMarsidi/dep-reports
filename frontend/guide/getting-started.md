---
description: Get your first dependency report in 5 minutes
---

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
⏱️ Subsequent runs: ~1-2 seconds (cached)

## Step 2: View Your Report

Open `.dep-report/reports/latest.html` in a browser.

### What You're Looking At

Here's an annotated example of what you'll see:

```markdown
┌────────────────────────────────────────────────────────────┐
│ Package  Current  Latest  Risk    Age    Stale?  Notes    │
│ ──────────────────────────────────────────────────────────│
│ ① lodash  4.0.0    4.17.21 ②Major  ③5yr  ④Yes    -        │
│ ⑤ react   17.0.2   18.2.0  Major   2yr    No     -        │
└────────────────────────────────────────────────────────────┘
```

**Column Guide:**

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

**Example:**
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
→ [Learn: Reading Reports](/guide/understanding-reports)  
Understand when to act on findings

### For Teams:
→ [Understanding Reports](/guide/understanding-reports)  
Learn to interpret findings and prioritize updates

## Common First Questions

**Q: Do I commit `.dep-report/` to git?**  
A: Yes, commit `reports/`, `notes.json`, `config.json`.  
   No, ignore `.cache.json` (already in `.gitignore`).

**Q: How often should I run this?**  
A: Weekly for awareness, before releases for rigor.

**Q: Does this update packages for me?**  
A: No. This is a **reporting tool**, not automation.
