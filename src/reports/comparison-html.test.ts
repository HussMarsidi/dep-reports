
import { describe, it, expect } from 'bun:test';
import { generateComparisonHtml } from './comparison-html.js';
import type { EnrichedPackage } from '../types/index.js';

describe('generateComparisonHtml', () => {
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

  it('should generate valid HTML structure', () => {
    const html = generateComparisonHtml(mockData);
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>Dependency Health Comparison: 2026-01-01 → 2026-02-01</title>');
    expect(html).toContain('class="container"');
  });

  it('should display health metrics', () => {
    const html = generateComparisonHtml(mockData);
    expect(html).toContain('>80</div>'); // Score
    expect(html).toContain('+30.0</span>'); // Score change
  });

  it('should include changed packages', () => {
    const html = generateComparisonHtml(mockData);
    expect(html).toContain('Upgraded Packages (1)');
    expect(html).toContain('pkg-a');
    expect(html).toContain('1.0.0 → 2.0.0');
    expect(html).toContain('new-pkg');
    expect(html).toContain('old-pkg');
  });

  it('should show correct improvement status', () => {
    const html = generateComparisonHtml(mockData);
    expect(html).toContain('Improved');
    expect(html).toContain('60.0%');
  });
});
