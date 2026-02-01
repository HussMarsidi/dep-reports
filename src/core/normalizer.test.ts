import { describe, test, expect } from 'bun:test';
import { normalizeOutdatedOutput } from './normalizer.js';
import type { RawOutdatedOutput } from '../types/index.js';

describe('normalizer', () => {
  test('normalizes npm-style output', () => {
    const raw: RawOutdatedOutput = {
      'package-a': {
        current: '1.0.0',
        wanted: '1.0.0',
        latest: '2.0.0',
        type: 'dependencies',
      },
      'package-b': {
        current: '1.0.0',
        wanted: '1.1.0',
        latest: '1.1.0',
        type: 'devDependencies',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: 'package-a',
      current: '1.0.0',
      wanted: '1.0.0',
      latest: '2.0.0',
      type: 'dependencies',
    });
    expect(result[1]).toEqual({
      name: 'package-b',
      current: '1.0.0',
      wanted: '1.1.0',
      latest: '1.1.0',
      type: 'devDependencies',
    });
  });

  test('handles pnpm-style output with installed field', () => {
    const raw: RawOutdatedOutput = {
      'package-a': {
        installed: '1.0.0',
        wanted: '1.0.0',
        latest: '2.0.0',
        dependencyType: 'dependencies',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].current).toBe('1.0.0');
    expect(result[0].type).toBe('dependencies');
  });

  test('handles bun-style array output', () => {
    const raw: RawOutdatedOutput = [
      {
        name: '@clack/prompts',
        current: '0.9.1',
        update: '1.0.0',
        latest: '1.0.0',
        type: 'dependencies',
      },
    ];

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      name: '@clack/prompts',
      current: '0.9.1',
      wanted: '1.0.0',
      latest: '1.0.0',
      type: 'dependencies',
    });
  });

  test('handles bun-style wrapped output', () => {
    const raw: RawOutdatedOutput = {
      packages: [
        {
          name: 'commander',
          current: '12.1.0',
          update: '14.0.3',
          latest: '14.0.3',
          type: 'dependencies',
        },
      ],
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('commander');
    expect(result[0].latest).toBe('14.0.3');
  });

  test('handles version field as fallback', () => {
    const raw: RawOutdatedOutput = {
      'package-a': {
        version: '1.0.0',
        latest: '2.0.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].current).toBe('1.0.0');
  });

  test('uses wanted as fallback for latest', () => {
    const raw: RawOutdatedOutput = {
      'package-a': {
        current: '1.0.0',
        wanted: '1.1.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].latest).toBe('1.1.0');
  });

  test('uses current as fallback for wanted', () => {
    const raw: RawOutdatedOutput = {
      'package-a': {
        current: '1.0.0',
        latest: '2.0.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].wanted).toBe('1.0.0');
  });

  test('infers devDependencies for @types packages', () => {
    const raw: RawOutdatedOutput = {
      '@types/node': {
        current: '1.0.0',
        latest: '2.0.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('devDependencies');
  });

  test('infers devDependencies for typescript', () => {
    const raw: RawOutdatedOutput = {
      typescript: {
        current: '1.0.0',
        latest: '2.0.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('devDependencies');
  });

  test('infers devDependencies for eslint packages', () => {
    const raw: RawOutdatedOutput = {
      'eslint': {
        current: '1.0.0',
        latest: '2.0.0',
      },
      'eslint-config-prettier': {
        current: '1.0.0',
        latest: '2.0.0',
      },
      '@eslint/js': {
        current: '1.0.0',
        latest: '2.0.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(3);
    expect(result[0].type).toBe('devDependencies');
    expect(result[1].type).toBe('devDependencies');
    expect(result[2].type).toBe('devDependencies');
  });

  test('defaults to dependencies for unknown packages', () => {
    const raw: RawOutdatedOutput = {
      'some-package': {
        current: '1.0.0',
        latest: '2.0.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('dependencies');
  });

  test('skips non-object entries', () => {
    const raw: RawOutdatedOutput = {
      'package-a': {
        current: '1.0.0',
        latest: '2.0.0',
      },
      'metadata': 'some string',
      'array': [1, 2, 3],
      'null': null,
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('package-a');
  });

  test('skips entries without package name', () => {
    const raw: RawOutdatedOutput = {
      '': {
        current: '1.0.0',
        latest: '2.0.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(0);
  });

    test('uses current as fallback for latest when latest is missing', () => {
      const raw: RawOutdatedOutput = {
        'package-a': {
          current: '1.0.0',
          // latest is missing
        },
      };

      const result = normalizeOutdatedOutput(raw);
      // The normalizer uses current as fallback for latest
      expect(result).toHaveLength(1);
      expect(result[0].latest).toBe('1.0.0');
    });

  test('handles missing current version with dash', () => {
    const raw: RawOutdatedOutput = {
      'package-a': {
        current: '-',
        latest: '1.0.0',
      },
    };

    const result = normalizeOutdatedOutput(raw);
    expect(result).toHaveLength(1);
    expect(result[0].current).toBe('-');
  });
});
