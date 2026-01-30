import type { OutdatedPackage, EnrichedPackage, RegistryResponse } from '../types/index.js';

/**
 * Fetches package metadata from npm registry
 */
async function fetchPackageMetadata(packageName: string, registry: string = 'https://registry.npmjs.org'): Promise<RegistryResponse | null> {
  try {
    const url = `${registry}/${encodeURIComponent(packageName)}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Package not found
      }
      throw new Error(`Registry request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as RegistryResponse;
  } catch (error) {
    // Network errors, timeouts, etc.
    return null;
  }
}

/**
 * Enriches a single package with registry metadata
 */
export async function enrichPackage(
  pkg: OutdatedPackage,
  registry: string = 'https://registry.npmjs.org'
): Promise<EnrichedPackage> {
  const metadata = await fetchPackageMetadata(pkg.name, registry);

  if (!metadata || !metadata.time) {
    return {
      ...pkg,
      currentPublishedAt: null,
      latestPublishedAt: null,
      age: null,
      isStale: false, // Will be calculated later based on threshold
      risk: 'Exotic', // Can't determine without metadata
    };
  }

  const currentPublishedAt = metadata.time[pkg.current] ? new Date(metadata.time[pkg.current]) : null;
  const latestPublishedAt = metadata.time[pkg.latest] ? new Date(metadata.time[pkg.latest]) : null;

  // Calculate age in days since current version was published
  let age: number | null = null;
  if (currentPublishedAt) {
    const ageInMs = Date.now() - currentPublishedAt.getTime();
    age = Math.floor(ageInMs / (1000 * 60 * 60 * 24)); // Convert to days
  }

  return {
    ...pkg,
    currentPublishedAt,
    latestPublishedAt,
    age,
    isStale: false, // Will be set by analyzer based on threshold
    risk: 'Exotic', // Will be calculated by analyzer
  };
}

/**
 * Enriches multiple packages with rate limiting
 */
export async function enrichPackages(
  packages: OutdatedPackage[],
  concurrency: number = 5,
  registry: string = 'https://registry.npmjs.org'
): Promise<EnrichedPackage[]> {
  const results: EnrichedPackage[] = [];
  
  // Process in batches
  for (let i = 0; i < packages.length; i += concurrency) {
    const batch = packages.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(pkg => enrichPackage(pkg, registry))
    );
    results.push(...batchResults);

    // Rate limiting: wait 500ms between batches (except for the last batch)
    if (i + concurrency < packages.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}
