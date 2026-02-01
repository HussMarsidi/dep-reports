import type { EnrichedPackage } from '../types/index.js';

export interface ReportSummary {
  total: number;
  outdated: number;
  stale: number;
  upToDate: number;
  blocked: number;
  deferred: number;
  accepted: number;
  major: number;
  minor: number;
  patch: number;
  riskStatus: 'healthy' | 'degrading' | 'atRisk';
  riskStatusEmoji: '🟢' | '🟡' | '🔴';
  riskStatusText: string;
}

/**
 * Detects note keywords and returns badge type
 */
export function detectNoteKeyword(note: string | undefined): 'blocked' | 'deferred' | 'accepted' | null {
  if (!note) return null;
  
  const patterns = {
    blocked: /^BLOCKED[:\-\s]/i,
    deferred: /^DEFERRED[:\-\s]/i,
    accepted: /^ACCEPTED(\s+RISK)?[:\-\s]/i,
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
  
  // Update type weight
  if (pkg.risk === 'Major') score += 8;
  else if (pkg.risk === 'Minor') score += 3;
  
  // Note status weight
  const keyword = detectNoteKeyword(pkg.note);
  if (keyword === 'blocked') score += 15; // Highest priority
  else if (keyword === 'deferred') score += 5;
  
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
  totalDependencies: number,
  riskThresholds?: {
    method: 'percentage' | 'absolute';
    degrading: {
      stalePercent: number;
      majorPercent: number;
    };
    atRisk: {
      stalePercent: number;
      majorPercent: number;
    };
  }
): ReportSummary {
  const outdated = packages.length;
  const stale = packages.filter(p => p.isStale).length;
  const upToDate = totalDependencies - outdated;
  
  const major = packages.filter(p => p.risk === 'Major').length;
  const minor = packages.filter(p => p.risk === 'Minor').length;
  const patch = packages.filter(p => p.risk === 'Patch').length;
  
  const blocked = packages.filter(p => detectNoteKeyword(p.note) === 'blocked').length;
  const deferred = packages.filter(p => detectNoteKeyword(p.note) === 'deferred').length;
  const accepted = packages.filter(p => detectNoteKeyword(p.note) === 'accepted').length;
  
  // Calculate risk status
  let riskStatus: 'healthy' | 'degrading' | 'atRisk' = 'healthy';
  let riskStatusEmoji: '🟢' | '🟡' | '🔴' = '🟢';
  let riskStatusText = 'Healthy';
  
  if (riskThresholds) {
    const method = riskThresholds.method;
    const stalePercent = totalDependencies > 0 ? (stale / totalDependencies) * 100 : 0;
    const outdatedWithMajor = packages.filter(p => p.risk === 'Major').length;
    const majorPercent = totalDependencies > 0 ? (outdatedWithMajor / totalDependencies) * 100 : 0;
    
    if (method === 'percentage') {
      if (stalePercent >= riskThresholds.atRisk.stalePercent || majorPercent >= riskThresholds.atRisk.majorPercent) {
        riskStatus = 'atRisk';
        riskStatusEmoji = '🔴';
        riskStatusText = `At Risk (${Math.round(stalePercent)}% stale)`;
      } else if (stalePercent >= riskThresholds.degrading.stalePercent || majorPercent >= riskThresholds.degrading.majorPercent) {
        riskStatus = 'degrading';
        riskStatusEmoji = '🟡';
        riskStatusText = `Degrading (${Math.round(stalePercent)}% stale)`;
      } else {
        riskStatus = 'healthy';
        riskStatusEmoji = '🟢';
        riskStatusText = 'Healthy';
      }
    } else {
      // Absolute method
      if (stale >= riskThresholds.atRisk.stalePercent || outdatedWithMajor >= riskThresholds.atRisk.majorPercent) {
        riskStatus = 'atRisk';
        riskStatusEmoji = '🔴';
        riskStatusText = `At Risk (${stale} stale)`;
      } else if (stale >= riskThresholds.degrading.stalePercent || outdatedWithMajor >= riskThresholds.degrading.majorPercent) {
        riskStatus = 'degrading';
        riskStatusEmoji = '🟡';
        riskStatusText = `Degrading (${stale} stale)`;
      } else {
        riskStatus = 'healthy';
        riskStatusEmoji = '🟢';
        riskStatusText = 'Healthy';
      }
    }
  } else {
    // Default thresholds (percentage-based)
    const stalePercent = totalDependencies > 0 ? (stale / totalDependencies) * 100 : 0;
    const outdatedWithMajor = packages.filter(p => p.risk === 'Major').length;
    const majorPercent = totalDependencies > 0 ? (outdatedWithMajor / totalDependencies) * 100 : 0;
    
    if (stalePercent >= 15 || majorPercent >= 20) {
      riskStatus = 'atRisk';
      riskStatusEmoji = '🔴';
      riskStatusText = `At Risk (${Math.round(stalePercent)}% stale)`;
    } else if (stalePercent >= 5 || majorPercent >= 10) {
      riskStatus = 'degrading';
      riskStatusEmoji = '🟡';
      riskStatusText = `Degrading (${Math.round(stalePercent)}% stale)`;
    } else {
      riskStatus = 'healthy';
      riskStatusEmoji = '🟢';
      riskStatusText = 'Healthy';
    }
  }
  
  return {
    total: totalDependencies,
    outdated,
    stale,
    upToDate,
    blocked,
    deferred,
    accepted,
    major,
    minor,
    patch,
    riskStatus,
    riskStatusEmoji,
    riskStatusText,
  };
}
