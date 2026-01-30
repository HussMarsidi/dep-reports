import { existsSync, access, constants } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const accessAsync = promisify(access);

/**
 * Checks if node_modules exists
 */
export async function ensureNodeModules(cwd: string = process.cwd()): Promise<void> {
  const nodeModulesPath = join(cwd, 'node_modules');
  if (!existsSync(nodeModulesPath)) {
    throw new Error(
      'node_modules directory not found. Please run "npm install", "pnpm install", or "bun install" first.'
    );
  }
}

/**
 * Checks write permissions for a directory
 */
export async function ensureWriteAccess(directory: string): Promise<void> {
  try {
    await accessAsync(directory, constants.W_OK);
  } catch {
    throw new Error(`No write permission for directory: ${directory}`);
  }
}

/**
 * Safely parses JSON with helpful error messages
 */
export function parseJSON<T>(content: string, filePath: string): T {
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
    }
    throw error;
  }
}
