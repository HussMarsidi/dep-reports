import { describe, test, expect } from 'bun:test';
import { calculateRisk, isExoticVersion, analyzePackages } from './analyzer.js';
import type { EnrichedPackage } from '../types/index.js';

function mockPkg(
  current: string, 
  latest: string, 
  age: number | null = null, 
  note?: string, 
  hasSecurityAdvisory: boolean = false
): EnrichedPackage {
  return {
    name: 'test-pkg',
    current,
    latest,
    age,
    note,
    hasSecurityAdvisory,
    // defaults
    wanted: latest,
    type: 'dependencies',
    currentPublishedAt: null,
    latestPublishedAt: null,
    behindByDays: null,
    isStale: false,
    risk: 'Exotic' 
  };
}

describe('analyzer', () => {
  describe('isExoticVersion', () => {
    test('returns false for normal semver versions', () => {
      expect(isExoticVersion('1.0.0')).toBe(false);
      expect(isExoticVersion('1.0.0-beta.1')).toBe(false);
    });

    test('returns false for missing/not installed', () => {
      expect(isExoticVersion('-')).toBe(false);
      expect(isExoticVersion('missing')).toBe(false);
    });

    test('returns true for protocols', () => {
      expect(isExoticVersion('file:./local')).toBe(true);
      expect(isExoticVersion('git+ssh://...')).toBe(true);
      expect(isExoticVersion('workspace:*')).toBe(true);
    });
  });

  describe('calculateRisk', () => {
    test('returns Exotic for exotic versions', () => {
      expect(calculateRisk(mockPkg('file:../local', '1.0.0'))).toBe('Exotic');
    });

    test('returns NotInstalled for missing versions', () => {
      expect(calculateRisk(mockPkg('missing', '1.0.0'))).toBe('NotInstalled');
      expect(calculateRisk(mockPkg('-', '1.0.0'))).toBe('NotInstalled');
    });

    test('returns CRITICAL for security advisory', () => {
        expect(calculateRisk(mockPkg('1.0.0', '1.0.1', 10, undefined, true))).toBe('CRITICAL');
    });

    test('returns CRITICAL for very old packages (>24mo)', () => {
        // 25 months * 30 days = 750 days
        expect(calculateRisk(mockPkg('1.0.0', '1.0.1', 750))).toBe('CRITICAL');
    });

    test('returns BLOCKED/DEFERRED based on notes', () => {
        expect(calculateRisk(mockPkg('1.0.0', '2.0.0', 100, 'BLOCKED: reason'))).toBe('BLOCKED');
        expect(calculateRisk(mockPkg('1.0.0', '2.0.0', 100, 'DEFERRED: reason'))).toBe('DEFERRED');
    });
    
    describe('Major updates', () => {
        test('CRITICAL if stale (>18mo)', () => {
            // 19 months = 570 days
            expect(calculateRisk(mockPkg('1.0.0', '2.0.0', 570))).toBe('CRITICAL');
        });
        test('HIGH if moderately old (6-18mo)', () => {
            // 8 months = 240 days
            expect(calculateRisk(mockPkg('1.0.0', '2.0.0', 240))).toBe('HIGH');
        });
        test('MEDIUM if recent (<6mo)', () => {
            // 2 months = 60 days
            expect(calculateRisk(mockPkg('1.0.0', '2.0.0', 60))).toBe('MEDIUM');
        });
        test('HIGH if age unknown (fallback)', () => {
            expect(calculateRisk(mockPkg('1.0.0', '2.0.0', null))).toBe('HIGH');
        });
    });

    describe('Minor updates', () => {
        test('HIGH if stale (>18mo)', () => {
            expect(calculateRisk(mockPkg('1.1.0', '1.2.0', 570))).toBe('HIGH');
        });
        test('MEDIUM if moderately old (6-18mo)', () => {
            expect(calculateRisk(mockPkg('1.1.0', '1.2.0', 240))).toBe('MEDIUM');
        });
        test('LOW if recent (<6mo)', () => {
            expect(calculateRisk(mockPkg('1.1.0', '1.2.0', 60))).toBe('LOW');
        });
        test('MEDIUM if age unknown (fallback)', () => {
            expect(calculateRisk(mockPkg('1.1.0', '1.2.0', null))).toBe('MEDIUM');
        });
    });

    describe('Patch updates', () => {
        test('MEDIUM if old (>12mo)', () => {
            // 13 months = 390 days
            expect(calculateRisk(mockPkg('1.0.0', '1.0.1', 390))).toBe('MEDIUM');
        });
        test('LOW if recent', () => {
            expect(calculateRisk(mockPkg('1.0.0', '1.0.1', 60))).toBe('LOW');
        });
        test('LOW if age unknown', () => {
            expect(calculateRisk(mockPkg('1.0.0', '1.0.1', null))).toBe('LOW');
        });
    });

    test('handles valid prereleases as LOW', () => {
        expect(calculateRisk(mockPkg('1.0.0-beta.1', '1.0.0-beta.2', 10))).toBe('LOW');
    });
  });

  describe('analyzePackages', () => {
    test('calculates risk for all packages', () => {
      const packages: EnrichedPackage[] = [
        mockPkg('1.0.0', '2.0.0', 600), // Major + Stale -> CRITICAL
        mockPkg('1.1.0', '1.2.0', 30),  // Minor + Recent -> LOW
      ];

      const result = analyzePackages(packages);
      expect(result[0].risk).toBe('CRITICAL');
      expect(result[1].risk).toBe('LOW');
    });

    test('marks packages as stale when age exceeds threshold', () => {
      const packages: EnrichedPackage[] = [
        mockPkg('1.0.0', '1.0.0', 100), // 100 days old
        mockPkg('1.0.0', '1.0.0', 30),  // 30 days old
      ];

      const result = analyzePackages(packages, 90); // 90 day threshold
      expect(result[0].isStale).toBe(true);
      expect(result[1].isStale).toBe(false);
    });
  });
});
