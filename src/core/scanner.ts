import { exec } from 'child_process';
import { promisify } from 'util';
import type { PackageManager, RawOutdatedOutput } from '../types/index.js';
import { getOutdatedCommand } from './detector.js';

const execAsync = promisify(exec);

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
      // If JSON parsing fails, it might be because the output is empty or malformed
      // Return empty object to indicate no outdated packages
      if (output.includes('All packages are up to date') || output === '{}') {
        return {};
      }
      throw new Error(`Failed to parse outdated output: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  } catch (error: any) {
    // npm/pnpm return non-zero exit code when packages are outdated
    // This is expected behavior, so we try to parse the output anyway
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout) as RawOutdatedOutput;
      } catch {
        // If parsing fails, check if it's actually an error
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
