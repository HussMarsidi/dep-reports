import { describe, test, expect } from 'bun:test';
import { calculateRisk, isExoticVersion, analyzePackages } from './analyzer.js';
import type { EnrichedPackage } from '../types/index.js';

describe('analyzer', () => {
  describe('isExoticVersion', () => {
    test('returns false for normal semver versions', () => {
      expect(isExoticVersion('1.0.0')).toBe(false);
      expect(isExoticVersion('2.3.4')).toBe(false);
      expect(isExoticVersion('1.0.0-beta.1')).toBe(false);
    });

    test('returns false for missing/not installed', () => {
      expect(isExoticVersion('-')).toBe(false);
      expect(isExoticVersion('missing')).toBe(false);
      expect(isExoticVersion('')).toBe(false);
    });

    test('returns true for file: protocol', () => {
      expect(isExoticVersion('file:../local-package')).toBe(true);
      expect(isExoticVersion('file:./local')).toBe(true);
    });

    test('returns true for git+ protocol', () => {
      expect(isExoticVersion('git+https://github.com/user/repo.git')).toBe(true);
      expect(isExoticVersion('git+ssh://git@github.com/user/repo.git')).toBe(true);
    });

    test('returns true for http/https protocols', () => {
      expect(isExoticVersion('https://example.com/package.tgz')).toBe(true);
      expect(isExoticVersion('http://example.com/package.tgz')).toBe(true);
    });

    test('returns true for link: protocol', () => {
      expect(isExoticVersion('link:../local-package')).toBe(true);
    });

    test('returns true for workspace: protocol', () => {
      expect(isExoticVersion('workspace:*')).toBe(true);
      expect(isExoticVersion('workspace:^1.0.0')).toBe(true);
    });
  });

  describe('calculateRisk', () => {
    test('returns Exotic for exotic versions', () => {
      expect(calculateRisk('file:../local', '1.0.0')).toBe('Exotic');
      expect(calculateRisk('git+https://github.com/user/repo', '1.0.0')).toBe('Exotic');
    });

    test('returns NotInstalled for missing versions', () => {
      expect(calculateRisk('-', '1.0.0')).toBe('NotInstalled');
      expect(calculateRisk('missing', '1.0.0')).toBe('NotInstalled');
      expect(calculateRisk('', '1.0.0')).toBe('NotInstalled');
    });

    test('returns Exotic for invalid semver', () => {
      expect(calculateRisk('invalid', '1.0.0')).toBe('Exotic');
      expect(calculateRisk('1.0.0', 'invalid')).toBe('Exotic');
    });

    test('returns Major for major version difference', () => {
      expect(calculateRisk('1.0.0', '2.0.0')).toBe('Major');
      expect(calculateRisk('2.5.0', '3.0.0')).toBe('Major');
      expect(calculateRisk('0.1.0', '1.0.0')).toBe('Major');
    });

    test('returns Minor for minor version difference', () => {
      expect(calculateRisk('1.0.0', '1.1.0')).toBe('Minor');
      expect(calculateRisk('2.3.0', '2.4.0')).toBe('Minor');
    });

    test('returns Patch for patch version difference', () => {
      expect(calculateRisk('1.0.0', '1.0.1')).toBe('Patch');
      expect(calculateRisk('2.3.4', '2.3.5')).toBe('Patch');
    });

    test('handles prerelease differences', () => {
      // semver.diff treats prerelease as major difference
      // This is expected behavior - going from stable to prerelease or vice versa
      expect(calculateRisk('1.0.0', '1.0.0-beta.1')).toBe('Major');
      expect(calculateRisk('1.0.0-alpha.1', '1.0.0')).toBe('Major');
    });

    test('handles same version', () => {
      expect(calculateRisk('1.0.0', '1.0.0')).toBe('Patch');
    });
  });

  describe('analyzePackages', () => {
    test('calculates risk for all packages', () => {
      const packages: EnrichedPackage[] = [
        {
          name: 'pkg1',
          current: '1.0.0',
          wanted: '1.0.0',
          latest: '2.0.0',
          type: 'dependencies',
          currentPublishedAt: null,
          latestPublishedAt: null,
          age: null,
          isStale: false,
          risk: 'Exotic', // Will be recalculated
        },
        {
          name: 'pkg2',
          current: '1.0.0',
          wanted: '1.0.0',
          latest: '1.1.0',
          type: 'dependencies',
          currentPublishedAt: null,
          latestPublishedAt: null,
          age: null,
          isStale: false,
          risk: 'Exotic', // Will be recalculated
        },
      ];

      const result = analyzePackages(packages);
      expect(result[0].risk).toBe('Major');
      expect(result[1].risk).toBe('Minor');
    });

    test('marks packages as stale when age exceeds threshold', () => {
      const packages: EnrichedPackage[] = [
        {
          name: 'pkg1',
          current: '1.0.0',
          wanted: '1.0.0',
          latest: '1.0.0',
          type: 'dependencies',
          currentPublishedAt: null,
          latestPublishedAt: null,
          age: 100, // 100 days old
          isStale: false,
          risk: 'Exotic',
        },
        {
          name: 'pkg2',
          current: '1.0.0',
          wanted: '1.0.0',
          latest: '1.0.0',
          type: 'dependencies',
          currentPublishedAt: null,
          latestPublishedAt: null,
          age: 30, // 30 days old
          isStale: false,
          risk: 'Exotic',
        },
      ];

      const result = analyzePackages(packages, 90); // 90 day threshold
      expect(result[0].isStale).toBe(true);
      expect(result[1].isStale).toBe(false);
    });

    test('does not mark as stale when threshold is null', () => {
      const packages: EnrichedPackage[] = [
        {
          name: 'pkg1',
          current: '1.0.0',
          wanted: '1.0.0',
          latest: '1.0.0',
          type: 'dependencies',
          currentPublishedAt: null,
          latestPublishedAt: null,
          age: 1000,
          isStale: false,
          risk: 'Exotic',
        },
      ];

      const result = analyzePackages(packages, null);
      expect(result[0].isStale).toBe(false);
    });

    test('handles null age gracefully', () => {
      const packages: EnrichedPackage[] = [
        {
          name: 'pkg1',
          current: '1.0.0',
          wanted: '1.0.0',
          latest: '1.0.0',
          type: 'dependencies',
          currentPublishedAt: null,
          latestPublishedAt: null,
          age: null,
          isStale: false,
          risk: 'Exotic',
        },
      ];

      const result = analyzePackages(packages, 90);
      expect(result[0].isStale).toBe(false);
    });
  });
});
