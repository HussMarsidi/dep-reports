import { z } from 'zod';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Config = {
  staleThreshold: '18 months',
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
  comparison: {
    enabled: true,
    formats: {
      markdown: true,
      html: true,
    },
  },
};

/**
 * Configuration schema with Zod validation
 */
const ConfigSchema = z.object({
  staleThreshold: z.string().default(DEFAULT_CONFIG.staleThreshold),
  ignorePatterns: z.array(z.string()).default(DEFAULT_CONFIG.ignorePatterns),
  formats: z.object({
    markdown: z.boolean().default(DEFAULT_CONFIG.formats.markdown),
    html: z.boolean().default(DEFAULT_CONFIG.formats.html),
  }).default(DEFAULT_CONFIG.formats),
  concurrency: z.number().int().positive().default(DEFAULT_CONFIG.concurrency),
  failConditions: z.object({
    stale: z.boolean().default(DEFAULT_CONFIG.failConditions.stale),
    major: z.boolean().default(DEFAULT_CONFIG.failConditions.major),
  }).default(DEFAULT_CONFIG.failConditions),
  reportEmptyState: z.boolean().default(DEFAULT_CONFIG.reportEmptyState),
  comparison: z.object({
    enabled: z.boolean().default(DEFAULT_CONFIG.comparison.enabled),
    formats: z.object({
      markdown: z.boolean().default(DEFAULT_CONFIG.comparison.formats.markdown),
      html: z.boolean().default(DEFAULT_CONFIG.comparison.formats.html),
    }).default(DEFAULT_CONFIG.comparison.formats),
  }).default(DEFAULT_CONFIG.comparison),
}).passthrough(); // Allow extra fields for future extensibility

/**
 * Configuration interface
 */
export interface Config {
  staleThreshold: string;            // e.g., "18 months"
  ignorePatterns: string[];          // Glob patterns
  formats: {
    markdown: boolean;
    html: boolean;
  };
  concurrency: number;               // Registry API batch size
  failConditions: {
    stale: boolean;
    major: boolean;
  };
  reportEmptyState: boolean;         // Create files even if all up-to-date
  comparison: {
    enabled: boolean;                // Generate comparison report files by default
    formats: {
      markdown: boolean;
      html: boolean;
    };
  };
}

/**
 * Validates and parses a config object
 */
export function validateConfig(data: unknown): Config {
  try {
    return ConfigSchema.parse(data) as Config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Invalid config: ${errors}`);
    }
    throw error;
  }
}
