import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Counts total dependencies from package.json
 */
export function countTotalDependencies(cwd: string = process.cwd()): number {
  const packageJsonPath = join(cwd, 'package.json');
  
  if (!existsSync(packageJsonPath)) {
    return 0;
  }
  
  try {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    };
    
    const deps = Object.keys(pkg.dependencies || {}).length;
    const devDeps = Object.keys(pkg.devDependencies || {}).length;
    const peerDeps = Object.keys(pkg.peerDependencies || {}).length;
    const optionalDeps = Object.keys(pkg.optionalDependencies || {}).length;
    
    return deps + devDeps + peerDeps + optionalDeps;
  } catch {
    return 0;
  }
}
