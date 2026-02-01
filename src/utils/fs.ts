import { existsSync, access, constants, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const accessAsync = promisify(access);

/**
 * Checks if node_modules exists
 * @param cwd - Current working directory
 * @param hasLockfile - Whether a lockfile exists (makes check more lenient)
 * @param onWarning - Optional callback for warnings (when lockfile exists but node_modules missing)
 * @throws Error if node_modules is missing and no lockfile exists
 */
export async function ensureNodeModules(
  cwd: string = process.cwd(), 
  hasLockfile: boolean = false,
  onWarning?: (message: string) => void
): Promise<void> {
  const nodeModulesPath = join(cwd, 'node_modules');
  const nodeModulesExists = existsSync(nodeModulesPath);
  
  if (!nodeModulesExists) {
    if (hasLockfile) {
      // If lockfile exists but node_modules is missing, warn but don't fail
      // The outdated command will handle this (may fail or return empty results)
      const warningMsg = 'node_modules directory not found, but lockfile exists. The outdated command may not work correctly. Consider running "npm install", "pnpm install", or "bun install" first.';
      if (onWarning) {
        onWarning(warningMsg);
      }
      return;
    }
    
    // No lockfile and no node_modules - this is an error
    throw new Error(
      'node_modules directory not found. Please run "npm install", "pnpm install", or "bun install" first.'
    );
  }
}

/**
 * Checks write permissions for a directory
 * Creates the directory if it doesn't exist
 */
export async function ensureWriteAccess(directory: string): Promise<void> {
  // Create directory if it doesn't exist
  if (!existsSync(directory)) {
    try {
      mkdirSync(directory, { recursive: true });
    } catch (error) {
      throw new Error(`Cannot create directory ${directory}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  // Check write permissions
  try {
    await accessAsync(directory, constants.W_OK);
  } catch {
    throw new Error(`No write permission for directory: ${directory}`);
  }

  // Test actual write access
  const testFilePath = join(directory, `.write-test-${Date.now()}.tmp`);
  try {
    writeFileSync(testFilePath, 'ok');
    unlinkSync(testFilePath);
  } catch (error) {
    throw new Error(`Cannot write to directory ${directory}: ${error instanceof Error ? error.message : String(error)}`);
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
