/**
 * Formats time remaining in seconds to a human-readable string
 */
export function formatTimeRemaining(s: number): string {
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Formats a timestamp to a relative time string
 */
export function formatRelativeTime(timestamp: number | string): string {
  const now = new Date();
  // Create Date objects for both timestamps
  const date = parseTimestamp(timestamp);

  // Get the difference in milliseconds
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;
  return 'just now';
}

function parseTimestamp(input: number | string): Date {
  if (typeof input === 'number') return new Date(input);

  // Handle string timestamps
  // If timestamp doesn't end with Z, treat as UTC
  const timestampStr = input.endsWith('Z') ? input : `${input}Z`;
  return new Date(timestampStr);
}
