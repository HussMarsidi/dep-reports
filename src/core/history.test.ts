import { describe, expect, test } from 'bun:test';
import { calculateHealthScore } from './analyzer.js';
import { calculateTrend, createSnapshot } from './history.js';
import type { EnrichedPackage, Snapshot } from '../types/index.js';

describe('calculateHealthScore', () => {
  test('returns 100 for perfect health', () => {
    const deps: EnrichedPackage[] = [
      {
        name: 'a', current: '1.0.0', latest: '1.0.0', wanted: '1.0.0', type: 'dependencies',
        risk: 'LOW', isStale: false, currentPublishedAt: null, latestPublishedAt: null, age: null, behindByDays: null
      }
    ];
    expect(calculateHealthScore(deps)).toBe(100);
  });

  test('penalizes critical risk', () => {
    const deps: EnrichedPackage[] = [
      {
        name: 'a', current: '1.0.0', latest: '2.0.0', wanted: '2.0.0', type: 'dependencies',
        risk: 'CRITICAL', isStale: true, currentPublishedAt: null, latestPublishedAt: null, age: 700, behindByDays: null
      }
    ];
    // Base 100
    // -10 (critical)
    // -3 (stale)
    // -5 (very old > 24m, 700d ~ 23m? 700/30 = 23.3 so maybe not very old)
    // Wait, very old logic: d.age > 365*2 = 730 days. 700 is not > 730.
    // -10 (more than 50% outdated)
    // Total: 100 - 10 - 3 - 10 = 77
    
    // Oh wait, outdatedPercent = 1/1 * 100 = 100% > 50% -> -10
    
    expect(calculateHealthScore(deps)).toBe(77);
  });
});

describe('history', () => {
    test('calculateTrend detects improvement', () => {
        const snap1 = {
            timestamp: '2026-01-01T00:00:00Z',
            healthScore: 70,
            summary: { stale: 5, outdated: 10 } as any,
            riskBreakdown: { critical: 2 } as any
        } as Snapshot;

        const snap2 = {
            timestamp: '2026-01-08T00:00:00Z',
            healthScore: 80,
            summary: { stale: 3, outdated: 8 } as any,
            riskBreakdown: { critical: 1 } as any
        } as Snapshot;

        const trend = calculateTrend([snap1, snap2]);

        expect(trend.metrics.healthScore.change).toBe(10);
        expect(trend.metrics.healthScore.trend).toBe('improving');
        
        expect(trend.metrics.staleCount.change).toBe(-2);
        expect(trend.metrics.staleCount.trend).toBe('improving'); // Lower is better
    });
});
