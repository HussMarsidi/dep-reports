---
description: Installation options for dep-report
---

# Installation

## Recommended: npx

No installation needed:

```bash
npx dep-report
```

**Why use npx:**
- Always uses the latest version
- No global package management
- Works in CI/CD without setup

## Global Installation

If you prefer a global install:

::: code-group

```bash [npm]
npm install -g dep-report
```

```bash [pnpm]
pnpm add -g dep-report
```

```bash [bun]
bun add -g dep-report
```

:::

## Requirements

- **Node.js**: 18.0.0 or higher
- **Package Manager**: npm, pnpm, or bun
- **Internet**: Required for registry metadata (first run)

## Next Steps

[Quick Start →](/guide/getting-started) - Generate your first report
