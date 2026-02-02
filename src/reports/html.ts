import { format } from 'date-fns';
import type { EnrichedPackage, TrendData } from '../types/index.js';
import { calculateSummary, calculatePriorityScore, detectNoteKeyword } from './summary.js';

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
    case 'CRITICAL':
      return '#dc2626'; // red-600
    case 'HIGH':
      return '#ea580c'; // orange-600
    case 'MEDIUM':
      return '#ca8a04'; // yellow-600
    case 'LOW':
      return '#10b981'; // emerald-500
    case 'BLOCKED':
      return '#be123c'; // rose-700
    case 'DEFERRED':
      return '#b45309'; // amber-700
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
  totalDependencies?: number,
  trendData?: TrendData
): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const timestamp = format(date, 'yyyy-MM-dd HH:mm:ss');
  
  // Calculate summary
  const total = totalDependencies ?? packages.length;
  const summary = calculateSummary(packages, total);

  // Split into Runtime and Dev
  const devDeps = packages.filter(p => p.type === 'devDependencies');
  const runtimeDeps = packages.filter(p => p.type !== 'devDependencies');

  const getStats = (deps: EnrichedPackage[]) => {
      return { outdated: deps.length, stale: deps.filter(p => p.isStale).length };
  };
  const runtimeStats = getStats(runtimeDeps);
  const devStats = getStats(devDeps);

  // Get status color
  const statusColor = summary.riskStatus === 'HEALTHY' ? '#10b981' : 
                      summary.riskStatus === 'CRITICAL' ? '#dc2626' : 
                      summary.riskStatus === 'AT_RISK' ? '#ef4444' :
                      summary.riskStatus === 'NEEDS_ATTENTION' ? '#f59e0b' : '#3b82f6';
  
  // Trend Section HTML
  let trendSection = '';
  if (trendData && trendData.snapshots.length > 0) {
      const { healthScore, staleCount, outdatedCount, criticalCount } = trendData.metrics;

      const formatTrend = (m: any) => {
          const sign = m.change > 0 ? '+' : '';
          const color = m.trend === 'improving' ? '#10b981' : m.trend === 'worsening' ? '#dc2626' : '#6b7280';
          const icon = m.trend === 'improving' ? '↗' : m.trend === 'worsening' ? '↘' : '➡️';
          return `<span style="color: ${color}; font-weight: bold;">${icon} ${m.current}</span> <span style="font-size: 0.8em; color: #6b7280;">(${sign}${m.change})</span>`;
      };
      
      const dates = trendData.snapshots.map(s => format(new Date(s.timestamp), 'MM/dd'));
      const scores = trendData.snapshots.map(s => s.healthScore);

      trendSection = `
      <div class="summary-section">
          <h2>📈 Trend (Last ${trendData.period})</h2>
          <div class="summary-grid">
              <div class="summary-card">
                  <strong>Health Score</strong>
                  <span>${formatTrend(healthScore)}</span>
              </div>
              <div class="summary-card">
                  <strong>Stale Dependencies</strong>
                  <span>${formatTrend(staleCount)}</span>
              </div>
              <div class="summary-card">
                  <strong>Outdated</strong>
                  <span>${formatTrend(outdatedCount)}</span>
              </div>
              <div class="summary-card">
                  <strong>Critical</strong>
                  <span>${formatTrend(criticalCount)}</span>
              </div>
          </div>
          
          <div style="margin-top: 1.5rem; background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e5e7eb; height: 250px;">
            <canvas id="healthTrendChart"></canvas>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <script>
            document.addEventListener('DOMContentLoaded', () => {
                const ctx = document.getElementById('healthTrendChart').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ${JSON.stringify(dates)},
                        datasets: [{
                            label: 'Health Score',
                            data: ${JSON.stringify(scores)},
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.3,
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: { 
                                mode: 'index',
                                intersect: false
                            }
                        },
                        scales: {
                            y: { 
                                min: 0, 
                                max: 100,
                                grid: { color: '#f3f4f6' }
                            },
                            x: {
                                grid: { display: false }
                            }
                        }
                    }
                });
            });
          </script>
      </div>
      `;
  }

  let html = `<!DOCTYPE html>
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
    h1 { color: #111827; margin-bottom: 0.5rem; font-size: 2rem; }
    h2 { color: #374151; font-size: 1.25rem; margin-top: 2rem; margin-bottom: 1rem; }
    .timestamp { color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem; }
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
    .summary-section { margin: 2rem 0; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .summary-card {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .summary-card strong { display: block; font-size: 1.5rem; color: #111827; }
    .summary-card span { color: #6b7280; font-size: 0.875rem; }
    
    .action-section { margin: 2rem 0; }
    .action-group { margin: 1.5rem 0; }
    .action-title { font-size: 1.25rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; }
    .action-title.critical { color: #dc2626; border-bottom-color: #dc2626; }
    .action-title.high { color: #ea580c; border-bottom-color: #ea580c; }
    .action-title.blocked { color: #be123c; border-bottom-color: #be123c; }
    
    .package-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .dep-type { 
        display: inline-block; font-size: 0.75rem; background: #e5e7eb; padding: 0.125rem 0.375rem; border-radius: 4px; margin-left: 0.5rem; color: #374151; 
    }
    
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    thead { background-color: #f3f4f6; position: sticky; top: 0; }
    th { text-align: left; padding: 0.75rem 1rem; font-weight: 600; color: #374151; font-size: 0.875rem; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; }
    .risk-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 4px; color: white; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; margin-right: 0.5rem; color: white;}
    .badge-blocked { background: #be123c; }
    .badge-deferred { background: #b45309; }
    .badge-accepted { background: #3b82f6; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dependency Report (${dateStr})</h1>
    <div class="timestamp">Generated at: ${timestamp}</div>
    
    <div class="status-badge">
      ${summary.riskStatusEmoji} ${summary.riskStatusText}
    </div>
    
    ${trendSection}

    <div class="summary-section">
      <h2>📊 Dependency Health Summary</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <strong>Runtime Breakdown</strong>
          <span>Outdated: ${runtimeStats.outdated} | Stale: ${runtimeStats.stale}</span>
        </div>
        <div class="summary-card">
          <strong>Dev Breakdown</strong>
          <span>Outdated: ${devStats.outdated} | Stale: ${devStats.stale}</span>
        </div>
        <div class="summary-card">
          <strong>Risk Breakdown</strong>
          <span>🔴 ${summary.critical} | ⚠️ ${summary.high} | 📦 ${summary.medium}</span>
        </div>
        ${summary.blocked > 0 || summary.deferred > 0 ? `
        <div class="summary-card">
          <strong>Acknowledged</strong>
          <span>🚫 ${summary.blocked} blocked | 📅 ${summary.deferred} deferred</span>
        </div>` : ''}
      </div>
    </div>`;

  // Action Required Logic
  const sorted = [...packages].sort((a, b) => {
    const riskOrder: Record<string, number> = {
      'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'BLOCKED': 4, 'DEFERRED': 5, 'ACCEPTED_RISK': 2, 'Exotic': 6
    };
    const rDiff = (riskOrder[a.risk] || 99) - (riskOrder[b.risk] || 99);
    if (rDiff !== 0) return rDiff;
    if ((b.age || 0) !== (a.age || 0)) return (b.age || 0) - (a.age || 0);
    return 0;
  });

  const actionRequired = sorted.filter(pkg => {
    const score = calculatePriorityScore(pkg);
    return score > 15 || pkg.risk === 'CRITICAL' || pkg.risk === 'HIGH';
  });

  if (actionRequired.length > 0) {
      html += `<div class="action-section"><h2>Action Required</h2>`;
      
      const groups = {
        critical: actionRequired.filter(p => p.risk === 'CRITICAL'),
        high: actionRequired.filter(p => p.risk === 'HIGH'),
        blocked: actionRequired.filter(p => p.risk === 'BLOCKED'),
      };

      const renderGroup = (deps: EnrichedPackage[], title: string, cssClass: string) => {
          if (deps.length === 0) return '';
          let res = `<div class="action-group ${cssClass}">
            <h3 class="action-title ${cssClass}">${title} (${deps.length})</h3>`;
          
          for (const pkg of deps) {
              const ageStr = formatAge(pkg.age);
              const typeLabel = pkg.type === 'devDependencies' ? 'Dev' : 'Runtime';
              const keyword = detectNoteKeyword(pkg.note);
              const noteBadge = keyword ? `<span class="badge badge-${keyword}">${keyword.toUpperCase()}</span>` : '';
              const noteText = pkg.note ? escapeHtml(pkg.note.replace(/^(BLOCKED|DEFERRED|ACCEPTED(\s+RISK)?)[:\-\s]+/i, '').trim()) : '';
              
              const securityHtml = pkg.securityAdvisory 
                ? `<div style="color: #dc2626; margin-top: 0.5rem; font-weight: 600;">
                     🚨 SECURITY: ${escapeHtml(pkg.securityAdvisory.title)} (${escapeHtml(pkg.securityAdvisory.severity)})
                     <br><a href="${escapeHtml(pkg.securityAdvisory.url)}" target="_blank" style="color: #dc2626; text-decoration: underline; font-size: 0.9em; font-weight: normal;">View Advisory</a>
                   </div>`
                : '';

              res += `<div class="package-card">
                  <div class="package-header">
                      <strong>${escapeHtml(pkg.name)}</strong> (${escapeHtml(pkg.current)} → ${escapeHtml(pkg.latest)})
                      <span class="dep-type">${typeLabel}</span>
                  </div>
                  <div class="package-details">
                      ${ageStr} old${pkg.isStale ? ', STALE' : ''} | Risk: ${escapeHtml(pkg.risk)}
                      ${securityHtml}
                      ${noteBadge ? `<br>${noteBadge} ${noteText}` : ''}
                  </div>
              </div>`;
          }
          res += `</div>`;
          return res;
      };

      html += renderGroup(groups.critical, '🔴 Critical Risk', 'critical');
      html += renderGroup(groups.high, '⚠️ High Priority', 'high');
      html += renderGroup(groups.blocked, '🚫 Blocked Items', 'blocked');
      
      html += `</div>`;
  }

  // Full Tables
  const renderTable = (deps: EnrichedPackage[], title: string) => {
      let res = `<h2>${title}</h2>`;
      if (deps.length === 0) return res + '<p>_No outdated dependencies_</p>';
      
      // Sort logic same as above
       const tableSorted = [...deps].sort((a, b) => {
          const riskOrder: Record<string, number> = {
            'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'BLOCKED': 4, 'DEFERRED': 5, 'ACCEPTED_RISK': 2, 'Exotic': 6
          };
          const rDiff = (riskOrder[a.risk] || 99) - (riskOrder[b.risk] || 99);
          if (rDiff !== 0) return rDiff;
          return a.name.localeCompare(b.name);
      });

      res += `<table>
        <thead>
          <tr>
            <th>Package</th>
            <th>Current</th>
            <th>Latest</th>
            <th>Age</th>
            <th>Risk</th>
            <th>Security</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>`;
      
      for (const pkg of tableSorted) {
        const ageStr = formatAge(pkg.age);
        const riskColor = getRiskColor(pkg.risk);
        const keyword = detectNoteKeyword(pkg.note);
        const noteBadge = keyword ? `<span class="badge badge-${keyword}">${keyword.toUpperCase()}</span>` : '';
        const noteText = pkg.note ? escapeHtml(pkg.note.replace(/^(BLOCKED|DEFERRED|ACCEPTED(\s+RISK)?)[:\-\s]+/i, '').trim()) : '';
        const noteDisplay = noteBadge && noteText ? `${noteBadge} ${noteText}` : noteBadge || noteText || '';
        
        const securityCell = pkg.securityAdvisory 
            ? `<span style="color: #dc2626; font-weight: bold;">🚨 ${escapeHtml(pkg.securityAdvisory.severity)}</span>` 
            : '-';

        res += `<tr>
            <td>${escapeHtml(pkg.name)}</td>
            <td>${escapeHtml(pkg.current)}</td>
            <td>${escapeHtml(pkg.latest)}</td>
            <td>${escapeHtml(ageStr)}</td>
            <td><span class="risk-badge" style="background-color: ${riskColor}">${escapeHtml(pkg.risk)}</span></td>
            <td>${securityCell}</td>
            <td class="notes">${noteDisplay}</td>
        </tr>`;
      }
      res += `</tbody></table>`;
      return res;
  };

  html += renderTable(runtimeDeps, 'Runtime Dependencies');
  html += renderTable(devDeps, 'Dev Dependencies');

  html += `</div></body></html>`;
  return html;
}
