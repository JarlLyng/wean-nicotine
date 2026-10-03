/**
 * Tests for the CSV export (#43).
 *
 * The file goes to people's spreadsheets and maybe their doctor, and later
 * back into the app (#224), so the shape, order and escaping have to hold.
 */

import { buildLogCsv, CSV_HEADER, exportFileName } from '../export-csv';
import type { LogEntry } from '../models';

const entry = (id: number, iso: string, type: LogEntry['type'], trigger?: string): LogEntry => ({
  id,
  type,
  timestamp: Date.parse(iso),
  trigger,
  createdAt: Date.parse(iso),
});

/** Split CRLF rows, then fields, honouring quotes. */
function parse(csv: string): string[][] {
  return csv
    .split('\r\n')
    .filter(Boolean)
    .map((line) => {
      const out: string[] = [];
      let cur = '';
      let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (quoted && c === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (c === '"') quoted = !quoted;
        else if (c === ',' && !quoted) {
          out.push(cur);
          cur = '';
        } else cur += c;
      }
      out.push(cur);
      return out;
    });
}

describe('buildLogCsv', () => {
  it('writes the header and one row per entry, oldest first', () => {
    const csv = buildLogCsv([
      entry(2, '2026-09-21T18:30:00.000Z', 'craving_resisted'),
      entry(1, '2026-09-21T07:05:00.000Z', 'pouch_used', 'Coffee'),
    ]);
    const rows = parse(csv);
    expect(rows[0]).toEqual([...CSV_HEADER]);
    expect(rows).toHaveLength(3);
    expect(rows[1][2]).toBe('pouch_used');
    expect(rows[1][3]).toBe('Coffee');
    expect(rows[1][4]).toBe('2026-09-21T07:05:00.000Z');
    expect(rows[2][2]).toBe('craving_resisted');
    expect(rows[2][3]).toBe('');
  });

  it('gives local date and time that match the timestamp', () => {
    const iso = '2026-09-21T07:05:00.000Z';
    const [, row] = parse(buildLogCsv([entry(1, iso, 'pouch_used')]));
    const d = new Date(iso);
    expect(row[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(row[1]).toMatch(/^\d{2}:\d{2}$/);
    expect(Number(row[0].slice(8))).toBe(d.getDate());
    expect(Number(row[1].slice(0, 2))).toBe(d.getHours());
    expect(Number(row[1].slice(3))).toBe(d.getMinutes());
  });

  it('quotes triggers with commas, quotes or line breaks and keeps them intact', () => {
    const tricky = 'After work, "with friends"\nlate';
    const csv = buildLogCsv([entry(1, '2026-09-21T07:05:00.000Z', 'pouch_used', tricky)]);
    expect(parse(csv)[1][3]).toBe(tricky);
  });

  it('uses CRLF line endings and ends with one', () => {
    const csv = buildLogCsv([entry(1, '2026-09-21T07:05:00.000Z', 'pouch_used')]);
    expect(csv.endsWith('\r\n')).toBe(true);
    expect(csv.split('\r\n')).toHaveLength(3);
  });

  it('is just the header when there is nothing logged', () => {
    expect(buildLogCsv([])).toBe(`${CSV_HEADER.join(',')}\r\n`);
  });
});

describe('exportFileName', () => {
  it('names the file after the local date', () => {
    expect(exportFileName(new Date(2026, 9, 4, 23, 59))).toBe('wean-nicotine-2026-10-04.csv');
  });
});
