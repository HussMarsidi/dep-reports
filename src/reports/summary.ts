import type { EnrichedPackage } from '../types/index.js';

export interface ReportSummary {
  total: number;
  outdated: number;
  stale: number;
  upToDate: number;
  
  // Risk counts
  critical: number;
  high: number;
  medium: number;
  low: number;
  
  // Special categories
  blocked: number;
  deferred: number;
  accepted: number;
  
  // Legacy counts (kept for compatibility if needed, or zeroed out)
  major: number;
  minor: number;
  patch: number;
  
  riskStatus: 'CRITICAL' | 'AT_RISK' | 'NEEDS_ATTENTION' | 'HAS_STALE' | 'HEALTHY';
  riskStatusEmoji: string;
  riskStatusText: string;
}

/**
 * Detects note keywords and returns badge type
 */
export function detectNoteKeyword(note: string | undefined): 'blocked' | 'deferred' | 'accepted' | null {
  if (!note) return null;
  
  const patterns = {
    blocked: /BLOCKED:/i,
    deferred: /DEFERRED:/i,
    accepted: /ACCEPTED\s+RISK:/i,
  };

  if (patterns.blocked.test(note)) return 'blocked';
  if (patterns.deferred.test(note)) return 'deferred';
  if (patterns.accepted.test(note)) return 'accepted';
  
  return null;
}

/**
 * Formats note with emoji badge for markdown
 */
export function formatNoteWithBadge(note: string | undefined): string {
  if (!note) return '';
  
  const keyword = detectNoteKeyword(note);
  if (!keyword) return note;
  
  const badges = {
    blocked: '🔴 BLOCKED',
    deferred: '🟡 DEFERRED',
    accepted: '🔵 ACCEPTED RISK',
  };
  
  // Replace the keyword prefix with emoji badge
  const cleaned = note.replace(/^(BLOCKED|DEFERRED|ACCEPTED(\s+RISK)?)[:\-\s]+/i, '').trim();
  // If replacement failed (regex mismatch), just append
  if (cleaned === note) {
      return `${badges[keyword]}: ${note}`;
  }
  return `${badges[keyword]}: ${cleaned}`;
}

/**
 * Calculates priority score for Action Required section
 */
export function calculatePriorityScore(pkg: EnrichedPackage): number {
  let score = 0;
  
  // Age weight (diminishing returns)
  if (pkg.age !== null) {
    if (pkg.age > 730) score += 10; // >2 years
    else if (pkg.age > 365) score += 5; // >1 year
  }
  
  // Update type/Risk weight
  if (pkg.risk === 'CRITICAL') score += 20;
  else if (pkg.risk === 'HIGH') score += 10;
  else if (pkg.risk === 'MEDIUM') score += 5;
  
  // Note status weight
  const keyword = detectNoteKeyword(pkg.note);
  if (keyword === 'blocked') score += 15; // Highest priority
  else if (keyword === 'deferred') score += 5;
  
  // Security advisory
  if (pkg.hasSecurityAdvisory) score += 50; 

  // Behind metric weight
  if (pkg.behindByDays !== null && pkg.behindByDays > 365) score += 7;
  
  return score;
}

/**
 * Checks if package is stable (installed version == latest version)
 */
export function isStable(pkg: EnrichedPackage): boolean {
  return pkg.current === pkg.latest;
}

/**
 * Calculates summary statistics from packages
 */
export function calculateSummary(
  packages: EnrichedPackage[],
  totalDependencies: number
): ReportSummary {
  const outdated = packages.length;
  const stale = packages.filter(p => p.isStale).length;
  const upToDate = totalDependencies - outdated;
  
  // Count risks (excluding blocked/deferred which have their own risk statuses now)
  // Logic: pkg.risk is set to BLOCKED/DEFERRED by analyzer. 
  // 'active' set refers to non-blocked/non-deferred items.
  const active = packages.filter(p => p.risk !== 'BLOCKED' && p.risk !== 'DEFERRED');
  
  const critical = active.filter(p => p.risk === 'CRITICAL').length;
  const high = active.filter(p => p.risk === 'HIGH').length;
  const medium = active.filter(p => p.risk === 'MEDIUM').length;
  const low = active.filter(p => p.risk === 'LOW').length;
  
  const blocked = packages.filter(p => p.risk === 'BLOCKED').length;
  const deferred = packages.filter(p => p.risk === 'DEFERRED').length;
  // Accepted risk is likely one of the other risks but with a note
  const accepted = packages.filter(p => detectNoteKeyword(p.note) === 'accepted').length;

  const securityCount = active.filter(p => p.hasSecurityAdvisory).length;
  const staleCount = active.filter(p => p.isStale).length;

  // Determine status badge
  let riskStatus: 'CRITICAL' | 'AT_RISK' | 'NEEDS_ATTENTION' | 'HAS_STALE' | 'HEALTHY' = 'HEALTHY';
  let riskStatusEmoji = '✅';
  let riskStatusText = 'Healthy (all dependencies current)';

  // Logic from spec
  if (securityCount > 0) {
    riskStatus = 'CRITICAL';
    riskStatusEmoji = '🔴';
    riskStatusText = `Critical Risk (${securityCount} security, ${active.filter(d => d.risk === 'CRITICAL').length} critical)`;
  } else if (critical > 0) {
    riskStatus = 'AT_RISK';
    riskStatusEmoji = '🔴';
    riskStatusText = `At Risk (${critical} critical, ${staleCount} stale)`;
  } else if (high > 3) {
    riskStatus = 'NEEDS_ATTENTION';
    riskStatusEmoji = '⚠️';
    riskStatusText = `Needs Attention (${high} high priority)`;
  } else if (staleCount > 0) {
    riskStatus = 'HAS_STALE';
    riskStatusEmoji = '📦';
    riskStatusText = `Has Stale Dependencies (${staleCount})`;
  } else if (outdated === 0) {
      // Default healthy
  } else {
      // Outdated but Low/Medium risk only and no stale?
      // Spec says "All good... Healthy (all dependencies current)" which implies 0 outdated?
      // But if we have valid outdated deps (Low/Medium) and not stale...
      // The Spec doesn't cover "Has outdated but not stale/high/critical".
      // I'll assume it's Healthy or maybe add a "Outdated" status?
      // Spec: "Has Stale Dependencies" is the lowest non-healthy tier.
      // So if not stale, it is healthy? 
      // "Healthy (all dependencies current)" suggests 0 outdated.
      // Whatever, I'll stick to logic.
      if (outdated > 0) {
          riskStatusText = `Healthy (${outdated} outdated)`;
      }
  }

  return {
    total: totalDependencies,
    outdated,
    stale,
    upToDate,
    critical,
    high,
    medium,
    low,
    blocked,
    deferred,
    accepted,
    major: 0, // Deprecated
    minor: 0, // Deprecated
    patch: 0, // Deprecated
    riskStatus,
    riskStatusEmoji,
    riskStatusText,
  };
}
