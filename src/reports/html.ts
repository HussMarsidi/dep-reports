import { format } from 'date-fns';
import type { EnrichedPackage } from '../types/index.js';
import { calculateSummary, calculatePriorityScore, detectNoteKeyword, isStable } from './summary.js';

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
 * Formats behind-by for display
 */
function formatBehindBy(behindByDays: number | null): string {
  if (behindByDays === null) {
    return '—';
  }
  if (behindByDays < 30) {
    return `${behindByDays}d`;
  }
  if (behindByDays < 365) {
    const months = Math.floor(behindByDays / 30);
    return `${months}m`;
  }
  const years = Math.floor(behindByDays / 365);
  const remainingMonths = Math.floor((behindByDays % 365) / 30);
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
  date: Date = new Date(),
  totalDependencies?: number
): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const timestamp = format(date, 'yyyy-MM-dd HH:mm:ss');

  if (packages.length === 0) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dependency Report (${dateStr})</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #059669;
    }
    .empty-state h2 {
      font-size: 1.5rem;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dependency Report (${dateStr})</h1>
    <div class="timestamp">Generated at: ${timestamp}</div>
    <div class="empty-state">
      <h2>✅ All dependencies are up to date</h2>
    </div>
  </div>
</body>
</html>`;
  }

  // Calculate summary
  const total = totalDependencies ?? packages.length;
  const summary = calculateSummary(packages, total);

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

  // Action Required section
  const actionRequired = sorted
    .map(pkg => ({ pkg, score: calculatePriorityScore(pkg) }))
    .filter(({ score }) => score > 15)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map(({ pkg }) => pkg);

  const critical = actionRequired.filter(pkg => {
    const score = calculatePriorityScore(pkg);
    return score >= 20 || pkg.risk === 'Major' || (pkg.note && /BLOCKED/i.test(pkg.note));
  });
  const reviewSoon = actionRequired.filter(pkg => !critical.includes(pkg));

  // Build action required HTML
  let actionRequiredHtml = '';
  if (actionRequired.length > 0) {
    if (critical.length > 0) {
      actionRequiredHtml += '<div class="action-group critical">';
      actionRequiredHtml += '<h3 class="action-title critical">🔴 Critical Risk</h3>';
      for (const pkg of critical) {
        const ageStr = formatAge(pkg.age);
        const behindStr = formatBehindBy(pkg.behindByDays);
        const updateType = pkg.risk === 'Major' ? 'Major update' : pkg.risk === 'Minor' ? 'Minor update' : 'Patch update';
        const keyword = detectNoteKeyword(pkg.note);
        const noteBadge = keyword ? `<span class="badge badge-${keyword}">${keyword.toUpperCase()}</span>` : '';
        const noteText = pkg.note ? escapeHtml(pkg.note.replace(/^(BLOCKED|DEFERRED|ACCEPTED(\s+RISK)?)[:\-\s]+/i, '').trim()) : '';
        
        actionRequiredHtml += `
          <div class="package-card">
            <div class="package-header">
              <strong>${escapeHtml(pkg.name)}</strong> (${escapeHtml(pkg.current)} → ${escapeHtml(pkg.latest)})
            </div>
            <div class="package-details">
              ${ageStr} old, behind by ${behindStr} | ${updateType}
              ${noteBadge ? `<br>${noteBadge} ${noteText ? escapeHtml(noteText) : ''}` : ''}
            </div>
          </div>`;
      }
      actionRequiredHtml += '</div>';
    }

    if (reviewSoon.length > 0) {
      actionRequiredHtml += '<div class="action-group review">';
      actionRequiredHtml += '<h3 class="action-title review">🟡 Review Soon</h3>';
      for (const pkg of reviewSoon) {
        const ageStr = formatAge(pkg.age);
        const behindStr = formatBehindBy(pkg.behindByDays);
        const updateType = pkg.risk === 'Major' ? 'Major update' : pkg.risk === 'Minor' ? 'Minor update' : 'Patch update';
        const keyword = detectNoteKeyword(pkg.note);
        const noteBadge = keyword ? `<span class="badge badge-${keyword}">${keyword.toUpperCase()}</span>` : '';
        const noteText = pkg.note ? escapeHtml(pkg.note.replace(/^(BLOCKED|DEFERRED|ACCEPTED(\s+RISK)?)[:\-\s]+/i, '').trim()) : '';
        
        actionRequiredHtml += `
          <div class="package-card">
            <div class="package-header">
              <strong>${escapeHtml(pkg.name)}</strong> (${escapeHtml(pkg.current)} → ${escapeHtml(pkg.latest)})
            </div>
            <div class="package-details">
              ${ageStr} old, behind by ${behindStr} | ${updateType}
              ${noteBadge ? `<br>${noteBadge} ${noteText ? escapeHtml(noteText) : ''}` : ''}
            </div>
          </div>`;
      }
      actionRequiredHtml += '</div>';
    }
  } else {
    actionRequiredHtml = '<div class="no-actions">✅ No critical actions required</div>';
  }

  // Build table rows
  let tableRows = '';
  for (const pkg of sorted) {
    const ageStr = formatAge(pkg.age);
    const behindStr = formatBehindBy(pkg.behindByDays);
    const riskColor = getRiskColor(pkg.risk);
    const status = isStable(pkg) ? '<span class="status-stable">✅ Stable</span>' : 'Outdated';
    const keyword = detectNoteKeyword(pkg.note);
    const noteBadge = keyword ? `<span class="badge badge-${keyword}">${keyword.toUpperCase()}</span>` : '';
    const noteText = pkg.note ? escapeHtml(pkg.note.replace(/^(BLOCKED|DEFERRED|ACCEPTED(\s+RISK)?)[:\-\s]+/i, '').trim()) : '';
    const noteDisplay = noteBadge && noteText ? `${noteBadge} ${noteText}` : noteBadge || noteText || '';

    tableRows += `
      <tr>
        <td class="package-name">${escapeHtml(pkg.name)}</td>
        <td>${escapeHtml(pkg.current)}</td>
        <td>${escapeHtml(pkg.latest)}</td>
        <td>${escapeHtml(ageStr)}</td>
        <td>${escapeHtml(behindStr)}</td>
        <td><span class="risk-badge" style="background-color: ${riskColor}">${escapeHtml(pkg.risk)}</span></td>
        <td>${status}</td>
        <td class="notes">${noteDisplay}</td>
      </tr>`;
  }

  // Get status color
  const statusColor = summary.riskStatus === 'healthy' ? '#10b981' : 
                      summary.riskStatus === 'degrading' ? '#f59e0b' : '#ef4444';

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
      margin-bottom: 1rem;
    }
    .status-badge {
      background: ${statusColor};
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1.1rem;
      text-align: center;
      margin: 1.5rem 0;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .summary-card {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .summary-card strong {
      display: block;
      font-size: 1.5rem;
      color: #111827;
      margin-bottom: 0.25rem;
    }
    .summary-card span {
      color: #6b7280;
      font-size: 0.875rem;
    }
    .risk-assessment {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 1rem;
      margin: 1.5rem 0;
      border-radius: 4px;
    }
    .action-section {
      margin: 2rem 0;
    }
    .action-group {
      margin: 1.5rem 0;
    }
    .action-title {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .action-title.critical {
      color: #dc2626;
      border-bottom-color: #dc2626;
    }
    .action-title.review {
      color: #f59e0b;
      border-bottom-color: #f59e0b;
    }
    .package-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .package-header {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    .package-details {
      color: #6b7280;
      font-size: 0.875rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-right: 0.5rem;
    }
    .badge-blocked {
      background: #dc2626;
      color: white;
    }
    .badge-deferred {
      background: #f59e0b;
      color: white;
    }
    .badge-accepted {
      background: #3b82f6;
      color: white;
    }
    .no-actions {
      text-align: center;
      padding: 2rem;
      color: #059669;
      font-size: 1.1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2rem;
    }
    thead {
      background-color: #f3f4f6;
      position: sticky;
      top: 0;
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
    .status-stable {
      color: #10b981;
      font-weight: 600;
    }
    .notes {
      color: #6b7280;
      font-size: 0.875rem;
    }
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
      .container {
        padding: 1rem;
      }
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      table {
        font-size: 0.875rem;
      }
      th, td {
        padding: 0.5rem;
      }
    }
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dependency Report (${dateStr})</h1>
    <div class="timestamp">Generated at: ${timestamp}</div>
    
    <div class="status-badge">
      ${summary.riskStatusEmoji} ${summary.riskStatusText}
    </div>
    
    <div class="summary-grid">
      <div class="summary-card">
        <strong>${summary.total}</strong>
        <span>Total dependencies</span>
      </div>
      <div class="summary-card">
        <strong>${summary.outdated}</strong>
        <span>Outdated (${summary.major} major, ${summary.minor} minor, ${summary.patch} patch)</span>
      </div>
      <div class="summary-card">
        <strong>${summary.stale}</strong>
        <span>Stale (>12 months)</span>
      </div>
      <div class="summary-card">
        <strong>${summary.upToDate}</strong>
        <span>Up-to-date</span>
      </div>
      ${summary.blocked > 0 || summary.deferred > 0 || summary.accepted > 0 ? `
      <div class="summary-card">
        <strong>${summary.blocked}</strong>
        <span>Blocked upgrades</span>
      </div>
      <div class="summary-card">
        <strong>${summary.deferred}</strong>
        <span>Deferred upgrades</span>
      </div>
      <div class="summary-card">
        <strong>${summary.accepted}</strong>
        <span>Accepted risks</span>
      </div>
      ` : ''}
    </div>
    
    <div class="risk-assessment">
      <strong>Risk Assessment:</strong> ${summary.stale} stale dependencies and ${summary.major} unaddressed major upgrades detected.
    </div>
    
    <div class="action-section">
      <h2 style="margin-bottom: 1rem; font-size: 1.25rem; color: #374151;">Action Required</h2>
      ${actionRequiredHtml}
    </div>
    
    <h2 style="margin-top: 2rem; margin-bottom: 1rem; font-size: 1.25rem; color: #374151;">Full Dependency List</h2>
    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Current</th>
          <th>Latest</th>
          <th>Age</th>
          <th>Behind</th>
          <th>Risk</th>
          <th>Status</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
}
