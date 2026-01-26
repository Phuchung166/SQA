// Utility helpers for time conversions

/**
 * Convert milliseconds to whole minutes (floor).
 * Returns 0 for undefined/null/non-positive inputs.
 */
export function msToMinutes(ms?: number | null): number {
  if (ms == null) return 0;
  const n = Number(ms);
  if (!isFinite(n) || n <= 0) return 0;
  return Math.floor(n / 60000);
}

/**
 * Format milliseconds into a human readable string like "1h 23m", "45m", or "30s".
 * Shows seconds if duration is less than 1 minute.
 */
export function formatMsDuration(ms?: number | null): string {
  if (ms == null) return '0s';
  const n = Number(ms);
  if (!isFinite(n) || n <= 0) return '0s';

  // If less than 1 minute, show seconds
  if (n < 60000) {
    const seconds = Math.round(n / 1000);
    return `${seconds}s`;
  }

  const minutes = msToMinutes(ms);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}
