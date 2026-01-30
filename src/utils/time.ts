// No imports needed - using simple math for duration parsing

/**
 * Parses human-readable duration strings like "18 months", "2 years", "90 days"
 * Returns the duration in milliseconds
 */
export function parseDuration(duration: string): number {
  const trimmed = duration.trim().toLowerCase();
  
  // Match patterns like "18 months", "2 years", "90 days", "1 year", "6 months"
  const match = trimmed.match(/^(\d+)\s+(year|years|month|months|day|days|week|weeks)$/);
  
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}". Expected format: "18 months", "2 years", "90 days", etc.`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  // Convert to milliseconds
  switch (unit) {
    case 'day':
    case 'days':
      return value * 24 * 60 * 60 * 1000;
    case 'week':
    case 'weeks':
      return value * 7 * 24 * 60 * 60 * 1000;
    case 'month':
    case 'months':
      // Approximate: 30 days per month
      return value * 30 * 24 * 60 * 60 * 1000;
    case 'year':
    case 'years':
      // Approximate: 365 days per year
      return value * 365 * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}

/**
 * Converts a duration string to days (for threshold comparison)
 */
export function parseDurationToDays(duration: string): number {
  const ms = parseDuration(duration);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
