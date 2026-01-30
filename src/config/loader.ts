import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_CONFIG, validateConfig, type Config } from './schema.js';
import { parseJSON } from '../utils/fs.js';
import { logger } from '../utils/logger.js';

/**
 * Loads and merges configuration from .dep-report/config.json
 * Returns default config if file doesn't exist
 */
export function loadConfig(cwd: string = process.cwd()): Config {
  const configPath = join(cwd, '.dep-report', 'config.json');

  // If config file doesn't exist, return defaults
  if (!existsSync(configPath)) {
    logger.info('No config.json found, using defaults');
    return DEFAULT_CONFIG;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    const userConfig = parseJSON<Partial<Config>>(content, configPath);
    
    // Merge with defaults (user config overrides defaults)
    const merged: Config = {
      staleThreshold: userConfig.staleThreshold ?? DEFAULT_CONFIG.staleThreshold,
      ignorePatterns: userConfig.ignorePatterns ?? DEFAULT_CONFIG.ignorePatterns,
      formats: {
        markdown: userConfig.formats?.markdown ?? DEFAULT_CONFIG.formats.markdown,
        html: userConfig.formats?.html ?? DEFAULT_CONFIG.formats.html,
      },
      concurrency: userConfig.concurrency ?? DEFAULT_CONFIG.concurrency,
      failConditions: {
        stale: userConfig.failConditions?.stale ?? DEFAULT_CONFIG.failConditions.stale,
        major: userConfig.failConditions?.major ?? DEFAULT_CONFIG.failConditions.major,
      },
      reportEmptyState: userConfig.reportEmptyState ?? DEFAULT_CONFIG.reportEmptyState,
    };

    // Validate the merged config
    const validated = validateConfig(merged);
    logger.info('Loaded config from .dep-report/config.json');
    return validated;
  } catch (error) {
    logger.warn(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`);
    logger.warn('Using default configuration');
    return DEFAULT_CONFIG;
  }
}
