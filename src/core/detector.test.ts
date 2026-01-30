import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { detectPackageManager, getOutdatedCommand } from './detector.js';

describe('detector', () => {
  const testDir = join(process.cwd(), '.test-tmp');

  beforeAll(() => {
    // Clean up test directory before all tests
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    // Clean up test directory after all tests
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  // Helper to clean up individual test files
  const cleanupTestFiles = () => {
    const files = ['pnpm-lock.yaml', 'bun.lock', 'bun.lockb', 'package-lock.json'];
    for (const file of files) {
      const filePath = join(testDir, file);
      if (existsSync(filePath)) {
        rmSync(filePath);
      }
    }
  };

  describe('detectPackageManager', () => {
    test('detects pnpm when pnpm-lock.yaml exists', () => {
      cleanupTestFiles();
      writeFileSync(join(testDir, 'pnpm-lock.yaml'), '');
      const result = detectPackageManager(testDir);
      expect(result).toEqual({
        manager: 'pnpm',
        lockfile: 'pnpm-lock.yaml',
      });
    });

    test('detects bun when bun.lock exists', () => {
      cleanupTestFiles();
      writeFileSync(join(testDir, 'bun.lock'), '');
      const result = detectPackageManager(testDir);
      expect(result).toEqual({
        manager: 'bun',
        lockfile: 'bun.lock',
      });
    });

    test('detects bun when bun.lockb exists', () => {
      cleanupTestFiles();
      writeFileSync(join(testDir, 'bun.lockb'), '');
      const result = detectPackageManager(testDir);
      expect(result).toEqual({
        manager: 'bun',
        lockfile: 'bun.lockb',
      });
    });

    test('detects npm when package-lock.json exists', () => {
      cleanupTestFiles();
      writeFileSync(join(testDir, 'package-lock.json'), '');
      const result = detectPackageManager(testDir);
      expect(result).toEqual({
        manager: 'npm',
        lockfile: 'package-lock.json',
      });
    });

    test('prioritizes pnpm over bun', () => {
      cleanupTestFiles();
      writeFileSync(join(testDir, 'pnpm-lock.yaml'), '');
      writeFileSync(join(testDir, 'bun.lock'), '');
      const result = detectPackageManager(testDir);
      expect(result?.manager).toBe('pnpm');
    });

    test('prioritizes bun over npm', () => {
      cleanupTestFiles();
      writeFileSync(join(testDir, 'bun.lock'), '');
      writeFileSync(join(testDir, 'package-lock.json'), '');
      const result = detectPackageManager(testDir);
      expect(result?.manager).toBe('bun');
    });

    test('returns null when no lockfile exists', () => {
      cleanupTestFiles();
      const result = detectPackageManager(testDir);
      expect(result).toBeNull();
    });

    test('defaults to current working directory', () => {
      // This test assumes we're in a project with a lockfile
      // We'll just verify it doesn't throw
      expect(() => detectPackageManager()).not.toThrow();
    });
  });

  describe('getOutdatedCommand', () => {
    test('returns correct command for npm', () => {
      expect(getOutdatedCommand('npm')).toBe('npm outdated --json');
    });

    test('returns correct command for pnpm', () => {
      expect(getOutdatedCommand('pnpm')).toBe('pnpm outdated --json');
    });

    test('returns correct command for bun', () => {
      expect(getOutdatedCommand('bun')).toBe('bun outdated --json');
    });
  });
});
