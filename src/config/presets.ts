import type { Config } from './schema.js';

export type PresetName = 'starter' | 'production' | 'strict';

export interface Preset {
  name: PresetName;
  displayName: string;
  description: string;
  config: Config;
}

/**
 * Preset definitions
 */
export const PRESETS: Record<PresetName, Preset> = {
  starter: {
    name: 'starter',
    displayName: 'Starter',
    description: 'Just getting visibility - no CI failures',
    config: {
      staleThreshold: '24 months',
      ignorePatterns: [],
      formats: {
        markdown: true,
        html: true,
      },
      concurrency: 5,
      failConditions: {
        stale: false,
        major: false,
      },
      reportEmptyState: true,
    },
  },
  production: {
    name: 'production',
    displayName: 'Production',
    description: 'Prevent major upgrades from rotting indefinitely (recommended)',
    config: {
      staleThreshold: '12 months',
      ignorePatterns: [],
      formats: {
        markdown: true,
        html: true,
      },
      concurrency: 5,
      failConditions: {
        stale: false,
        major: true,
      },
      reportEmptyState: true,
    },
  },
  strict: {
    name: 'strict',
    displayName: 'Strict',
    description: 'Old dependencies break builds',
    config: {
      staleThreshold: '6 months',
      ignorePatterns: [],
      formats: {
        markdown: true,
        html: true,
      },
      concurrency: 5,
      failConditions: {
        stale: true,
        major: true,
      },
      reportEmptyState: true,
    },
  },
};

/**
 * Gets a preset by name
 */
export function getPreset(name: PresetName): Preset {
  return PRESETS[name];
}

/**
 * Lists all available presets
 */
export function listPresets(): Preset[] {
  return Object.values(PRESETS);
}

/**
 * Validates if a string is a valid preset name
 */
export function isValidPresetName(name: string): name is PresetName {
  return name in PRESETS;
}
