# Smoke Test Checklist

Minimal checklist for testers to validate basic CLI behavior.

## Preconditions
- Run from repo root: `/Users/hussmarsidi/Desktop/Dev/dep-reports`
- Ensure a lockfile exists (`bun.lock`, `bun.lockb`, `pnpm-lock.yaml`, or `package-lock.json`)
- Ensure `node_modules/` exists
- All test to be done in example/ folder

## Smoke Test Steps (Minimal)
1. Init scaffold
   - Command: `bun run src/cli.ts init`
   - Expect: `.dep-report/` created with `config.json`, `notes.json`, `.gitignore`, `reports/`

2. Basic audit run
   - Command: `bun run src/cli.ts`
   - Expect: detects package manager, runs scan, writes report to `.dep-report/reports/`

3. Config + notes (quick sanity)
   - Edit `.dep-report/config.json`:
     - Set `staleThreshold` to `"90 days"`
     - Add `ignorePatterns: ["@types/*"]`
   - Edit `.dep-report/notes.json`:
     - Add a note for any package in the report
   - Command: `bun run src/cli.ts`
   - Expect: notes appear in report; ignored packages are removed

## Smoke Tests Run (Completed)
- `bun run src/cli.ts init` (scaffold created)
- `bun run typecheck` (passed)
- `bun run src/cli.ts` (report generated, no outdated deps)