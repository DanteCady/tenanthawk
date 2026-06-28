/** Vercel cron runs daily at 07:00 UTC (see vercel.json). */
const SCAN_HOUR_UTC = 7;

export function getNextScheduledScanAt(from = new Date()): Date {
  const next = new Date(
    Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate(),
      SCAN_HOUR_UTC,
      0,
      0,
      0,
    ),
  );
  if (next <= from) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

export function formatNextScanLabel(from = new Date()): string {
  const next = getNextScheduledScanAt(from);
  const diffMs = next.getTime() - from.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    return next.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    });
  }
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}
