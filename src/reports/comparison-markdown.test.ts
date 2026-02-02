
import { describe, it, expect } from 'bun:test';
import { generateComparisonMarkdown } from './comparison-markdown.js';
import type { EnrichedPackage } from '../types/index.js';

describe('generateComparisonMarkdown', () => {
  const mockPackage: EnrichedPackage = {
    name: 'pkg-a',
    current: '1.0.0',
    latest: '2.0.0',
    wanted: '2.0.0',
    type: 'dependencies',
    currentPublishedAt: null,
    latestPublishedAt: null,
    age: 100,
    behindByDays: 10,
    isStale: false,
    risk: 'LOW',
    note: undefined,
  };

  const mockData = {
    fromDate: '2026-01-01',
    toDate: '2026-02-01',
    daysDiff: 31,
    fromPackages: [],
    toPackages: [],
    summary: {
      fromStale: 5,
      toStale: 2,
      fromMajor: 10,
      toMajor: 8,
      fromScore: 50,
      toScore: 80,
      improvement: 60
    },
    changes: {
      added: [{ ...mockPackage, name: 'new-pkg' }],
      removed: [{ ...mockPackage, name: 'old-pkg' }],
      upgraded: [{ pkg: { ...mockPackage, current: '2.0.0' }, fromVersion: '1.0.0' }]
    }
  };

  it('should generate valid markdown structure', () => {
    const md = generateComparisonMarkdown(mockData);
    
    expect(md).toContain('# Dependency Health Comparison');
    expect(md).toContain('From: 2026-01-01 → 2026-02-01 (31 days)');
    expect(md).toContain('Health Score: 50.0 → 80.0 ✅ (60.0%)');
  });

  it('should show stale package improvement', () => {
    const md = generateComparisonMarkdown(mockData);
    expect(md).toContain('Stale Packages: 5 → 2 (-3)');
  });

  it('should list upgraded packages', () => {
    const md = generateComparisonMarkdown(mockData);
    expect(md).toContain('Upgraded Packages (1)');
    expect(md).toContain('pkg-a**: 1.0.0 → 2.0.0');
  });

  it('should list added packages', () => {
    const md = generateComparisonMarkdown(mockData);
    expect(md).toContain('Added Packages (1)');
    expect(md).toContain('new-pkg (1.0.0)');
  });

  it('should list removed packages', () => {
    const md = generateComparisonMarkdown(mockData);
    expect(md).toContain('Removed Packages (1)');
    expect(md).toContain('old-pkg (was 1.0.0)');
  });

  it('should show overall assessment', () => {
    const md = generateComparisonMarkdown(mockData);
    expect(md).toContain('Dependency health has **improved** by 60.0%');
  });
});
