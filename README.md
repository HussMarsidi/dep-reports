# dep-report

Zero-config CLI tool that generates version-controlled snapshots of dependency risk.

## Installation

```bash
npm install -g dep-report
# or
pnpm add -g dep-report
# or
bun add -g dep-report
```

Or use with npx (no installation needed):

```bash
npx dep-report
```

## Quick Start

Run in your project directory:

```bash
dep-report
```

This will:
1. Detect your package manager (npm, pnpm, or bun)
2. Scan for outdated packages
3. Enrich with registry metadata (publish dates, age)
4. Generate reports in `.dep-report/reports/`

## Usage

### Initialize Configuration

To customize behavior, initialize the configuration:

```bash
dep-report init
```

This creates `.dep-report/config.json` and `.dep-report/notes.json` in your project.

### Basic Audit

```bash
dep-report
```

Scans for outdated packages and generates reports based on your configuration.

### Reports

Reports are generated in `.dep-report/reports/`:
- `YYYY-MM-DD_outdated.md` - Daily snapshot (markdown)
- `YYYY-MM-DD_outdated.html` - Daily snapshot (HTML)
- `latest.md` - Always points to the most recent markdown report
- `latest.html` - Always points to the most recent HTML report

## Configuration

Configuration is stored in `.dep-report/config.json`. Run `dep-report init` to create it.

### Configuration Options

```json
{
  "staleThreshold": "18 months",
  "ignorePatterns": ["@types/*", "eslint-*"],
  "formats": {
    "markdown": true,
    "html": true
  },
  "concurrency": 5,
  "failConditions": {
    "stale": false,
    "major": false
  },
  "reportEmptyState": true
}
```

#### `staleThreshold` (string)

Duration string indicating when a package is considered "stale". Format: `"N days"`, `"N weeks"`, `"N months"`, or `"N years"`.

Example: `"18 months"`, `"90 days"`, `"2 years"`

#### `ignorePatterns` (string[])

Array of glob patterns to exclude from reports. Uses [minimatch](https://github.com/isaacs/minimatch) for pattern matching.

Examples:
- `["@types/*"]` - Ignore all @types packages
- `["eslint-*", "@eslint/*"]` - Ignore eslint-related packages
- `["package-name"]` - Ignore specific package

#### `formats` (object)

Controls which report formats are generated:
- `markdown`: Generate markdown reports (`.md`)
- `html`: Generate HTML reports (`.html`)

#### `concurrency` (number)

Number of concurrent registry API requests. Default: `5`. Increase for faster processing (but be respectful of rate limits).

#### `failConditions` (object)

Exit code conditions for CI/CD integration:
- `stale`: Exit with code 1 if any packages exceed `staleThreshold`
- `major`: Exit with code 1 if any packages have major version updates available

#### `reportEmptyState` (boolean)

Whether to generate reports when no outdated packages are found. Default: `true`.

### Notes

Add custom notes to packages in `.dep-report/notes.json`:

```json
{
  "package-name": "Known issue: waiting for v2.0.0 release",
  "another-package": "Upgrade blocked by breaking changes"
}
```

Notes appear in reports next to the package entry.

## Usage Examples

### CI/CD Integration

Fail the build if major updates are available:

```json
{
  "failConditions": {
    "major": true
  }
}
```

```bash
dep-report || exit 1
```

### Ignore Dev Dependencies

```json
{
  "ignorePatterns": ["@types/*", "eslint-*", "@eslint/*", "typescript", "prettier"]
}
```

### Only Markdown Reports

```json
{
  "formats": {
    "markdown": true,
    "html": false
  }
}
```

### Custom Stale Threshold

```json
{
  "staleThreshold": "6 months"
}
```

## Edge Cases & Limitations

### Exotic Versions

Packages with non-semver versions (e.g., `file:`, `git+`, `workspace:`) are marked as `Exotic` risk level. Age calculation may not be available for these packages.

### Missing Packages

If a package is listed in `package.json` but not installed, it's marked as `NotInstalled`.

### Registry Connectivity

The tool requires internet connectivity to fetch package metadata from the npm registry. If the registry is unreachable, the tool will exit with an error.

### Package Manager Detection

The tool detects package managers by looking for lockfiles in this priority order:
1. `pnpm-lock.yaml` → pnpm
2. `bun.lock` or `bun.lockb` → bun
3. `package-lock.json` → npm

If no lockfile is found, the tool will exit with an error.

### Rate Limiting

The tool respects npm registry rate limits by:
- Processing packages in batches (default: 5 concurrent requests)
- Adding a 500ms delay between batches
- You can adjust `concurrency` in config, but be mindful of rate limits

### Age Calculation

Age is calculated based on when the **currently installed version** was published, not when the latest version was published. This answers: "How old is the dependency we're actively using?"

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# Run tests
bun test

# Type check
bun run typecheck
```

## Testing

```bash
# Run all tests
bun test

# Run specific test file
bun test src/core/detector.test.ts
```

## Project Status

✅ **Production Ready**
- ✅ Package manager detection (npm, pnpm, bun)
- ✅ Outdated package scanning
- ✅ Registry enrichment with age calculation
- ✅ Risk & age calculation
- ✅ Markdown & HTML report generation
- ✅ Configuration system
- ✅ Notes system
- ✅ Comprehensive test suite
