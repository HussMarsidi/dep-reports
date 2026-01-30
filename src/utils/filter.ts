import { minimatch } from 'minimatch';
import type { EnrichedPackage } from '../types/index.js';

/**
 * Filters packages based on ignore patterns
 */
export function filterPackages(
  packages: EnrichedPackage[],
  ignorePatterns: string[]
): EnrichedPackage[] {
  if (ignorePatterns.length === 0) {
    return packages;
  }

  return packages.filter(pkg => {
    // Test package name against each pattern
    for (const pattern of ignorePatterns) {
      if (minimatch(pkg.name, pattern)) {
        return false; // Exclude this package
      }
    }
    return true; // Include this package
  });
}
