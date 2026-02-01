import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_CONFIG } from '../config/schema.js';
import { logger } from '../utils/logger.js';
import { getPreset, type PresetName } from '../config/presets.js';

/**
 * Scaffolds the .dep-report/ directory structure
 */
export async function initCommand(
  cwd: string = process.cwd(),
  includeConfig: boolean = false,
  preset?: PresetName
): Promise<void> {
  const depReportDir = join(cwd, '.dep-report');
  const configPath = join(depReportDir, 'config.json');
  const notesPath = join(depReportDir, 'notes.json');
  const reportsDir = join(depReportDir, 'reports');
  const gitignorePath = join(depReportDir, '.gitignore');

  // Create .dep-report directory
  if (!existsSync(depReportDir)) {
    mkdirSync(depReportDir, { recursive: true });
    logger.success('Created .dep-report/ directory');
  } else {
    logger.info('.dep-report/ directory already exists');
  }

  // Create reports directory
  if (!existsSync(reportsDir)) {
    mkdirSync(reportsDir, { recursive: true });
    logger.success('Created .dep-report/reports/ directory');
  }

  // Create config.json
  if (!existsSync(configPath) || includeConfig) {
    let config = DEFAULT_CONFIG;
    
    if (preset) {
      const presetConfig = getPreset(preset);
      config = presetConfig.config;
      logger.info(`Using preset: ${presetConfig.displayName} - ${presetConfig.description}`);
    }
    
    const configContent = JSON.stringify(config, null, 2);
    writeFileSync(configPath, configContent, 'utf-8');
    logger.success('Created .dep-report/config.json');
  } else {
    logger.info('config.json already exists, skipping');
  }

  // Create notes.json
  if (!existsSync(notesPath)) {
    const notesContent = JSON.stringify({}, null, 2);
    writeFileSync(notesPath, notesContent, 'utf-8');
    logger.success('Created .dep-report/notes.json');
  } else {
    logger.info('notes.json already exists, skipping');
  }

  // Create .gitignore
  if (!existsSync(gitignorePath)) {
    const gitignoreContent = `.cache.json
`;
    writeFileSync(gitignorePath, gitignoreContent, 'utf-8');
    logger.success('Created .dep-report/.gitignore');
  } else {
    logger.info('.gitignore already exists, skipping');
  }

  logger.success('Initialization complete!');
  logger.info('You can now customize .dep-report/config.json and add notes to .dep-report/notes.json');
}
