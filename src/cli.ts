#!/usr/bin/env node

import { Command } from 'commander';
import { format } from 'date-fns';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { compareCommand } from './commands/compare.js';
import { initCommand } from './commands/init.js';
import { loadConfig } from './config/loader.js';
import type { PresetName } from './config/presets.js';
import { analyzePackages } from './core/analyzer.js';
import { detectPackageManager } from './core/detector.js';
import { enrichPackages } from './core/enricher.js';
import { normalizeOutdatedOutput } from './core/normalizer.js';
import { scanOutdated } from './core/scanner.js';
import { loadNotes } from './notes/loader.js';
import { mergeNotes } from './notes/merger.js';
import { generateHtmlReport } from './reports/html.js';
import { generateMarkdownReport } from './reports/markdown.js';
import { calculatePriorityScore, calculateSummary, formatNoteWithBadge, isStable } from './reports/summary.js';
import { filterPackages } from './utils/filter.js';
import { ensureNodeModules, ensureWriteAccess } from './utils/fs.js';
import { logger } from './utils/logger.js';
import { checkRegistryConnectivity } from './utils/network.js';
import { countTotalDependencies } from './utils/package-count.js';
import { parseDurationToDays } from './utils/time.js';

const program = new Command();
const packageJsonPath = new URL('../package.json', import.meta.url);
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { version?: string };
const packageVersion = packageJson.version ?? '0.0.0';

program
  .name('dep-report')
  .description('Generate dependency risk reports')
  .version(packageVersion)
  .addHelpText('before', `
dep-report - Generate dependency risk reports

USAGE
  dep-report [options]

DESCRIPTION
  Scans for outdated packages and generates a daily risk brief 
  showing age, staleness, and major upgrades. Reports are 
  version-controlled in .dep-report/reports/

QUICK START
  dep-report              # Run audit, generate reports
  dep-report init         # Create config files
`)
  .addHelpText('after', `
EXAMPLES
  dep-report                           # Daily audit
  dep-report init                      # Initialize configuration

LEARN MORE
  https://github.com/hussmarsidi/dep-reports
`);

// Init command
program
  .command('init')
  .description('Scaffold .dep-report/ directory structure')
  .option('--include-config', 'Force overwrite config.json even if it exists')
  .option('--preset <preset>', 'Use a preset configuration (starter|production|strict)', 'production')
  .action(async (options) => {
    try {
      const { isValidPresetName } = await import('./config/presets.js');
      let preset: PresetName | undefined;
      
      if (options.preset) {
        if (!isValidPresetName(options.preset)) {
          logger.error(`Invalid preset: ${options.preset}. Valid options: starter, production, strict`);
          process.exit(1);
        }
        preset = options.preset as PresetName;
      }
      
      await initCommand(process.cwd(), options.includeConfig, preset);
      process.exit(0);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Compare command
program
  .command('compare')
  .description('Compare two dependency reports to track health over time')
  .argument('<from>', 'Start date (YYYY-MM-DD), "latest", or "last-month"')
  .argument('<to>', 'End date (YYYY-MM-DD) or "latest"')
  .action(async (from, to) => {
    try {
      await compareCommand(from, to);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Default command (audit)
program
  .option('--dry-run [level]', 'Preview summary without writing files (summary|actions|full)')
  .action(async (options) => {
    try {
      const cwd = process.cwd();
      
      // Load configuration (Phase 2)
      const config = loadConfig(cwd);
      
      // Preflight checks
      logger.info('Checking prerequisites...');
      
      // Detect package manager first (before checking node_modules)
      logger.info('Detecting package manager...');
      const detection = detectPackageManager(cwd);
      if (!detection) {
        logger.error('No package manager detected. Please ensure you have package-lock.json, pnpm-lock.yaml, bun.lock, or bun.lockb in your project.');
        process.exit(1);
      }
      logger.success(`Detected: ${detection.manager}`);
      
      // Check for node_modules (warn if lockfile exists but node_modules missing)
      await ensureNodeModules(cwd, !!detection, logger.warn);
      
      // Ensure write access to .dep-report directory
      const depReportDir = join(cwd, '.dep-report');
      await ensureWriteAccess(depReportDir);

      // Scan outdated packages
      logger.info('Scanning for outdated packages...');
      const rawOutput = await scanOutdated(detection.manager, cwd);
      
      if (Object.keys(rawOutput).length === 0) {
        logger.success('No outdated packages found!');
        
        // Handle empty state based on config
        if (config.reportEmptyState) {
          const reportsDir = join(cwd, '.dep-report', 'reports');
          if (!existsSync(reportsDir)) {
            mkdirSync(reportsDir, { recursive: true });
          }
          const dateStr = format(new Date(), 'yyyy-MM-dd');
          
          const totalDependencies = countTotalDependencies(cwd);
          
          if (config.formats.markdown) {
            const report = generateMarkdownReport([], new Date(), totalDependencies);
            writeFileSync(join(reportsDir, `${dateStr}_outdated.md`), report);
            writeFileSync(join(reportsDir, 'latest.md'), report);
            logger.success(`Report generated: .dep-report/reports/${dateStr}_outdated.md`);
          }
          
          if (config.formats.html) {
            const htmlReport = generateHtmlReport([], new Date(), totalDependencies);
            writeFileSync(join(reportsDir, `${dateStr}_outdated.html`), htmlReport);
            writeFileSync(join(reportsDir, 'latest.html'), htmlReport);
            logger.success(`HTML report generated: .dep-report/reports/${dateStr}_outdated.html`);
          }
        }
        process.exit(0);
      }

      // Normalize output
      logger.info(`Found ${Object.keys(rawOutput).length} outdated packages`);
      const normalized = normalizeOutdatedOutput(rawOutput);

      // Check registry connectivity before enrichment
      logger.startSpinner('Checking registry connectivity...');
      const isRegistryReachable = await checkRegistryConnectivity();
      logger.stopSpinner();
      if (!isRegistryReachable) {
        logger.error('Unable to reach the npm registry.');
        logger.info('If you have a cache, try running with --refresh.');
        process.exit(1);
      }
      logger.success('Registry connectivity confirmed');

      // Enrich with registry data (using config concurrency)
      logger.startSpinner(`Enriching ${normalized.length} packages with registry metadata...`);
      const enriched = await enrichPackages(normalized, config.concurrency);
      logger.stopSpinner();
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

      // Handle dry-run mode
      if (options.dryRun) {
        const totalDependencies = countTotalDependencies(cwd);
        const summary = calculateSummary(analyzed, totalDependencies);
        const dryRunLevel = typeof options.dryRun === 'string' ? options.dryRun : 'actions';
        
        console.log('\nDry Run Summary');
        console.log('────────────────');
        console.log(`Status: ${summary.riskStatusEmoji} ${summary.riskStatusText}\n`);
        
        console.log(`Total dependencies: ${summary.total}`);
        console.log(`Outdated: ${summary.outdated} (${summary.major} major, ${summary.minor} minor, ${summary.patch} patch)`);
        console.log(`Stale (>12 months): ${summary.stale}\n`);
        
        if (dryRunLevel === 'actions' || dryRunLevel === 'full') {
          const actionRequired = analyzed
            .map(pkg => ({ pkg, score: calculatePriorityScore(pkg) }))
            .filter(({ score }) => score > 15)
            .sort((a, b) => b.score - a.score)
            .slice(0, 7)
            .map(({ pkg }) => pkg);
          
          if (actionRequired.length > 0) {
            console.log('Action Required:');
            for (const pkg of actionRequired) {
              const ageStr = pkg.age !== null ? `${pkg.age}d` : 'Unknown';
              const behindStr = pkg.behindByDays !== null ? `${pkg.behindByDays}d` : '—';
              const noteBadge = pkg.note ? formatNoteWithBadge(pkg.note) : '';
              const riskEmoji = pkg.risk === 'Major' ? '🔴' : pkg.risk === 'Minor' ? '🟡' : '🟢';
              console.log(`  ${riskEmoji} ${pkg.name} (${ageStr}, behind by ${behindStr}) - ${pkg.risk} ${pkg.current} → ${pkg.latest}${noteBadge ? `, ${noteBadge}` : ''}`);
            }
            console.log('');
          }
        }
        
        if (dryRunLevel === 'full') {
          console.log('Full Dependency List:');
          for (const pkg of analyzed) {
            const ageStr = pkg.age !== null ? `${pkg.age}d` : 'Unknown';
            const behindStr = pkg.behindByDays !== null ? `${pkg.behindByDays}d` : '—';
            const status = isStable(pkg) ? '✅ Stable' : 'Outdated';
            console.log(`  ${pkg.name}: ${pkg.current} → ${pkg.latest} (${ageStr}, ${behindStr}, ${pkg.risk}, ${status})`);
          }
          console.log('');
        }
        
        console.log('[No files written]\n');
        
        // Still check exit conditions
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
      }

      // Generate reports (only if config says so)
      if (config.formats.markdown || config.formats.html) {
        logger.info('Generating reports...');
        
        // Ensure reports directory exists
        const reportsDir = join(cwd, '.dep-report', 'reports');
        if (!existsSync(reportsDir)) {
          mkdirSync(reportsDir, { recursive: true });
        }

        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const totalDependencies = countTotalDependencies(cwd);

        // Generate markdown report
        if (config.formats.markdown) {
          const report = generateMarkdownReport(analyzed, new Date(), totalDependencies);
          writeFileSync(join(reportsDir, `${dateStr}_outdated.md`), report);
          writeFileSync(join(reportsDir, 'latest.md'), report);
          logger.success(`Report generated: .dep-report/reports/${dateStr}_outdated.md`);
          logger.success(`Latest report: .dep-report/reports/latest.md`);
        }

        // Generate HTML report
        if (config.formats.html) {
          const htmlReport = generateHtmlReport(analyzed, new Date(), totalDependencies);
          writeFileSync(join(reportsDir, `${dateStr}_outdated.html`), htmlReport);
          writeFileSync(join(reportsDir, 'latest.html'), htmlReport);
          logger.success(`HTML report generated: .dep-report/reports/${dateStr}_outdated.html`);
          logger.success(`Latest HTML report: .dep-report/reports/latest.html`);
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
