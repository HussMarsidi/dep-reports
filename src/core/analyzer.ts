import { diff, valid } from 'semver';
import type { EnrichedPackage, Risk } from '../types/index.js';

/**
 * Checks if a version string is exotic (non-semver)
 */
export function isExoticVersion(version: string): boolean {
  if (!version || version === '-' || version === 'missing') {
    return false; // These are handled separately
  }
  return /^(file:|git\+|https?:|link:|workspace:)/.test(version);
}

/**
 * Calculates the risk level based on semver difference
 */
export function calculateRisk(current: string, latest: string): Risk {
  // Handle exotic versions first
  if (isExoticVersion(current)) {
    return 'Exotic';
  }

  // Handle missing/not installed
  if (!current || current === '-' || current === 'missing') {
    return 'NotInstalled';
  }

  // Validate semver
  if (!valid(current) || !valid(latest)) {
    return 'Exotic';
  }

  try {
    const versionDiff = diff(current, latest);
    switch (versionDiff) {
      case 'major':
        return 'Major';
      case 'minor':
        return 'Minor';
      case 'patch':
        return 'Patch';
      default:
        // Prerelease, build metadata, etc.
        return 'Patch';
    }
  } catch {
    return 'Exotic';
  }
}

/**
 * Analyzes packages to calculate risk and stale status
 */
export function analyzePackages(
  packages: EnrichedPackage[],
  staleThresholdDays: number | null = null
): EnrichedPackage[] {
  return packages.map(pkg => {
    // Calculate risk
    const risk = calculateRisk(pkg.current, pkg.latest);

    // Calculate stale status if threshold is provided
    const isStale = staleThresholdDays !== null && 
                    pkg.age !== null && 
                    pkg.age > staleThresholdDays;

    return {
      ...pkg,
      risk,
      isStale,
    };
  });
}
