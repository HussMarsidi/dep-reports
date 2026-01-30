import { format } from 'date-fns';
import type { EnrichedPackage } from '../types/index.js';

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Formats age for display
 */
function formatAge(age: number | null): string {
  if (age === null) {
    return 'Unknown';
  }
  if (age < 30) {
    return `${age}d`;
  }
  if (age < 365) {
    const months = Math.floor(age / 30);
    return `${months}m`;
  }
  const years = Math.floor(age / 365);
  const remainingMonths = Math.floor((age % 365) / 30);
  return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
}

/**
 * Gets CSS color class for risk level
 */
function getRiskColor(risk: string): string {
  switch (risk) {
    case 'Major':
      return '#dc2626'; // red-600
    case 'Minor':
      return '#ea580c'; // orange-600
    case 'Patch':
      return '#ca8a04'; // yellow-600
    case 'Exotic':
      return '#6b7280'; // gray-500
    case 'NotInstalled':
      return '#9ca3af'; // gray-400
    default:
      return '#6b7280';
  }
}

/**
 * Generates HTML report from enriched packages
 */
export function generateHtmlReport(
  packages: EnrichedPackage[],
  date: Date = new Date()
): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const timestamp = format(date, 'yyyy-MM-dd HH:mm:ss');

  // Sort packages: Major risk first, then by age (oldest first)
  const sorted = [...packages].sort((a, b) => {
    const riskOrder: Record<string, number> = {
      Major: 0,
      Minor: 1,
      Patch: 2,
      Exotic: 3,
      NotInstalled: 4,
    };
    const riskDiff = (riskOrder[a.risk] || 99) - (riskOrder[b.risk] || 99);
    if (riskDiff !== 0) return riskDiff;
    
    // Then by age (nulls last)
    if (a.age === null && b.age === null) return 0;
    if (a.age === null) return 1;
    if (b.age === null) return -1;
    return b.age - a.age; // Oldest first
  });

  let tableRows = '';
  for (const pkg of sorted) {
    const ageStr = formatAge(pkg.age);
    const riskColor = getRiskColor(pkg.risk);
    const staleStr = pkg.isStale ? 'Yes' : 'No';
    const staleClass = pkg.isStale ? 'stale-yes' : 'stale-no';
    const noteStr = escapeHtml(pkg.note || '');

    tableRows += `
      <tr>
        <td class="package-name">${escapeHtml(pkg.name)}</td>
        <td>${escapeHtml(pkg.current)}</td>
        <td>${escapeHtml(pkg.latest)}</td>
        <td><span class="risk-badge" style="background-color: ${riskColor}">${escapeHtml(pkg.risk)}</span></td>
        <td>${escapeHtml(ageStr)}</td>
        <td class="${staleClass}">${staleStr}</td>
        <td class="notes">${noteStr}</td>
      </tr>`;
  }

  const emptyState = packages.length === 0 ? `
    <div class="empty-state">
      <h2>✅ All dependencies are up to date</h2>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dependency Report (${dateStr})</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      padding: 2rem;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }
    h1 {
      color: #111827;
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }
    .timestamp {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #059669;
    }
    .empty-state h2 {
      font-size: 1.5rem;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    thead {
      background-color: #f3f4f6;
    }
    th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    tbody tr:hover {
      background-color: #f9fafb;
    }
    .package-name {
      font-weight: 500;
      color: #111827;
    }
    .risk-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stale-yes {
      color: #dc2626;
      font-weight: 600;
    }
    .stale-no {
      color: #059669;
    }
    .notes {
      color: #6b7280;
      font-style: italic;
    }
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      .container {
        padding: 1rem;
      }
      table {
        font-size: 0.875rem;
      }
      th, td {
        padding: 0.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dependency Report (${dateStr})</h1>
    <div class="timestamp">Generated at: ${timestamp}</div>
    ${emptyState || `
    <h2 style="margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1.25rem; color: #374151;">
      Outdated Packages (${packages.length})
    </h2>
    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Current</th>
          <th>Latest</th>
          <th>Risk</th>
          <th>Age</th>
          <th>Stale?</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    `}
  </div>
</body>
</html>`;
}
