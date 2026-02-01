import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { format, parse, subDays, differenceInDays } from 'date-fns';
import { logger } from '../utils/logger.js';
import type { EnrichedPackage, Risk } from '../types/index.js';

interface ReportData {
  date: string;
  packages: EnrichedPackage[];
  summary: {
    total: number;
    outdated: number;
    stale: number;
    major: number;
  };
}

/**
 * Parses a markdown report to extract package data
 */
function parseReport(content: string, date: string): ReportData | null {
  // Extract packages from the table
  const tableMatch = content.match(/\| Package \|.*?\n\|-+\|\n([\s\S]*?)\n\n/);
  if (!tableMatch) {
    return null;
  }

  const rows = tableMatch[1].trim().split('\n');
  const packages: EnrichedPackage[] = [];
  
  for (const row of rows) {
    const cells = row.split('|').map(c => c.trim()).filter(c => c);
    if (cells.length < 6) continue;
    
    const [name, current, latest, age, behind, risk, status, notes] = cells;
    
    // Skip if stable (no action needed)
    if (status.includes('Stable')) continue;
    
    // Parse age
    let ageDays: number | null = null;
    if (age && age !== 'Unknown') {
      const ageMatch = age.match(/(\d+)d|(\d+)m|(\d+)y/);
      if (ageMatch) {
        if (ageMatch[1]) ageDays = parseInt(ageMatch[1]);
        else if (ageMatch[2]) ageDays = parseInt(ageMatch[2]) * 30;
        else if (ageMatch[3]) ageDays = parseInt(ageMatch[3]) * 365;
      }
    }
    
    // Parse behind
    let behindDays: number | null = null;
    if (behind && behind !== '—') {
      const behindMatch = behind.match(/(\d+)d|(\d+)m|(\d+)y/);
      if (behindMatch) {
        if (behindMatch[1]) behindDays = parseInt(behindMatch[1]);
        else if (behindMatch[2]) behindDays = parseInt(behindMatch[2]) * 30;
        else if (behindMatch[3]) behindDays = parseInt(behindMatch[3]) * 365;
      }
    }
    
    // Determine risk
    let pkgRisk: Risk = 'Patch';
    if (risk.includes('Major')) pkgRisk = 'Major';
    else if (risk.includes('Minor')) pkgRisk = 'Minor';
    else if (risk.includes('Patch')) pkgRisk = 'Patch';
    else if (risk.includes('Exotic')) pkgRisk = 'Exotic';
    else if (risk.includes('NotInstalled')) pkgRisk = 'NotInstalled';
    
    packages.push({
      name,
      current,
      latest,
      wanted: latest,
      type: 'dependencies',
      currentPublishedAt: null,
      latestPublishedAt: null,
      age: ageDays,
      behindByDays: behindDays,
      isStale: ageDays !== null && ageDays > 365,
      risk: pkgRisk,
      note: notes || undefined,
    });
  }
  
  // Extract summary from header
  const summaryMatch = content.match(/Total: (\d+) \| Outdated: (\d+) \| Stale: (\d+)/);
  const total = summaryMatch ? parseInt(summaryMatch[1]) : packages.length;
  const outdated = summaryMatch ? parseInt(summaryMatch[2]) : packages.length;
  const stale = summaryMatch ? parseInt(summaryMatch[3]) : packages.filter(p => p.isStale).length;
  const major = packages.filter(p => p.risk === 'Major').length;
  
  return {
    date,
    packages,
    summary: { total, outdated, stale, major },
  };
}

/**
 * Finds a report file by date or keyword
 */
function findReport(reportsDir: string, dateOrKeyword: string): string | null {
  if (dateOrKeyword === 'latest') {
    const latestPath = join(reportsDir, 'latest.md');
    if (existsSync(latestPath)) {
      return latestPath;
    }
    return null;
  }
  
  if (dateOrKeyword === 'last-month') {
    const today = new Date();
    const lastMonth = subDays(today, 30);
    
    // Find closest report
    const files = readdirSync(reportsDir)
      .filter(f => f.endsWith('_outdated.md'))
      .map(f => {
        const match = f.match(/(\d{4}-\d{2}-\d{2})_outdated\.md/);
        return match ? { file: f, date: parse(match[1], 'yyyy-MM-dd', new Date()) } : null;
      })
      .filter((f): f is { file: string; date: Date } => f !== null)
      .sort((a, b) => Math.abs(differenceInDays(a.date, lastMonth)) - Math.abs(differenceInDays(b.date, lastMonth)));
    
    if (files.length > 0) {
      return join(reportsDir, files[0].file);
    }
    return null;
  }
  
  // Try parsing as date
  try {
    const date = parse(dateOrKeyword, 'yyyy-MM-dd', new Date());
    const dateStr = format(date, 'yyyy-MM-dd');
    const reportPath = join(reportsDir, `${dateStr}_outdated.md`);
    if (existsSync(reportPath)) {
      return reportPath;
    }
  } catch {
    // Not a valid date
  }
  
  return null;
}

/**
 * Calculates health score
 */
function calculateHealthScore(summary: ReportData['summary']): number {
  return 100 - (summary.stale * 5) - (summary.major * 3);
}

/**
 * Compares two dependency reports
 */
export async function compareCommand(
  fromDate: string,
  toDate: string,
  cwd: string = process.cwd()
): Promise<void> {
  const reportsDir = join(cwd, '.dep-report', 'reports');
  
  if (!existsSync(reportsDir)) {
    logger.error('No reports directory found. Run dep-report first to generate reports.');
    process.exit(1);
  }
  
  const fromPath = findReport(reportsDir, fromDate);
  const toPath = findReport(reportsDir, toDate);
  
  if (!fromPath) {
    logger.error(`Report not found for: ${fromDate}`);
    process.exit(1);
  }
  
  if (!toPath) {
    logger.error(`Report not found for: ${toDate}`);
    process.exit(1);
  }
  
  const fromContent = readFileSync(fromPath, 'utf-8');
  const toContent = readFileSync(toPath, 'utf-8');
  
  const fromMatch = fromPath.match(/(\d{4}-\d{2}-\d{2})_outdated\.md/);
  const toMatch = toPath.match(/(\d{4}-\d{2}-\d{2})_outdated\.md/);
  const fromDateStr = fromMatch ? fromMatch[1] : fromDate;
  const toDateStr = toMatch ? toMatch[1] : toDate;
  
  const fromData = parseReport(fromContent, fromDateStr);
  const toData = parseReport(toContent, toDateStr);
  
  if (!fromData || !toData) {
    logger.error('Failed to parse reports');
    process.exit(1);
  }
  
  const daysDiff = differenceInDays(parse(toDateStr, 'yyyy-MM-dd', new Date()), parse(fromDateStr, 'yyyy-MM-dd', new Date()));
  
  // Calculate deltas
  const staleDelta = toData.summary.stale - fromData.summary.stale;
  const majorDelta = toData.summary.major - fromData.summary.major;
  
  // Find added/removed packages
  const fromNames = new Set(fromData.packages.map(p => p.name));
  const toNames = new Set(toData.packages.map(p => p.name));
  
  const added = toData.packages.filter(p => !fromNames.has(p.name));
  const removed = fromData.packages.filter(p => !toNames.has(p.name));
  
  // Find upgraded packages
  const upgraded = toData.packages.filter(p => {
    const fromPkg = fromData.packages.find(fp => fp.name === p.name);
    return fromPkg && fromPkg.current !== p.current;
  });
  
  // Calculate health scores
  const fromScore = calculateHealthScore(fromData.summary);
  const toScore = calculateHealthScore(toData.summary);
  const improvement = fromScore > 0 ? ((toScore - fromScore) / fromScore) * 100 : 0;
  
  // Output comparison
  console.log(`\nDependency Health Comparison`);
  console.log(`From: ${fromDateStr} → ${toDateStr} (${daysDiff} days)\n`);
  
  if (upgraded.length > 0) {
    console.log(`📈 Improvements:`);
    for (const pkg of upgraded.slice(0, 5)) {
      const fromPkg = fromData.packages.find(fp => fp.name === pkg.name);
      console.log(`  • ${pkg.name}: ${fromPkg?.current} → ${pkg.current}`);
    }
    if (upgraded.length > 5) {
      console.log(`  ... and ${upgraded.length - 5} more`);
    }
    console.log('');
  }
  
  if (staleDelta !== 0 || majorDelta !== 0) {
    console.log(`📊 Metrics:`);
    if (staleDelta !== 0) {
      const sign = staleDelta > 0 ? '+' : '';
      console.log(`  • Stale packages: ${fromData.summary.stale} → ${toData.summary.stale} (${sign}${staleDelta})`);
    }
    if (majorDelta !== 0) {
      const sign = majorDelta > 0 ? '+' : '';
      console.log(`  • Major upgrades pending: ${fromData.summary.major} → ${toData.summary.major} (${sign}${majorDelta})`);
    }
    console.log('');
  }
  
  if (added.length > 0) {
    console.log(`➕ Added: ${added.map(p => p.name).join(', ')}`);
  }
  
  if (removed.length > 0) {
    console.log(`➖ Removed: ${removed.map(p => p.name).join(', ')}`);
  }
  
  if (added.length > 0 || removed.length > 0) {
    console.log('');
  }
  
  const statusEmoji = improvement > 0 ? '✅' : improvement < 0 ? '⚠️' : '➡️';
  const statusText = improvement > 0 ? 'improved' : improvement < 0 ? 'regressed' : 'unchanged';
  console.log(`${statusEmoji} Overall: Health ${statusText} by ${Math.abs(improvement).toFixed(1)}%`);
  console.log(`   Score: ${fromScore.toFixed(1)} → ${toScore.toFixed(1)}\n`);
  
  // Exit code based on improvement
  process.exit(improvement < 0 ? 1 : 0);
}
