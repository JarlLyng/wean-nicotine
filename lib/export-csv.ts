/**
 * CSV export of the user's log (#43).
 *
 * One row per log entry, oldest first. `date` and `time` are the phone's
 * local time, for reading. `timestamp_utc` is the exact moment in ISO 8601,
 * so a future import (#224) can restore entries without losing anything.
 */

import type { LogEntry } from './models';

export const CSV_HEADER = ['date', 'time', 'event', 'trigger', 'timestamp_utc'] as const;

/** Quote a field when it holds a comma, quote or line break (RFC 4180). */
function csvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function buildLogCsv(entries: LogEntry[]): string {
  const rows = [...entries]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((entry) => {
      const d = new Date(entry.timestamp);
      return [
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        entry.type,
        entry.trigger ?? '',
        d.toISOString(),
      ]
        .map(csvField)
        .join(',');
    });
  // CRLF line endings, as RFC 4180 and spreadsheet apps expect
  return [CSV_HEADER.join(','), ...rows].join('\r\n') + '\r\n';
}

export function exportFileName(now: Date): string {
  return `wean-nicotine-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`;
}
