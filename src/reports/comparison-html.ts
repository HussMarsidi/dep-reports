import escapeHtml from 'escape-html';
import type { EnrichedPackage } from '../types/index.js';

interface ComparisonData {
  fromDate: string;
  toDate: string;
  daysDiff: number | string;
  fromPackages: EnrichedPackage[];
  toPackages: EnrichedPackage[];
  summary: {
    fromStale: number;
    toStale: number;
    fromMajor: number;
    toMajor: number;
    fromScore: number;
    toScore: number;
    improvement: number;
  };
  changes: {
    added: EnrichedPackage[];
    removed: EnrichedPackage[];
    upgraded: Array<{ pkg: EnrichedPackage; fromVersion: string }>;
  };
}

/**
 * Generates HTML comparison report for stakeholders/managers
 */
export function generateComparisonHtml(data: ComparisonData): string {
  const { fromDate, toDate, daysDiff, summary, changes } = data;
  
  const scoreChange = summary.toScore - summary.fromScore;
  const scoreIcon = scoreChange > 0 ? '✅' : scoreChange < 0 ? '⚠️' : '➡️';
  const scoreColor = scoreChange > 0 ? '#10b981' : scoreChange < 0 ? '#ef4444' : '#6b7280';
  
  const statusText = summary.improvement > 0 ? 'Improved' : summary.improvement < 0 ? 'Regressed' : 'Unchanged';
  const statusColor = summary.improvement > 0 ? '#10b981' : summary.improvement < 0 ? '#ef4444' : '#6b7280';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dependency Health Comparison: ${escapeHtml(fromDate)} → ${escapeHtml(toDate)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      color: #1f2937;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    header p { opacity: 0.9; font-size: 1.1rem; }
    .content { padding: 2rem; }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      background: #f9fafb;
      border-radius: 12px;
      padding: 1.5rem;
      border-left: 4px solid #667eea;
    }
    .metric-card h3 {
      font-size: 0.875rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .metric-value {
      font-size: 1.75rem;
      font-weight: bold;
      color: #1f2937;
    }
    .metric-change {
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    .status-banner {
      background: linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}05 100%);
      border: 2px solid ${statusColor};
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      text-align: center;
    }
    .status-banner h2 {
      font-size: 1.5rem;
      color: ${statusColor};
      margin-bottom: 0.5rem;
    }
    .section {
      margin-bottom: 2rem;
    }
    .section h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
    .package-list {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
    }
    .package-item {
      padding: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .package-item:last-child { border-bottom: none; }
    .package-name { font-weight: 600; color: #1f2937; }
    .package-version { color: #6b7280; font-size: 0.875rem; }
    .progress-bar {
      background: #e5e7eb;
      border-radius: 8px;
      height: 24px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .progress-fill {
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75rem;
      font-weight: bold;
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Dependency Health Comparison</h1>
      <p>${escapeHtml(fromDate)} → ${escapeHtml(toDate)} (${escapeHtml(String(daysDiff))} days)</p>
    </header>
    
    <div class="content">
      <div class="status-banner">
        <h2>${scoreIcon} ${statusText}</h2>
        <p>Dependency health has ${statusText.toLowerCase()} by <strong>${Math.abs(summary.improvement).toFixed(1)}%</strong></p>
      </div>
      
      <div class="metric-grid">
        <div class="metric-card">
          <h3>Health Score</h3>
          <div class="metric-value" style="color: ${scoreColor}">${summary.toScore.toFixed(0)}</div>
          <div class="metric-change">
            <span style="color: ${scoreColor}">${scoreChange > 0 ? '+' : ''}${scoreChange.toFixed(1)}</span>
            from ${summary.fromScore.toFixed(0)}
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${summary.toScore}%">${summary.toScore.toFixed(0)}%</div>
          </div>
        </div>
        
        <div class="metric-card">
          <h3>Stale Packages</h3>
          <div class="metric-value">${summary.toStale}</div>
          <div class="metric-change">
            ${summary.toStale !== summary.fromStale 
              ? `<span style="color: ${summary.toStale < summary.fromStale ? '#10b981' : '#ef4444'}">${summary.toStale > summary.fromStale ? '+' : ''}${summary.toStale - summary.fromStale}</span> from ${summary.fromStale}`
              : 'No change'
            }
          </div>
        </div>
        
        <div class="metric-card">
          <h3>Major Updates</h3>
          <div class="metric-value">${summary.toMajor}</div>
          <div class="metric-change">
            ${summary.toMajor !== summary.fromMajor
              ? `<span style="color: ${summary.toMajor < summary.fromMajor ? '#10b981' : '#ef4444'}">${summary.toMajor > summary.fromMajor ? '+' : ''}${summary.toMajor - summary.fromMajor}</span> from ${summary.fromMajor}`
              : 'No change'
            }
          </div>
        </div>
      </div>
      
      ${changes.upgraded.length > 0 ? `
      <div class="section">
        <h2>📈 Upgraded Packages (${changes.upgraded.length})</h2>
        <div class="package-list">
          ${changes.upgraded.slice(0, 10).map(({ pkg, fromVersion }) => `
            <div class="package-item">
              <div class="package-name">${escapeHtml(pkg.name)}</div>
              <div class="package-version">${escapeHtml(fromVersion)} → ${escapeHtml(pkg.current)}</div>
            </div>
          `).join('')}
          ${changes.upgraded.length > 10 ? `
            <div class="package-item" style="text-align: center; color: #6b7280;">
              ... and ${changes.upgraded.length - 10} more
            </div>
          ` : ''}
        </div>
      </div>
      ` : ''}
      
      ${changes.added.length > 0 ? `
      <div class="section">
        <h2>➕ Added Packages (${changes.added.length})</h2>
        <div class="package-list">
          ${changes.added.map(pkg => `
            <div class="package-item">
              <div class="package-name">${escapeHtml(pkg.name)}</div>
              <div class="package-version">${escapeHtml(pkg.current)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${changes.removed.length > 0 ? `
      <div class="section">
        <h2>➖ Removed Packages (${changes.removed.length})</h2>
        <div class="package-list">
          ${changes.removed.map(pkg => `
            <div class="package-item">
              <div class="package-name">${escapeHtml(pkg.name)}</div>
              <div class="package-version">was ${escapeHtml(pkg.current)}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`;
}
