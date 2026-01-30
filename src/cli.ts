#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { detectPackageManager } from './core/detector.js';
import { scanOutdated } from './core/scanner.js';
import { normalizeOutdatedOutput } from './core/normalizer.js';
import { enrichPackages } from './core/enricher.js';
import { analyzePackages } from './core/analyzer.js';
import { generateMarkdownReport } from './reports/markdown.js';
import { ensureNodeModules } from './utils/fs.js';
import { logger } from './utils/logger.js';
import { format } from 'date-fns';
import { loadConfig } from './config/loader.js';
import { parseDurationToDays } from './utils/time.js';
import { loadNotes } from './notes/loader.js';
import { mergeNotes } from './notes/merger.js';
import { filterPackages } from './utils/filter.js';
import { initCommand } from './commands/init.js';

const program = new Command();
const packageJsonPath = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
const packageVersion = packageJson.version ?? '0.0.0';

program
  .name('dep-report')
  .description('Zero-config CLI tool that generates version-controlled snapshots of dependency risk')
  .version(packageVersion);

// Init command
program
  .command('init')
  .description('Scaffold .dep-report/ directory structure')
  .option('--include-config', 'Force overwrite config.json even if it exists')
  .action(async (options) => {
    try {
      await initCommand(process.cwd(), options.includeConfig);
      process.exit(0);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Default command (audit)
program
  .action(async () => {
    try {
      const cwd = process.cwd();
      
      // Load configuration (Phase 2)
      const config = loadConfig(cwd);
      
      // Preflight checks
      logger.info('Checking prerequisites...');
      await ensureNodeModules(cwd);

      // Detect package manager
      logger.info('Detecting package manager...');
      const detection = detectPackageManager(cwd);
      if (!detection) {
        logger.error('No package manager detected. Please ensure you have package-lock.json, pnpm-lock.yaml, bun.lock, or bun.lockb in your project.');
        process.exit(1);
      }
      logger.success(`Detected: ${detection.manager}`);

      // Scan outdated packages
      logger.info('Scanning for outdated packages...');
      const rawOutput = await scanOutdated(detection.manager, cwd);
      
      if (Object.keys(rawOutput).length === 0) {
        logger.success('No outdated packages found!');
        
        // Handle empty state based on config
        if (config.reportEmptyState) {
          const report = generateMarkdownReport([]);
          const reportsDir = join(cwd, '.dep-report', 'reports');
          if (!existsSync(reportsDir)) {
            mkdirSync(reportsDir, { recursive: true });
          }
          const dateStr = format(new Date(), 'yyyy-MM-dd');
          writeFileSync(join(reportsDir, `${dateStr}_outdated.md`), report);
          writeFileSync(join(reportsDir, 'latest.md'), report);
          logger.success(`Report generated: .dep-report/reports/${dateStr}_outdated.md`);
        }
        process.exit(0);
      }

      // Normalize output
      logger.info(`Found ${Object.keys(rawOutput).length} outdated packages`);
      const normalized = normalizeOutdatedOutput(rawOutput);

      // Enrich with registry data (using config concurrency)
      logger.info('Enriching packages with registry metadata...');
      const enriched = await enrichPackages(normalized, config.concurrency);
      logger.success('Enrichment complete');

      // Parse stale threshold from config (Phase 2)
      const staleThresholdDays = parseDurationToDays(config.staleThreshold);
      
      // Analyze (calculate risk and stale status)
      let analyzed = analyzePackages(enriched, staleThresholdDays);

      // Apply ignore patterns (Phase 2)
      const beforeFilter = analyzed.length;
      analyzed = filterPackages(analyzed, config.ignorePatterns);
      if (beforeFilter > analyzed.length) {
        logger.info(`Filtered out ${beforeFilter - analyzed.length} packages based on ignorePatterns`);
      }

      // Merge notes (Phase 2)
      const notes = loadNotes(cwd);
      analyzed = mergeNotes(analyzed, notes);

      // Generate reports (only if config says so)
      if (config.formats.markdown || config.formats.html) {
        logger.info('Generating reports...');
        
        // Ensure reports directory exists
        const reportsDir = join(cwd, '.dep-report', 'reports');
        if (!existsSync(reportsDir)) {
          mkdirSync(reportsDir, { recursive: true });
        }

        const dateStr = format(new Date(), 'yyyy-MM-dd');

        // Generate markdown report
        if (config.formats.markdown) {
          const report = generateMarkdownReport(analyzed);
          writeFileSync(join(reportsDir, `${dateStr}_outdated.md`), report);
          writeFileSync(join(reportsDir, 'latest.md'), report);
          logger.success(`Report generated: .dep-report/reports/${dateStr}_outdated.md`);
          logger.success(`Latest report: .dep-report/reports/latest.md`);
        }

        // HTML report will be added in Phase 4
        if (config.formats.html) {
          logger.warn('HTML format not yet implemented (Phase 4)');
        }
      }

      // Check exit conditions (Phase 2)
      let shouldFail = false;
      if (config.failConditions.stale) {
        const hasStale = analyzed.some(pkg => pkg.isStale);
        if (hasStale) {
          logger.error('Found stale packages (--fail-if-stale)');
          shouldFail = true;
        }
      }
      if (config.failConditions.major) {
        const hasMajor = analyzed.some(pkg => pkg.risk === 'Major');
        if (hasMajor) {
          logger.error('Found major version updates (--fail-if-major)');
          shouldFail = true;
        }
      }

      process.exit(shouldFail ? 1 : 0);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
