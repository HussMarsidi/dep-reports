import { format } from 'date-fns';
import type { EnrichedPackage } from '../types/index.js';
import { calculateSummary, calculatePriorityScore, formatNoteWithBadge, isStable } from './summary.js';

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
 * Formats behind-by for display
 */
function formatBehindBy(behindByDays: number | null): string {
  if (behindByDays === null) {
    return '—';
  }
  if (behindByDays < 30) {
    return `${behindByDays}d`;
  }
  if (behindByDays < 365) {
    const months = Math.floor(behindByDays / 30);
    return `${months}m`;
  }
  const years = Math.floor(behindByDays / 365);
  const remainingMonths = Math.floor((behindByDays % 365) / 30);
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

  if (packages.length === 0) {
    return `# Dependency Report (${dateStr})

Generated at: ${timestamp}

✅ All dependencies are up to date
`;
  }

  // Calculate summary
  const total = totalDependencies ?? packages.length;
  const summary = calculateSummary(packages, total);

  // Sort packages: Major risk first, then by age (oldest first)
  const sorted = [...packages].sort((a, b) => {
    const riskOrder: Record<string, number> = {
      Major: 0,
      Minor: 1,
      Patch: 2,
      Exotic: 3,
      NotInstalled: 4,
    };
    const riskDiff = (riskOrder[a.risk] || 99) - (riskOrder[b.risk] || 99);
    if (riskDiff !== 0) return riskDiff;
    
    // Then by age (nulls last)
    if (a.age === null && b.age === null) return 0;
    if (a.age === null) return 1;
    if (b.age === null) return -1;
    return b.age - a.age; // Oldest first
  });

  // Build summary section
  let markdown = `# Dependency Report (${dateStr})

Generated at: ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              ${summary.riskStatusEmoji} ${summary.riskStatusText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: ${summary.total} | Outdated: ${summary.outdated} | Stale: ${summary.stale} | Up-to-date: ${summary.upToDate}
`;

  if (summary.blocked > 0 || summary.deferred > 0 || summary.accepted > 0) {
    markdown += `Blocked: ${summary.blocked} | Deferred: ${summary.deferred} | Accepted Risk: ${summary.accepted}\n`;
  }

  markdown += `\n**Risk Assessment:** ${summary.stale} stale dependencies and ${summary.major} unaddressed major upgrades detected.\n\n`;

  // Action Required section
  const actionRequired = sorted
    .map(pkg => ({ pkg, score: calculatePriorityScore(pkg) }))
    .filter(({ score }) => score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map(({ pkg }) => pkg);

  if (actionRequired.length > 0) {
    markdown += `━━━ ACTION REQUIRED ━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // Group by critical vs review soon
    const critical = actionRequired.filter(pkg => {
      const score = calculatePriorityScore(pkg);
      return score >= 20 || pkg.risk === 'Major' || (pkg.note && /BLOCKED/i.test(pkg.note));
    });
    const reviewSoon = actionRequired.filter(pkg => !critical.includes(pkg));

    if (critical.length > 0) {
      markdown += `🔴 Critical Risk\n`;
      for (const pkg of critical) {
        const ageStr = formatAge(pkg.age);
        const behindStr = formatBehindBy(pkg.behindByDays);
        const updateType = pkg.risk === 'Major' ? 'Major update' : pkg.risk === 'Minor' ? 'Minor update' : 'Patch update';
        const noteBadge = pkg.note ? `\n    ${formatNoteWithBadge(pkg.note)}` : '';
        
        markdown += `  • ${pkg.name} (${pkg.current} → ${pkg.latest})\n`;
        markdown += `    ${ageStr} old, behind by ${behindStr} | ${updateType}${noteBadge}\n\n`;
      }
    }

    if (reviewSoon.length > 0) {
      markdown += `🟡 Review Soon\n`;
      for (const pkg of reviewSoon) {
        const ageStr = formatAge(pkg.age);
        const behindStr = formatBehindBy(pkg.behindByDays);
        const updateType = pkg.risk === 'Major' ? 'Major update' : pkg.risk === 'Minor' ? 'Minor update' : 'Patch update';
        const noteBadge = pkg.note ? `\n    ${formatNoteWithBadge(pkg.note)}` : '';
        
        markdown += `  • ${pkg.name} (${pkg.current} → ${pkg.latest})\n`;
        markdown += `    ${ageStr} old, behind by ${behindStr} | ${updateType}${noteBadge}\n\n`;
      }
    }

    markdown += `\n`;
  } else {
    markdown += `━━━ ACTION REQUIRED ━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    markdown += `✅ No critical actions required\n\n`;
  }

  // Full dependency table
  markdown += `━━━ FULL DEPENDENCY LIST ━━━━━━━━━━━━━━━━━━━━━\n\n`;

  markdown += `| Package | Current | Latest | Age | Behind | Risk | Status | Notes |\n`;
  markdown += `|---------|---------|--------|-----|---------|------|--------|-------|\n`;

  for (const pkg of sorted) {
    const ageStr = formatAge(pkg.age);
    const behindStr = formatBehindBy(pkg.behindByDays);
    const riskEmoji = pkg.risk === 'Major' ? '🔴 Major' : pkg.risk === 'Minor' ? '🟡 Minor' : pkg.risk === 'Patch' ? '🟢 Patch' : pkg.risk;
    const status = isStable(pkg) ? '✅ Stable' : 'Outdated';
    const noteStr = pkg.note ? formatNoteWithBadge(pkg.note) : '';

    markdown += `| ${pkg.name} | ${pkg.current} | ${pkg.latest} | ${ageStr} | ${behindStr} | ${riskEmoji} | ${status} | ${noteStr} |\n`;
  }

  return markdown;
}
