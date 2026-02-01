import { exec } from 'child_process';
import { promisify } from 'util';
import type { PackageManager, RawOutdatedOutput } from '../types/index.js';
import { getOutdatedCommand } from './detector.js';

const execAsync = promisify(exec);

function parseBunOutdatedTable(output: string): RawOutdatedOutput | null {
  if (!/\|\s*Package\s*\|/i.test(output)) {
    return null;
  }

  const rows: Array<Record<string, string>> = [];
  const lines = output.split('\n').map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    if (!line.startsWith('|')) {
      continue;
    }

    const parts = line
      .split('|')
      .map(part => part.trim())
      .filter(Boolean);

    if (parts.length < 4) {
      continue;
    }

    const [name, current, update, latest] = parts;

    if (
      !name ||
      /^-+$/.test(name) ||
      name.toLowerCase() === 'package'
    ) {
      continue;
    }

    rows.push({ name, current, update, latest });
  }

  return rows.length > 0 ? rows : null;
}

/**
 * Executes the outdated command for the detected package manager
 */
export async function scanOutdated(
  manager: PackageManager,
  cwd: string = process.cwd()
): Promise<RawOutdatedOutput> {
  const command = getOutdatedCommand(manager);

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Some package managers write to stderr even on success
    // Try to parse stdout first, fallback to stderr if stdout is empty
    const output = stdout.trim() || stderr.trim();

    if (!output) {
      return {}; // No outdated packages
    }

    // Parse JSON output
    try {
      return JSON.parse(output) as RawOutdatedOutput;
    } catch (parseError) {
      if (manager === 'bun') {
        const parsed = parseBunOutdatedTable(output);
        if (parsed) {
          return parsed;
        }
      }
      // If JSON parsing fails, it might be because the output is empty or malformed
      // Return empty object to indicate no outdated packages
      if (output.includes('All packages are up to date') || output === '{}') {
        return {};
      }
      throw new Error(`Failed to parse outdated output: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error: any) {
    // npm/pnpm/bun can return non-zero exit codes when packages are outdated
    // This is expected behavior, so we try to parse the output anyway.
    const output = String(error.stdout || error.stderr || '').trim();
    if (output) {
      try {
        return JSON.parse(output) as RawOutdatedOutput;
      } catch {
        if (manager === 'bun') {
          const parsed = parseBunOutdatedTable(output);
          if (parsed) {
            return parsed;
          }
        }
        // If parsing fails, check if it's actually "no outdated" message
        if (/no outdated|up to date/i.test(output) || output === '{}') {
          return {};
        }
        if (error.code === 'ENOENT') {
          throw new Error(`Package manager "${manager}" not found. Please install it first.`);
        }
        throw new Error(`Failed to execute outdated command: ${error.message}`);
      }
    }

    // If no stdout, it's a real error
    if (error.code === 'ENOENT') {
      throw new Error(`Package manager "${manager}" not found. Please install it first.`);
    }

    // Return empty object if command failed but no output
    return {};
  }
}
