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

/**
 * Calculates a health score (0-100) for the project based on dependencies
 */
export function calculateHealthScore(deps: EnrichedPackage[]): number {
  const base = 100;
  
  // Count active items (exclude blocked/deferred/not installed)
  const active = deps.filter(d => 
    d.risk !== 'BLOCKED' && 
    d.risk !== 'DEFERRED' && 
    d.risk !== 'NotInstalled' &&
    d.risk !== 'Exotic'
  );
  
  // Spec says: "Count active items (exclude blocked/deferred)" 
  // But usage of `total` in outdatedPercent uses active list in logic below.
  
  const criticalCount = active.filter(d => d.risk === 'CRITICAL').length;
  const highCount = active.filter(d => d.risk === 'HIGH').length;
  const mediumCount = active.filter(d => d.risk === 'MEDIUM').length;
  const staleCount = active.filter(d => d.isStale).length;
  
  // Need age in months. active[i].age is in days
  const veryOldCount = active.filter(d => (d.age || 0) > 365 * 2).length; // > 24 months
  const securityCount = active.filter(d => d.hasSecurityAdvisory).length;
  
  // Penalty weights
  const penalties = {
    security: 15,
    critical: 10,
    high: 5,
    medium: 2,
    stale: 3,
    veryOld: 5,
  };
  
  let score = base;
  score -= securityCount * penalties.security;
  score -= criticalCount * penalties.critical;
  score -= highCount * penalties.high;
  score -= mediumCount * penalties.medium;
  score -= staleCount * penalties.stale;
  score -= veryOldCount * penalties.veryOld;
  
  // Additional penalty for high percentage of outdated
  // outdated is anything not LOW? Or anything where current != latest?
  // Spec: outdatedPercent = (active.filter(d => d.risk !== 'LOW').length / total) * 100;
  // Note: 'total' in spec likely refers to 'active.length' to get percentage of tracked packages.
  const activeTotal = active.length;
  if (activeTotal > 0) {
      const outdatedCount = active.filter(d => d.risk !== 'LOW').length;
      const outdatedPercent = (outdatedCount / activeTotal) * 100;
      
      if (outdatedPercent > 50) {
        score -= 10;
      }
  }
  
  return Math.max(0, Math.round(score));
}

