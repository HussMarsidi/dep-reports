import type { OutdatedPackage, RawOutdatedOutput } from '../types/index.js';

/**
 * Normalizes different package manager outputs into a unified schema
 */
export function normalizeOutdatedOutput(
  rawOutput: RawOutdatedOutput
): OutdatedPackage[] {
  const packages: OutdatedPackage[] = [];

  // bun can return an array or a { packages: [] } wrapper
  const bunLikeList =
    Array.isArray(rawOutput) ? rawOutput : Array.isArray(rawOutput.packages) ? rawOutput.packages : null;

  if (bunLikeList) {
    for (const item of bunLikeList) {
      if (!item || typeof item !== 'object') {
        continue;
      }

      const name = item.name || item.package || item.pkg;
      const current = item.current || item.installed || item.version || '-';
      const latest = item.latest || item.update || item.wanted || current;
      const wanted = item.wanted || item.update || item.current || latest;
      const type = item.type || item.dependencyType || item.kind || inferDependencyType(String(name));

      if (!name || !latest) {
        continue;
      }

      packages.push({
        name: String(name),
        current: String(current),
        wanted: String(wanted),
        latest: String(latest),
        type: type as OutdatedPackage['type'],
      });
    }
    return packages;
  }

  // npm and pnpm have similar structure: { "package-name": { current, wanted, latest, type } }
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
