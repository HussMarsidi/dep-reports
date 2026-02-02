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

function parseNoteStatus(note: string | undefined): 'BLOCKED' | 'DEFERRED' | 'ACCEPTED_RISK' | 'NONE' {
  if (!note) return 'NONE';
  if (/BLOCKED:/i.test(note)) return 'BLOCKED';
  if (/DEFERRED:/i.test(note)) return 'DEFERRED';
  if (/ACCEPTED\s+RISK:/i.test(note)) return 'ACCEPTED_RISK';
  return 'NONE';
}

/**
 * Calculates the risk level based on semver difference and age
 */
export function calculateRisk(pkg: EnrichedPackage): Risk {
  const { current, latest, age, note, hasSecurityAdvisory } = pkg;

  // Handle exotic/missing first
  if (isExoticVersion(current)) return 'Exotic';
  if (!current || current === '-' || current === 'missing') return 'NotInstalled';
  if (!valid(current) || !valid(latest)) return 'Exotic';

  // Check notes for Blocked/Deferred
  const status = parseNoteStatus(note);
  if (status === 'BLOCKED') return 'BLOCKED';
  if (status === 'DEFERRED') return 'DEFERRED';
  // ACCEPTED_RISK falls through to normal risk calculation

  const ageInMonths = age !== null ? age / 30 : null;
  const versionDiff = diff(current, latest);

  // Security always critical
  if (hasSecurityAdvisory) return 'CRITICAL';

  // Very old (possibly abandoned) - > 24 months
  if (ageInMonths !== null && ageInMonths > 24) return 'CRITICAL';

  // Major update
  if (versionDiff === 'major') {
    if (ageInMonths !== null && ageInMonths > 18) return 'CRITICAL';
    if (ageInMonths !== null && ageInMonths >= 6) return 'HIGH';
    if (ageInMonths !== null) return 'MEDIUM'; // Recent major
    return 'HIGH'; // Unknown age fallback for major
  }

  // Minor update
  if (versionDiff === 'minor') {
    if (ageInMonths !== null && ageInMonths > 18) return 'HIGH';
    if (ageInMonths !== null && ageInMonths >= 6) return 'MEDIUM';
    if (ageInMonths !== null) return 'LOW'; // Recent minor
    return 'MEDIUM'; // Unknown age fallback for minor
  }

  // Patch update
  if (versionDiff === 'patch') {
    if (ageInMonths !== null && ageInMonths > 12) return 'MEDIUM';
    return 'LOW'; // Recent patch or unknown age
  }

  // Pre-release or other updates
  if (versionDiff && ['premajor', 'preminor', 'prepatch', 'prerelease'].includes(versionDiff)) {
    return 'LOW'; // Treat prereleases as low risk for now
  }

  return 'LOW';
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
    const risk = calculateRisk(pkg);

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
