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

## Usage

### Basic Audit

Run in your project directory:

```bash
dep-report
```

This will:
1. Detect your package manager (npm, pnpm, or bun)
2. Scan for outdated packages
3. Enrich with registry metadata (publish dates, age)
4. Generate markdown reports in `.dep-report/reports/`

### Reports

Reports are generated in `.dep-report/reports/`:
- `YYYY-MM-DD_outdated.md` - Daily snapshot
- `latest.md` - Always points to the most recent report

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# Type check
bun run typecheck
```

## Project Status

🚧 **Phase 1 Complete** - Core engine working
- ✅ Package manager detection
- ✅ Outdated package scanning
- ✅ Registry enrichment
- ✅ Risk & age calculation
- ✅ Markdown report generation

**Coming Soon:**
- Phase 2: Configuration system (config.json, notes.json)
- Phase 3: Caching & refresh mode
- Phase 4: HTML output & polish
- Phase 5: Testing & npm publishing
