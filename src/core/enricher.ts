import type { EnrichedPackage, OutdatedPackage, RegistryResponse } from '../types/index.js';

// Registry abstraction (inline)
export interface IPackageRegistry {
  getMetadata(packageName: string): Promise<RegistryResponse | null>;
}

// Default implementation
class NpmRegistryImpl implements IPackageRegistry {
  constructor(private baseUrl: string = 'https://registry.npmjs.org') {}
  
  async getMetadata(packageName: string): Promise<RegistryResponse | null> {
    try {
      const url = `${this.baseUrl}/${encodeURIComponent(packageName)}`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Registry request failed: ${response.status}`);
      }
      
      return await response.json() as RegistryResponse;
    } catch (error) {
      return null;
    }
  }
}

// Export for testing
export class MockRegistry implements IPackageRegistry {
  constructor(private data: Record<string, RegistryResponse>) {}
  
  async getMetadata(packageName: string): Promise<RegistryResponse | null> {
    return this.data[packageName] || null;
  }
}

// Default instance
const defaultRegistry: IPackageRegistry = new NpmRegistryImpl();

/**
 * Enriches a single package with registry metadata
 */
export async function enrichPackage(
  pkg: OutdatedPackage,
  registryOrUrl: string | IPackageRegistry = defaultRegistry,
  now: Date = new Date()
): Promise<EnrichedPackage> {
  // Handle backwards compatibility
  const registry = typeof registryOrUrl === 'string' 
    ? new NpmRegistryImpl(registryOrUrl)
    : registryOrUrl;
    
  const metadata = await registry.getMetadata(pkg.name);

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
    const ageInMs = now.getTime() - currentPublishedAt.getTime();
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
  registryOrUrl: string | IPackageRegistry = defaultRegistry,
  now: Date = new Date()
): Promise<EnrichedPackage[]> {
  // Handle backwards compatibility
  const registry = typeof registryOrUrl === 'string' 
    ? new NpmRegistryImpl(registryOrUrl)
    : registryOrUrl;
    
  const results: EnrichedPackage[] = [];
  
  // Process in batches
  for (let i = 0; i < packages.length; i += concurrency) {
    const batch = packages.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(pkg => enrichPackage(pkg, registry, now))
    );
    results.push(...batchResults);

    // Rate limiting: wait 500ms between batches (except for the last batch)
    if (i + concurrency < packages.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}
