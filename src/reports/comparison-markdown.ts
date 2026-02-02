import type { EnrichedPackage } from '../types/index.js';

interface ComparisonData {
  fromDate: string;
  toDate: string;
  daysDiff: number | string;
  fromPackages: EnrichedPackage[];
  toPackages: EnrichedPackage[];
  summary: {
    fromStale: number;
    toStale: number;
    fromMajor: number;
    toMajor: number;
    fromScore: number;
    toScore: number;
    improvement: number;
  };
  changes: {
    added: EnrichedPackage[];
    removed: EnrichedPackage[];
    upgraded: Array<{ pkg: EnrichedPackage; fromVersion: string }>;
  };
}

/**
 * Generates markdown comparison report for developers
 */
export function generateComparisonMarkdown(data: ComparisonData): string {
  const { fromDate, toDate, daysDiff, summary, changes } = data;
  
  let markdown = `# Dependency Health Comparison\n`;
  markdown += `From: ${fromDate} → ${toDate} (${daysDiff} days)\n\n`;
  
  // Summary Section
  markdown += `## Summary\n\n`;
  
  const scoreChange = summary.toScore - summary.fromScore;
  const scoreChangePercent = summary.fromScore > 0 
    ? ((scoreChange / summary.fromScore) * 100).toFixed(1) 
    : '0.0';
  const scoreIcon = scoreChange > 0 ? '✅' : scoreChange < 0 ? '⚠️' : '➡️';
  
  markdown += `- Health Score: ${summary.fromScore.toFixed(1)} → ${summary.toScore.toFixed(1)} ${scoreIcon} (${scoreChangePercent}%)\n`;
  
  if (summary.toStale !== summary.fromStale) {
    const staleDelta = summary.toStale - summary.fromStale;
    const sign = staleDelta > 0 ? '+' : '';
    markdown += `- Stale Packages: ${summary.fromStale} → ${summary.toStale} (${sign}${staleDelta})\n`;
  }
  
  if (summary.toMajor !== summary.fromMajor) {
    const majorDelta = summary.toMajor - summary.fromMajor;
    const sign = majorDelta > 0 ? '+' : '';
    markdown += `- Major Updates Pending: ${summary.fromMajor} → ${summary.toMajor} (${sign}${majorDelta})\n`;
  }
  
  markdown += `\n`;
  
  // Package Changes
  if (changes.upgraded.length > 0) {
    markdown += `## 📈 Upgraded Packages (${changes.upgraded.length})\n\n`;
    changes.upgraded.slice(0, 10).forEach(({ pkg, fromVersion }) => {
      markdown += `- **${pkg.name}**: ${fromVersion} → ${pkg.current}\n`;
    });
    if (changes.upgraded.length > 10) {
      markdown += `\n_... and ${changes.upgraded.length - 10} more_\n`;
    }
    markdown += `\n`;
  }
  
  if (changes.added.length > 0) {
    markdown += `## ➕ Added Packages (${changes.added.length})\n\n`;
    changes.added.forEach(pkg => {
      markdown += `- ${pkg.name} (${pkg.current})\n`;
    });
    markdown += `\n`;
  }
  
  if (changes.removed.length > 0) {
    markdown += `## ➖ Removed Packages (${changes.removed.length})\n\n`;
    changes.removed.forEach(pkg => {
      markdown += `- ${pkg.name} (was ${pkg.current})\n`;
    });
    markdown += `\n`;
  }
  
  // Overall Assessment
  markdown += `## Overall Assessment\n\n`;
  const statusText = summary.improvement > 0 ? 'improved' : summary.improvement < 0 ? 'regressed' : 'unchanged';
  const statusEmoji = summary.improvement > 0 ? '✅' : summary.improvement < 0 ? '⚠️' : '➡️';
  markdown += `${statusEmoji} Dependency health has **${statusText}** by ${Math.abs(summary.improvement).toFixed(1)}%\n`;
  
  return markdown;
}
