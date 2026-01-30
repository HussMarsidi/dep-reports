---
description: Installation guide for dep-report - npm, pnpm, bun, and npx options
---

# Installation

**dep-report** can be installed globally or used directly with npx.

## Global Installation

Install using your preferred package manager:

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

## Using npx (Recommended)

No installation needed! Just run:

```bash
npx dep-report
```

This is the recommended approach because:
- No global package pollution
- Always uses the latest version
- Works in CI/CD without setup

## System Requirements

- **Node.js**: 18.0.0 or higher
- **Package Manager**: npm, pnpm, or bun
- **Internet Connection**: Required for registry metadata (unless using `--refresh`)

## Verify Installation

After installation, verify it works:

```bash
dep-report --version
```

You should see the version number printed.

## Troubleshooting

### Command Not Found

If you get `command not found` after global installation:

1. **Check npm global bin path**:
   ```bash
   npm config get prefix
   ```

2. **Add to PATH**: Ensure the npm global bin directory is in your PATH:
   ```bash
   export PATH="$(npm config get prefix)/bin:$PATH"
   ```

3. **Restart terminal**: Close and reopen your terminal

### Permission Errors

If you get permission errors on macOS/Linux:

```bash
sudo npm install -g dep-report
```

Or better yet, use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage Node.js versions without sudo.

### Node Version Too Old

If you see an error about Node.js version:

1. **Check your version**:
   ```bash
   node --version
   ```

2. **Upgrade Node.js**: Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to install Node.js 18+:
   ```bash
   nvm install 18
   nvm use 18
   ```

## Next Steps

Once installed, check out the [Usage](/guide/usage) guide to learn how to use the tool.
