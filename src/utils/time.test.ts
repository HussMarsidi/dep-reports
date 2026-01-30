import { describe, test, expect } from 'bun:test';
import { parseDuration, parseDurationToDays } from './time.js';

describe('time', () => {
  describe('parseDuration', () => {
    test('parses days correctly', () => {
      expect(parseDuration('1 day')).toBe(24 * 60 * 60 * 1000);
      expect(parseDuration('5 days')).toBe(5 * 24 * 60 * 60 * 1000);
      expect(parseDuration('90 days')).toBe(90 * 24 * 60 * 60 * 1000);
    });

    test('parses weeks correctly', () => {
      expect(parseDuration('1 week')).toBe(7 * 24 * 60 * 60 * 1000);
      expect(parseDuration('2 weeks')).toBe(2 * 7 * 24 * 60 * 60 * 1000);
    });

    test('parses months correctly', () => {
      expect(parseDuration('1 month')).toBe(30 * 24 * 60 * 60 * 1000);
      expect(parseDuration('6 months')).toBe(6 * 30 * 24 * 60 * 60 * 1000);
      expect(parseDuration('18 months')).toBe(18 * 30 * 24 * 60 * 60 * 1000);
    });

    test('parses years correctly', () => {
      expect(parseDuration('1 year')).toBe(365 * 24 * 60 * 60 * 1000);
      expect(parseDuration('2 years')).toBe(2 * 365 * 24 * 60 * 60 * 1000);
    });

    test('handles case insensitivity', () => {
      expect(parseDuration('1 DAY')).toBe(24 * 60 * 60 * 1000);
      expect(parseDuration('1 MONTH')).toBe(30 * 24 * 60 * 60 * 1000);
      expect(parseDuration('1 YEAR')).toBe(365 * 24 * 60 * 60 * 1000);
    });

    test('handles whitespace', () => {
      expect(parseDuration('  1 day  ')).toBe(24 * 60 * 60 * 1000);
      expect(parseDuration('1   day')).toBe(24 * 60 * 60 * 1000);
    });

    test('throws error for invalid format', () => {
      expect(() => parseDuration('invalid')).toThrow();
      expect(() => parseDuration('1')).toThrow();
      expect(() => parseDuration('day')).toThrow();
      expect(() => parseDuration('1 invalid')).toThrow();
    });

    test('throws error for unsupported units', () => {
      expect(() => parseDuration('1 hour')).toThrow();
      expect(() => parseDuration('1 minute')).toThrow();
    });
  });

  describe('parseDurationToDays', () => {
    test('converts days to days', () => {
      expect(parseDurationToDays('1 day')).toBe(1);
      expect(parseDurationToDays('90 days')).toBe(90);
    });

    test('converts weeks to days', () => {
      expect(parseDurationToDays('1 week')).toBe(7);
      expect(parseDurationToDays('2 weeks')).toBe(14);
    });

    test('converts months to days', () => {
      expect(parseDurationToDays('1 month')).toBe(30);
      expect(parseDurationToDays('6 months')).toBe(180);
      expect(parseDurationToDays('18 months')).toBe(540);
    });

    test('converts years to days', () => {
      expect(parseDurationToDays('1 year')).toBe(365);
      expect(parseDurationToDays('2 years')).toBe(730);
    });

    test('handles fractional results correctly', () => {
      // 1 week = 7 days, should floor correctly
      expect(parseDurationToDays('1 week')).toBe(7);
    });
  });
});
