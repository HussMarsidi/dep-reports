import { format } from 'date-fns';
import type { EnrichedPackage } from '../types/index.js';
import { calculateSummary, calculatePriorityScore, formatNoteWithBadge } from './summary.js';

/**
 * Formats age for display
 */
function formatAge(age: number | null): string {
  if (age === null) {
    return 'Unknown';
  }
  if (age < 30) {
    return `${age}d`;
  }
  if (age < 365) {
    const months = Math.floor(age / 30);
    return `${months}m`;
  }
  const years = Math.floor(age / 365);
  const remainingMonths = Math.floor((age % 365) / 30);
  return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
}

/**
 * Generates markdown report from enriched packages
 */
export function generateMarkdownReport(
  packages: EnrichedPackage[],
  date: Date = new Date(),
  totalDependencies?: number
): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const timestamp = format(date, 'yyyy-MM-dd HH:mm:ss');
  const summary = calculateSummary(packages, totalDependencies ?? packages.length);

  // Split into Runtime and Dev
  const devDeps = packages.filter(p => p.type === 'devDependencies');
  const runtimeDeps = packages.filter(p => p.type !== 'devDependencies');

  // Stats for each group
  const getStats = (deps: EnrichedPackage[]) => {
    const total = deps.length; // Approximate total if we don't have totals per type passed in
    const outdated = deps.length;
    const stale = deps.filter(p => p.isStale).length;
    return { total, outdated, stale };
  };
  
  const runtimeStats = getStats(runtimeDeps);
  const devStats = getStats(devDeps);
  
  // Note: Total dependencies per type is not fully available in current architecture 
  // (we only passed totalDependencies count). 
  // For now we'll calculate percentages based on outdated count relative to total outdated? 
  // Or just display counts. Spec shows "Total: 9 | Outdated: 2 (22%)". 
  // We can't do the % accurately without total deps per type. 
  // I will omit % for now or just show outdated/stale counts.

  let markdown = `# Dependency Report (${dateStr})

Generated at: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ${summary.riskStatusEmoji} ${summary.riskStatusText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Dependency Health Summary

Runtime Dependencies
  Outdated: ${runtimeStats.outdated} | Stale: ${runtimeStats.stale}

Dev Dependencies
  Outdated: ${devStats.outdated} | Stale: ${devStats.stale}

Risk Breakdown
  🔴 Critical: ${summary.critical}
  ⚠️ High: ${summary.high}
  📦 Medium: ${summary.medium}
  
Acknowledged Issues
  🚫 Blocked: ${summary.blocked}
  📅 Deferred: ${summary.deferred}
  🔵 Accepted Risk: ${summary.accepted}

`;

  // Action Required Section
  markdown += `━━━ ACTION REQUIRED ━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const sorted = [...packages].sort((a, b) => {
    const riskOrder: Record<string, number> = {
      'CRITICAL': 0,
      'HIGH': 1,
      'MEDIUM': 2,
      'LOW': 3,
      'BLOCKED': 4,
      'DEFERRED': 5,
      'ACCEPTED_RISK': 2, // Treated as medium/high locally but usually handled in display
      'Exotic': 6,
      'NotInstalled': 7
    };
    const riskDiff = (riskOrder[a.risk] || 99) - (riskOrder[b.risk] || 99);
    if (riskDiff !== 0) return riskDiff;
    if ((b.age || 0) !== (a.age || 0)) return (b.age || 0) - (a.age || 0);
    return 0;
  });

  const actionRequired = sorted
    .filter(pkg => {
        const score = calculatePriorityScore(pkg);
        return score > 15 || pkg.risk === 'CRITICAL' || pkg.risk === 'HIGH';
    });
    
  // Group by section headers
  const groups = {
      critical: actionRequired.filter(p => p.risk === 'CRITICAL'),
      high: actionRequired.filter(p => p.risk === 'HIGH'),
      blocked: actionRequired.filter(p => p.risk === 'BLOCKED'),
      deferred: actionRequired.filter(p => p.risk === 'DEFERRED'),
      medium: actionRequired.filter(p => p.risk === 'MEDIUM' && (p.note && /ACCEPTED/i.test(p.note || ''))), // Show accepted risks if high priority?
  };
  // Note: Spec shows Blocked items in Action Required section.

  if (groups.critical.length > 0) {
      markdown += `### 🔴 Critical Risk (${groups.critical.length})\n`;
      groups.critical.forEach(pkg => {
          const typeLabel = pkg.type === 'devDependencies' ? 'Dev' : 'Runtime';
          const ageStr = formatAge(pkg.age);
          const noteBadge = pkg.note ? `\n  ${formatNoteWithBadge(pkg.note)}` : '';
          markdown += `• ${pkg.name} (${pkg.current} → ${pkg.latest}) - ${typeLabel}\n`;
          markdown += `  ${ageStr} old${pkg.isStale ? ', STALE' : ''}${noteBadge}\n\n`;
      });
  }

  if (groups.high.length > 0) {
      markdown += `### ⚠️ High Priority (${groups.high.length})\n`;
      groups.high.forEach(pkg => {
          const typeLabel = pkg.type === 'devDependencies' ? 'Dev' : 'Runtime';
          const ageStr = formatAge(pkg.age);
          const noteBadge = pkg.note ? `\n  ${formatNoteWithBadge(pkg.note)}` : '';
          markdown += `• ${pkg.name} (${pkg.current} → ${pkg.latest}) - ${typeLabel}\n`;
          markdown += `  ${ageStr} old${noteBadge}\n\n`;
      });
  }

  if (groups.blocked.length > 0) {
      markdown += `### 🚫 Blocked Items (${groups.blocked.length})\n`;
      groups.blocked.forEach(pkg => {
          const typeLabel = pkg.type === 'devDependencies' ? 'Dev' : 'Runtime';
          const noteBadge = pkg.note ? `\n  ${formatNoteWithBadge(pkg.note)}` : '';
          markdown += `• ${pkg.name} (${pkg.current} → ${pkg.latest}) - ${typeLabel}${noteBadge}\n\n`;
      });
  }

  if (actionRequired.length === 0) {
      markdown += `✅ No critical actions required\n\n`;
  }

  // Full Dependency List
  markdown += `━━━ FULL DEPENDENCY LIST ━━━━━━━━━━━━━━━━━━━\n\n`;
  
  const generateTable = (deps: EnrichedPackage[]) => {
      if (deps.length === 0) return '_No outdated dependencies_\n\n';
      // Sort by risk then name
      const tableSorted = [...deps].sort((a, b) => {
          // reuse sort logic
          const riskOrder: Record<string, number> = {
            'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 
            'BLOCKED': 4, 'DEFERRED': 5, 'ACCEPTED_RISK': 2, 'Exotic': 6
          };
          const rDiff = (riskOrder[a.risk] || 99) - (riskOrder[b.risk] || 99);
          if (rDiff !== 0) return rDiff;
          return a.name.localeCompare(b.name);
      });

      let table = `| Package | Current | Latest | Age | Risk | Notes |\n`;
      table += `|---------|---------|--------|-----|------|-------|\n`;
      
      for (const pkg of tableSorted) {
        const ageStr = formatAge(pkg.age);
        let riskLabel: string = pkg.risk;
        // Add emoji to risk label in table
        if (pkg.risk === 'CRITICAL') riskLabel = '🔴 Critical';
        else if (pkg.risk === 'HIGH') riskLabel = '⚠️ High';
        else if (pkg.risk === 'MEDIUM') riskLabel = '📦 Medium';
        else if (pkg.risk === 'LOW') riskLabel = '✅ Low';
        else if (pkg.risk === 'BLOCKED') riskLabel = '🚫 Blocked';
        
        const noteStr = pkg.note ? formatNoteWithBadge(pkg.note) : '';

        table += `| ${pkg.name} | ${pkg.current} | ${pkg.latest} | ${ageStr} | ${riskLabel} | ${noteStr} |\n`;
      }
      return table + '\n';
  };

  markdown += `## Runtime Dependencies\n\n`;
  markdown += generateTable(runtimeDeps);
  
  markdown += `## Dev Dependencies\n\n`;
  markdown += generateTable(devDeps);

  return markdown;
}
