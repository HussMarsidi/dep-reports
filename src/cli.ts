#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
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

const program = new Command();

program
  .name('dep-report')
  .description('Zero-config CLI tool that generates version-controlled snapshots of dependency risk')
  .version('1.0.0');

// Default command (audit)
program
  .action(async () => {
    try {
      const cwd = process.cwd();
      
      // Preflight checks
      logger.info('Checking prerequisites...');
      await ensureNodeModules(cwd);

      // Detect package manager
      logger.info('Detecting package manager...');
      const detection = detectPackageManager(cwd);
      if (!detection) {
        logger.error('No package manager detected. Please ensure you have package-lock.json, pnpm-lock.yaml, or bun.lockb in your project.');
        process.exit(1);
      }
      logger.success(`Detected: ${detection.manager}`);

      // Scan outdated packages
      logger.info('Scanning for outdated packages...');
      const rawOutput = await scanOutdated(detection.manager, cwd);
      
      if (Object.keys(rawOutput).length === 0) {
        logger.success('No outdated packages found!');
        // Still generate a report for audit trail
        const report = generateMarkdownReport([]);
        const reportsDir = join(cwd, '.dep-report', 'reports');
        if (!existsSync(reportsDir)) {
          mkdirSync(reportsDir, { recursive: true });
        }
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        writeFileSync(join(reportsDir, `${dateStr}_outdated.md`), report);
        writeFileSync(join(reportsDir, 'latest.md'), report);
        logger.success(`Report generated: .dep-report/reports/${dateStr}_outdated.md`);
        process.exit(0);
      }

      // Normalize output
      logger.info(`Found ${Object.keys(rawOutput).length} outdated packages`);
      const normalized = normalizeOutdatedOutput(rawOutput, detection.manager);

      // Enrich with registry data
      logger.info('Enriching packages with registry metadata...');
      const enriched = await enrichPackages(normalized, 5);
      logger.success('Enrichment complete');

      // Analyze (calculate risk and stale status)
      // For Phase 1, we'll use a default threshold of 18 months (548 days)
      const staleThresholdDays = 548;
      const analyzed = analyzePackages(enriched, staleThresholdDays);

      // Generate reports
      logger.info('Generating reports...');
      const report = generateMarkdownReport(analyzed);
      
      // Ensure reports directory exists
      const reportsDir = join(cwd, '.dep-report', 'reports');
      if (!existsSync(reportsDir)) {
        mkdirSync(reportsDir, { recursive: true });
      }

      // Write reports
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      writeFileSync(join(reportsDir, `${dateStr}_outdated.md`), report);
      writeFileSync(join(reportsDir, 'latest.md'), report);
      
      logger.success(`Report generated: .dep-report/reports/${dateStr}_outdated.md`);
      logger.success(`Latest report: .dep-report/reports/latest.md`);
      
      process.exit(0);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
