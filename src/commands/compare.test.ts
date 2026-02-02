import { describe, it, expect } from 'bun:test';
import { parseReport, extractDateFromContent } from './compare.js';

describe('compare command', () => {
  describe('extractDateFromContent', () => {
    it('should extract date from standard report header', () => {
      const content = '# Dependency Report (2026-02-02)\n\nGenerated at...';
      expect(extractDateFromContent(content)).toBe('2026-02-02');
    });

    it('should return null if no date found', () => {
      const content = '# Dependency Report\n\nGenerated at...';
      expect(extractDateFromContent(content)).toBeNull();
    });
  });

  describe('parseReport', () => {
    const singleTableContent = `
# Dependency Report (2026-01-01)

## Runtime Dependencies

| Package | Current | Latest | Age | Risk | Security | Notes |
|---------|---------|--------|-----|------|----------|-------|
| pkg-a   | 1.0.0   | 1.1.0  | 30d | LOW  |          |       |
| pkg-b   | 2.0.0   | 3.0.0  | 1y  | HIGH |          | Note  |
    `;

    const multiTableContent = `
## Runtime Dependencies

| Package | Current | Latest | Age | Risk |
|---------|---------|--------|-----|------|
| pkg-a   | 1.0.0   | 1.0.0  | 0d  | LOW  |

## Dev Dependencies

| Package | Current | Latest | Age | Risk |
|---------|---------|--------|-----|------|
| dev-a   | 4.0.0   | 5.0.0  | 1m  | HIGH |
    `;

    it('should parse single table correctly', () => {
      const result = parseReport(singleTableContent, '2026-01-01');
      expect(result).not.toBeNull();
      expect(result?.packages).toHaveLength(2);
      
      const pkgA = result?.packages.find(p => p.name === 'pkg-a');
      expect(pkgA).toBeDefined();
      expect(pkgA?.current).toBe('1.0.0');
      expect(pkgA?.latest).toBe('1.1.0');
      expect(pkgA?.risk).toBe('LOW');
      expect(pkgA?.age).toBe(30);

      const pkgB = result?.packages.find(p => p.name === 'pkg-b');
      expect(pkgB).toBeDefined();
      expect(pkgB?.age).toBe(365);
      expect(pkgB?.risk).toBe('HIGH');
      expect(pkgB?.note).toBe('Note');
    });

    it('should parse multiple tables correctly', () => {
      const result = parseReport(multiTableContent, '2026-01-01');
      expect(result).not.toBeNull();
      expect(result?.packages).toHaveLength(2);
      
      const pkgA = result?.packages.find(p => p.name === 'pkg-a');
      const devA = result?.packages.find(p => p.name === 'dev-a');
      
      expect(pkgA).toBeDefined();
      expect(devA).toBeDefined();
    });

    it('should handle Security column existence', () => {
      const content = `
| Package | Current | Latest | Age | Risk | Security |
|---------|---------|--------|-----|------|----------|
| pkg-a   | 1.0.0   | 1.0.1  | 5d  | LOW  |          |
      `;
      const result = parseReport(content, '2026-01-01');
      expect(result?.packages).toHaveLength(1);
      expect(result?.packages[0].name).toBe('pkg-a');
    });

    it('should handle column order changes (dynamic mapping)', () => {
      const content = `
| Risk | Package | Latest | Current | Age |
|------|---------|--------|---------|-----|
| LOW  | pkg-a   | 2.0.0  | 1.0.0   | 10d |
      `;
      const result = parseReport(content, '2026-01-01');
      expect(result?.packages).toHaveLength(1);
      const pkg = result?.packages[0];
      expect(pkg?.name).toBe('pkg-a');
      expect(pkg?.current).toBe('1.0.0');
      expect(pkg?.latest).toBe('2.0.0');
      expect(pkg?.risk).toBe('LOW');
    });

    it('should return null for invalid content', () => {
      const content = 'Just some text\nNo tables here';
      const result = parseReport(content, '2026-01-01');
      expect(result).toBeNull();
    });
  });
});
