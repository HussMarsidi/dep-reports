# Edge Cases & Limitations

Known limitations and how the tool handles edge cases.

## Exotic Versions

Packages with non-semver versions (e.g., `file:`, `git+`, `workspace:`) are marked as `Exotic` risk level. Age calculation may not be available for these packages.

**Example**:
```json
{
  "dependencies": {
    "local-package": "file:../local-package",
    "git-package": "git+https://github.com/user/repo.git"
  }
}
```

These will appear in reports with `Risk: Exotic` and `Age: Unknown`.

## Missing Packages

If a package is listed in `package.json` but not installed, it's marked as `NotInstalled`.

**Common causes**:
- `npm install` was never run
- Package was removed from `node_modules` but not from `package.json`
- Installation failed silently

**Solution**: Run `npm install` (or equivalent) before running `dep-report`.

## Registry Connectivity

The tool requires internet connectivity to fetch package metadata from the npm registry. If the registry is unreachable, the tool will exit with an error.

**Error message**:
```
Unable to reach the npm registry.
If you have a cache, try running with --refresh.
```

**Solutions**:
1. Check your internet connection
2. Verify registry is accessible: `npm ping`
3. Use `--refresh` if you have cached data
4. Check firewall/proxy settings

## Package Manager Detection

The tool detects package managers by looking for lockfiles in this priority order:
1. `pnpm-lock.yaml` → pnpm
2. `bun.lock` or `bun.lockb` → bun
3. `package-lock.json` → npm

**If no lockfile is found**, the tool will exit with an error:

```
No package manager detected. Please ensure you have package-lock.json, pnpm-lock.yaml, bun.lock, or bun.lockb in your project.
```

**Solution**: Run `npm install`, `pnpm install`, or `bun install` to generate a lockfile.

## Rate Limiting

The tool respects npm registry rate limits by:
- Processing packages in batches (default: 5 concurrent requests)
- Adding a 500ms delay between batches
- You can adjust `concurrency` in config, but be mindful of rate limits

**If you hit rate limits**:
- Reduce `concurrency` in config
- Wait a few minutes and retry
- Use `--refresh` to skip network calls

## Age Calculation

Age is calculated based on when the **currently installed version** was published, not when the latest version was published. This answers: "How old is the dependency we're actively using?"

**Example**:
- Installed: `lodash@4.0.0` (published 5 years ago)
- Latest: `lodash@4.17.21` (published yesterday)
- **Age**: 5 years (not 1 day)

This gives you a more accurate measure of actual risk in production.

## Missing node_modules

The tool requires `node_modules` to exist. If it's missing, the tool will exit with an error.

**Error message**:
```
node_modules directory not found. Please run 'npm install' (or equivalent) first.
```

**Solution**: Run `npm install`, `pnpm install`, or `bun install` before running `dep-report`.

## Corrupt Configuration

If `config.json` or `notes.json` has invalid JSON, the tool will show a syntax error and fall back to defaults.

**Example error**:
```
Invalid config: staleThreshold: Expected string, received number
```

**Solution**: Fix the JSON syntax error in your config file.

## Empty State

If `npm outdated` returns no outdated packages, the tool generates a success report (if `reportEmptyState: true`):

```markdown
# Dependency Report (2026-01-30)
✅ All dependencies are up to date
```

This creates an audit trail even when everything is clean.

## Monorepo Scope (V1)

V1 strictly scans only the `package.json` in the Current Working Directory. No workspace traversal.

**Workaround**: Run `dep-report` in each workspace directory:

```bash
for dir in packages/*/; do
  (cd "$dir" && npx dep-report)
done
```

**Future**: Workspace support may be added in V2 with `--workspace` flag.

## Yarn Support

Yarn Classic and Yarn Berry are not yet supported. The tool only supports npm, pnpm, and bun.

**Future**: Yarn support may be added in a future version.

## Private Registry Authentication

The tool inherits authentication from your package manager's configuration. If your package manager can access the registry, `dep-report` can too.

**Setup**:
```bash
# npm
npm login --registry=https://registry.company.com

# pnpm
pnpm login --registry=https://registry.company.com

# bun
bun login --registry=https://registry.company.com
```

Then run `dep-report` as normal.

## Next Steps

- See [Configuration](/guide/configuration) for customization options
- Check the [API Reference](/api/cli) for all commands
