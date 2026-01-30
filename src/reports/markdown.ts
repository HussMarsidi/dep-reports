import { format } from 'date-fns';
import type { EnrichedPackage } from '../types/index.js';

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
  date: Date = new Date()
): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const timestamp = format(date, 'yyyy-MM-dd HH:mm:ss');

  if (packages.length === 0) {
    return `# Dependency Report (${dateStr})

Generated at: ${timestamp}

All dependencies are up to date.
`;
  }

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

  let markdown = `# Dependency Report (${dateStr})

Generated at: ${timestamp}

## Outdated Packages (${packages.length})

| Package | Current | Latest | Risk | Age | Stale? | Notes |
|---------|---------|--------|------|-----|--------|-------|
`;

  for (const pkg of sorted) {
    const ageStr = formatAge(pkg.age);
    const riskStr = pkg.risk;
    const staleStr = pkg.isStale ? 'Yes' : 'No';
    const noteStr = pkg.note || '';

    markdown += `| ${pkg.name} | ${pkg.current} | ${pkg.latest} | ${riskStr} | ${ageStr} | ${staleStr} | ${noteStr} |\n`;
  }

  return markdown;
}
