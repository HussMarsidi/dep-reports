import { existsSync } from 'fs';
import { join } from 'path';
import type { PackageManager } from '../types/index.js';

interface DetectionResult {
  manager: PackageManager;
  lockfile: string;
}

/**
 * Detects which package manager is being used based on lockfile presence.
 * Priority: pnpm > bun > npm (to catch newer tools first)
 */
export function detectPackageManager(cwd: string = process.cwd()): DetectionResult | null {
  const lockfiles: Array<{ file: string; manager: PackageManager }> = [
    { file: 'pnpm-lock.yaml', manager: 'pnpm' },
    { file: 'bun.lockb', manager: 'bun' },
    { file: 'package-lock.json', manager: 'npm' },
  ];

  for (const { file, manager } of lockfiles) {
    const lockfilePath = join(cwd, file);
    if (existsSync(lockfilePath)) {
      return { manager, lockfile: file };
    }
  }

  return null;
}

/**
 * Gets the command to run for outdated check
 */
export function getOutdatedCommand(manager: PackageManager): string {
  const commands: Record<PackageManager, string> = {
    npm: 'npm outdated --json',
    pnpm: 'pnpm outdated --json',
    bun: 'bun outdated --json',
  };
  return commands[manager];
}
