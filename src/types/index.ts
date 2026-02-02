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
export type Risk = 
  | 'CRITICAL' 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW' 
  | 'BLOCKED' 
  | 'DEFERRED' 
  | 'ACCEPTED_RISK'
  | 'Exotic'
  | 'NotInstalled';

export interface SecurityAdvisory {
  severity: string;  // 'critical' | 'high' | 'moderate' | 'low' | 'info'
  title: string;
  url: string;
  affectedRange?: string;
}

// Enriched with registry data
export interface EnrichedPackage extends OutdatedPackage {
  currentPublishedAt: Date | null;  // When current version was published
  latestPublishedAt: Date | null;    // When latest version was published
  age: number | null;                 // days since current was published
  behindByDays: number | null;       // Days between current and latest publish dates
  isStale: boolean;                   // age > threshold (will be set later)
  risk: Risk;
  note?: string;                      // From notes.json (will be added later)
  hasSecurityAdvisory?: boolean;      // Whether there is a security advisory
  securityAdvisory?: SecurityAdvisory; // Details if any
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
export type RawOutdatedOutput =
  | Record<string, any>
  | Array<Record<string, any>>
  | { packages?: Array<Record<string, any>> };

// Snapshot interfaces for historical tracking
export interface SnapshotSummary {
  total: number;
  outdated: number;
  stale: number;
  upToDate: number;
  runtime: {
    total: number;
    outdated: number;
    stale: number;
  };
  dev: {
    total: number;
    outdated: number;
    stale: number;
  };
}

export interface SnapshotRiskBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  blocked: number;
  deferred: number;
}

export interface SnapshotDependency {
  name: string;
  current: string;
  latest: string;
  publishedDate: string | null; // ISO string
  ageInMonths: number | null;
  updateType: string | null; // 'major', 'minor', 'patch' etc
  risk: Risk;
  isStale: boolean;
  isDev: boolean;
  hasSecurityAdvisory: boolean;
  note: string | null;
}

export interface Snapshot {
  timestamp: string; // ISO string
  summary: SnapshotSummary;
  riskBreakdown: SnapshotRiskBreakdown;
  healthScore: number;
  statusLevel: string; // 'GOOD', 'AT_RISK', etc.
  dependencies: SnapshotDependency[];
}

// Trend interfaces
export interface TrendMetric {
  current: number;
  previous: number;
  change: number; // positive = improving, negative = worsening (context dependent)
  trend: 'improving' | 'stable' | 'worsening';
  sparkline: number[];
}

export interface TrendData {
  period: string; // '7 days', '30 days', '90 days'
  snapshots: Snapshot[];
  metrics: {
    healthScore: TrendMetric;
    staleCount: TrendMetric;
    outdatedCount: TrendMetric;
    criticalCount: TrendMetric;
  };
}

