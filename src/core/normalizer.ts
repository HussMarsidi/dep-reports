import type { OutdatedPackage, RawOutdatedOutput } from '../types/index.js';

/**
 * Normalizes different package manager outputs into a unified schema
 */
export function normalizeOutdatedOutput(
  rawOutput: RawOutdatedOutput
): OutdatedPackage[] {
  const packages: OutdatedPackage[] = [];

  // npm and pnpm have similar structure: { "package-name": { current, wanted, latest, type } }
  // bun might differ, but we'll handle it similarly
  for (const [packageName, data] of Object.entries(rawOutput)) {
    // Skip if it's not an object (some managers add metadata)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      continue;
    }

    // Extract fields (handling variations)
    const current = data.current || data.installed || data.version || '-';
    const latest = data.latest || data.wanted || current;
    const wanted = data.wanted || data.current || latest;
    const type = data.type || data.dependencyType || inferDependencyType(packageName);

    // Skip if essential fields are missing
    if (!packageName || !latest) {
      continue;
    }

    packages.push({
      name: packageName,
      current: String(current),
      wanted: String(wanted),
      latest: String(latest),
      type: type as OutdatedPackage['type'],
    });
  }

  return packages;
}

/**
 * Infers dependency type from package name patterns
 * This is a fallback when type is not provided
 */
function inferDependencyType(packageName: string): OutdatedPackage['type'] {
  // Common dev dependency patterns
  if (
    packageName.startsWith('@types/') ||
    packageName.includes('-test') ||
    packageName.includes('-spec') ||
    packageName === 'typescript' ||
    packageName === 'eslint' ||
    packageName.startsWith('eslint-') ||
    packageName.startsWith('@eslint/')
  ) {
    return 'devDependencies';
  }

  // Default to dependencies
  return 'dependencies';
}
