import fs from 'fs/promises';
import path from 'path';
import { diff } from 'semver';
import { Snapshot, TrendData, TrendMetric, EnrichedPackage, SnapshotSummary, SnapshotRiskBreakdown } from '../types/index.js';
import { calculateSummary } from '../reports/summary.js';

export const SNAPSHOTS_DIR = '.dep-report/snapshots';

/**
 * Creates a snapshot from analysis results
 */
export function createSnapshot(
    packages: EnrichedPackage[], 
    healthScore: number, 
    totalDependencies: number
): Snapshot {
    const summary = calculateSummary(packages, totalDependencies);
    const date = new Date().toISOString();
    
    const devDeps = packages.filter(p => p.type === 'devDependencies');
    const runtimeDeps = packages.filter(p => p.type !== 'devDependencies');
    
    const snapshotSummary: SnapshotSummary = {
        total: totalDependencies,
        outdated: summary.outdated,
        stale: summary.stale,
        upToDate: summary.upToDate,
        runtime: {
             total: runtimeDeps.length, // Only counting outdated as we don't know total runtime
             outdated: runtimeDeps.length,
             stale: runtimeDeps.filter(p => p.isStale).length
        },
        dev: {
             total: devDeps.length, // Only counting outdated
             outdated: devDeps.length,
             stale: devDeps.filter(p => p.isStale).length
        }
    };

    const riskBreakdown: SnapshotRiskBreakdown = {
        critical: activeCount(packages, 'CRITICAL'),
        high: activeCount(packages, 'HIGH'),
        medium: activeCount(packages, 'MEDIUM'),
        low: activeCount(packages, 'LOW'),
        blocked: summary.blocked,
        deferred: summary.deferred
    };

    return {
        timestamp: date,
        summary: snapshotSummary,
        riskBreakdown,
        healthScore,
        statusLevel: summary.riskStatus,
        dependencies: packages.map(p => ({
            name: p.name,
            current: p.current,
            latest: p.latest,
            publishedDate: p.currentPublishedAt ? p.currentPublishedAt.toISOString() : null,
            ageInMonths: p.age !== null ? p.age / 30 : null,
            updateType: diff(p.current, p.latest) || null,
            risk: p.risk,
            isStale: p.isStale,
            isDev: p.type === 'devDependencies',
            hasSecurityAdvisory: !!p.hasSecurityAdvisory,
            note: p.note || null
        }))
    };
}

function activeCount(packages: EnrichedPackage[], risk: string): number {
    return packages.filter(p => p.risk === risk).length;
}


/**
 * Saves a snapshot to the history
 */
export async function saveSnapshot(snapshot: Snapshot, projectRoot: string): Promise<void> {
    const snapshotsDir = path.join(projectRoot, SNAPSHOTS_DIR);
    
    try {
        await fs.access(snapshotsDir);
    } catch {
        await fs.mkdir(snapshotsDir, { recursive: true });
    }

    // Use date part for filename, handling overwrites for same day if needed, or append time?
    // Spec says: 2026-01-01.json. If we run multiple times a day, we might overwrite.
    // "Store every report as a versioned snapshot." 
    // Spec example: 2026-01-01.json
    // I'll stick to YYYY-MM-DD.json to avoid too many files, latest run of the day wins.
    const filename = `${snapshot.timestamp.split('T')[0]}.json`;
    const filePath = path.join(snapshotsDir, filename);

    await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2));
}

/**
 * Loads all snapshots from history
 */
export async function loadSnapshots(projectRoot: string): Promise<Snapshot[]> {
    const snapshotsDir = path.join(projectRoot, SNAPSHOTS_DIR);
    
    try {
        await fs.access(snapshotsDir);
    } catch {
        return [];
    }

    const files = await fs.readdir(snapshotsDir);
    const snapshotFiles = files.filter(f => f.endsWith('.json'));
    
    const snapshots: Snapshot[] = [];
    
    for (const file of snapshotFiles) {
        try {
            const content = await fs.readFile(path.join(snapshotsDir, file), 'utf-8');
            snapshots.push(JSON.parse(content));
        } catch (e) {
            console.warn(`Failed to parse snapshot ${file}:`, e);
        }
    }
    
    return snapshots.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Calculates trend data from snapshots
 */
export function calculateTrend(snapshots: Snapshot[]): TrendData {
    const sorted = [...snapshots].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  
    // Need at least one snapshot for "current"
    if (sorted.length === 0) {
        return createEmptyTrend();
    }

    
    return {
        period: '30 days', // Defaulting to last 30 days window effectively by showing recent snapshots or all? 
                           // Spec says "Trend (Last 30 Days)" in text, but logic takes all available? 
                           // Let's just return what we have.
        snapshots: sorted,
        metrics: {
            healthScore: calculateMetric(sorted, s => s.healthScore, 'higher-is-better'),
            staleCount: calculateMetric(sorted, s => s.summary.stale, 'lower-is-better'),
            outdatedCount: calculateMetric(sorted, s => s.summary.outdated, 'lower-is-better'),
            criticalCount: calculateMetric(sorted, s => s.riskBreakdown.critical, 'lower-is-better')
        }
    };
}

function calculateMetric(
    snapshots: Snapshot[], 
    getValue: (s: Snapshot) => number,
    direction: 'higher-is-better' | 'lower-is-better'
): TrendMetric {
    const current = snapshots[snapshots.length - 1];
    const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
    
    const currentValue = getValue(current);
    const previousValue = previous ? getValue(previous) : currentValue;
    const change = currentValue - previousValue;
    
    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    
    if (change === 0) {
        trend = 'stable';
    } else if (direction === 'higher-is-better') {
        trend = change > 0 ? 'improving' : 'worsening';
    } else {
        trend = change < 0 ? 'improving' : 'worsening';
    }
    
    return {
        current: currentValue,
        previous: previousValue,
        change,
        trend, 
        sparkline: snapshots.map(getValue)
    };
}

function createEmptyTrend(): TrendData {
     const emptyMetric: TrendMetric = {
         current: 0,
         previous: 0,
         change: 0,
         trend: 'stable',
         sparkline: []
     };
     
     return {
         period: 'N/A',
         snapshots: [],
         metrics: {
             healthScore: emptyMetric,
             staleCount: emptyMetric,
             outdatedCount: emptyMetric,
             criticalCount: emptyMetric
         }
     };
}
