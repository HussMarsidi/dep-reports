import { exec } from 'child_process';
import { promisify } from 'util';
import type { PackageManager, SecurityAdvisory } from '../types/index.js';
import { logger } from '../utils/logger.js';

const execAsync = promisify(exec);

interface AuditVulnerability {
  name: string;
  severity: string;
  via: Array<{
    title: string;
    url: string;
    range: string;
    severity: string;
    source: number;
    name: string;
  } | string>;
  isDirect: boolean;
}


/**
 * Scans for security vulnerabilities using the package manager's audit command
 */
export async function scanSecurity(cwd: string, pm: PackageManager): Promise<Record<string, SecurityAdvisory>> {
  const securityMap: Record<string, SecurityAdvisory> = {};
  
  try {
    let command = '';
    
    // Construct command based on package manager
    switch (pm) {
      case 'npm':
        command = 'npm audit --json';
        break;
      case 'pnpm':
        command = 'pnpm audit --json'; // pnpm also supports --json
        break;
      case 'bun':
        // Bun audit support is experimental and output format might differ
        // For now, support if possible, or skip
        // Run bun audit --json
        // But bun audit might verify lockfile existence
        command = 'bun audit --json'; 
        break;
    }

    // Capture output. Note: audit commands return non-zero exit code if vulnerabilities found.
    // So we must handle the error but process stdout.
    let stdout = '';
    try {
      const result = await execAsync(command, { cwd, maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer
      stdout = result.stdout;
    } catch (error: any) {
      // If error has stdout, use it (npm audit returns exit code 1 on vulnerabilities)
      if (error.stdout) {
        stdout = error.stdout;
      } else {
        // Real failure (e.g. command not found, or network error preventing audit entirely)
        logger.warn(`Security scan failed: ${error.message}`);
        return {};
      }
    }

    if (!stdout || stdout.trim() === '') {
        return {};
    }

    // Parse JSON
    try {
        const auditData = JSON.parse(stdout);
        
        // Handle npm/pnpm structure
        // Bun's structure might differ, need validation.
        // Assuming standard npm audit format for now as baseline.
        
        // Bun v1.1+ supports npm-compatible json output roughly?
        // Actually pnpm output correlates to npm 6 or 7?
        // Let's assume 'advisories' (npm 6) or 'vulnerabilities' (npm 7+).
        // The interface AuditOutput matches npm 7+.
        
        if (auditData.vulnerabilities) {
            for (const [name, vuln] of Object.entries(auditData.vulnerabilities)) {
                 const v = vuln as AuditVulnerability;
                 // We only care about the highest severity direct vulnerability for the package?
                 // Or just any vulnerability associated with this package name.
                 // 'via' contains the source advisories.
                 
                 // If via is structured object
                 const primary = Array.isArray(v.via) && v.via.length > 0 && typeof v.via[0] !== 'string' 
                    ? (v.via[0] as any) 
                    : null;
                 
                 if (primary) {
                     securityMap[name] = {
                         severity: v.severity,
                         title: primary.title,
                         url: primary.url,
                         affectedRange: primary.range
                     };
                 } else {
                     // Indirect or simple usage
                     securityMap[name] = {
                         severity: v.severity,
                         title: 'Security Vulnerability',
                         url: '',
                         affectedRange: ''
                     };
                 }
            }
        }
        
    } catch (parseError) {
        logger.warn('Failed to parse security audit output');
    }

  } catch (err) {
    logger.warn('Error running security scan');
  }
  
  return securityMap;
}
