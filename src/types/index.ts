// Package manager types
export type PackageManager = 'npm' | 'pnpm' | 'bun';

// Unified internal schema (post-normalization)
export interface OutdatedPackage {
  name: string;
  current: string;        // Installed version
  wanted: string;         // Max version satisfying package.json
  latest: string;         // Absolute latest on registry
  type: 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
}

// Risk levels
export type Risk = 'Major' | 'Minor' | 'Patch' | 'Exotic' | 'NotInstalled';

// Enriched with registry data
export interface EnrichedPackage extends OutdatedPackage {
  currentPublishedAt: Date | null;  // When current version was published
  latestPublishedAt: Date | null;    // When latest version was published
  age: number | null;                 // Days since current was published
  isStale: boolean;                   // age > threshold (will be set later)
  risk: Risk;
  note?: string;                      // From notes.json (will be added later)
}

// Registry time data structure
export interface RegistryTimeData {
  [version: string]: string; // ISO date strings
}

// Registry response structure
export interface RegistryResponse {
  name: string;
  'dist-tags': {
    latest: string;
    [tag: string]: string;
  };
  time: RegistryTimeData;
  versions: {
    [version: string]: {
      version: string;
      dist: {
        tarball: string;
      };
    };
  };
}

// Raw output from package manager outdated commands
export type RawOutdatedOutput = Record<string, any>;
