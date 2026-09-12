/**
 * Unit tests for cost-savings.ts.
 *
 * Covers:
 * - empty log set (no pouches used)
 * - partial days (some pouches used, some avoided)
 * - over-baseline days (clamped to 0 avoided, no negative savings)
 * - missing pricePerCan (zero pricePerPouch → zero savings)
 * - daily rate and projected monthly extrapolation
 * - week and month grouping
 */

import type { LogEntry, TaperSettings } from '../models';

jest.mock('../db-log-entries', () => ({
  getLogEntries: jest.fn(),
}));

import { getLogEntries } from '../db-log-entries';
import { calculateCostSavings } from '../cost-savings';

const mockedGetLogEntries = getLogEntries as jest.MockedFunction<typeof getLogEntries>;

// Note: cost-savings stores pricePerCan as the raw user-entered currency
// amount (the variable named `pricePerPouch * cents` in the source is
// misleading — there is no cents conversion). Tests use round numbers so the
// math is obvious: pricePerCan=20 → pricePerPouch=1.0, baseline=10 →
// 10 currency units saved per fully-avoided day.
function makeSettings(partial: Partial<TaperSettings> = {}): TaperSettings {
  return {
    id: 1,
    baselinePouchesPerDay: 10,
    weeklyReductionPercent: 5,
    pricePerCan: 20, // 20 / 20 = 1.0 per pouch
    currency: 'DKK',
    startDate: new Date('2026-01-01T00:00:00Z').getTime(),
    triggers: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...partial,
  } as TaperSettings;
}

function pouchLog(timestamp: Date, id = 0): LogEntry {
  return {
    id,
    type: 'pouch_used',
    timestamp: timestamp.getTime(),
    createdAt: timestamp.getTime(),
  };
}

/**
 * A resisted craving with no pouch on the same day. This is how a genuine
 * zero-pouch day is evidenced: the user was present and logged something,
 * they just did not use a pouch (#320).
 */
function resistedLog(timestamp: Date, id = 0): LogEntry {
  return {
    id,
    type: 'craving_resisted',
    timestamp: timestamp.getTime(),
    createdAt: timestamp.getTime(),
  };
}

/** One resisted-craving entry per day across the given range, inclusive. */
function coverDays(from: Date, to: Date, startId = 1000): LogEntry[] {
  const out: LogEntry[] = [];
  const d = new Date(from);
  d.setHours(9, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  let id = startId;
  while (d <= end) {
    out.push(resistedLog(new Date(d), id++));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

beforeEach(() => {
  mockedGetLogEntries.mockReset();
});

describe('calculateCostSavings', () => {
  it('returns zeroes when pricePerCan is missing', async () => {
    mockedGetLogEntries.mockResolvedValue([]);
    const result = await calculateCostSavings(
      makeSettings({ pricePerCan: undefined, startDate: Date.now() - 24 * 60 * 60 * 1000 }),
    );
    expect(result.totalSaved).toBe(0);
    expect(result.dailyRate).toBe(0);
    expect(result.projectedMonthlySaving).toBe(0);
  });

  it('counts an evidenced zero-pouch day as baseline × pricePerPouch', async () => {
    // Start = yesterday. Both days carry a resisted-craving entry and no
    // pouches, so both are known zero-use days → 10 avoided each.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    mockedGetLogEntries.mockResolvedValue(coverDays(yesterday, new Date()));
    const result = await calculateCostSavings(makeSettings({ startDate: yesterday.getTime() }));

    // 2 days × 10 avoided × 1.0 = 20 currency units
    expect(result.totalSaved).toBe(20);
    expect(result.daysWithData).toBe(2);
    expect(result.daysWithoutData).toBe(0);
  });

  it('credits nothing for days with no entries at all (#320)', async () => {
    // A week in the plan, not a single log. Previously this reported the
    // maximum possible saving; missing data is not evidence of zero use.
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    mockedGetLogEntries.mockResolvedValue([]);
    const result = await calculateCostSavings(makeSettings({ startDate: start.getTime() }));

    expect(result.totalSaved).toBe(0);
    expect(result.dailyRate).toBe(0);
    expect(result.projectedMonthlySaving).toBe(0);
    expect(result.daysWithData).toBe(0);
    expect(result.daysWithoutData).toBe(7);
  });

  it('counts only the evidenced days when the log has gaps (#320)', async () => {
    // 4-day window; only the first and last day have any entries.
    const start = new Date();
    start.setDate(start.getDate() - 3);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    const first = new Date(start);
    first.setHours(9, 0, 0, 0);

    mockedGetLogEntries.mockResolvedValue([resistedLog(first, 1), resistedLog(today, 2)]);
    const result = await calculateCostSavings(makeSettings({ startDate: start.getTime() }));

    // 2 known days × 10 avoided × 1.0, and the two silent days contribute nothing.
    expect(result.totalSaved).toBe(20);
    expect(result.daysWithData).toBe(2);
    expect(result.daysWithoutData).toBe(2);
    // The rate is per day WITH data, so it is not diluted by the gaps.
    expect(result.dailyRate).toBe(10);
  });

  it('clamps over-baseline usage to zero avoided (no negative savings)', async () => {
    const today = new Date();
    today.setHours(8, 0, 0, 0);

    // 15 pouches used today, baseline = 10 → 0 avoided (not -5)
    const logs = Array.from({ length: 15 }, (_, i) =>
      pouchLog(new Date(today.getTime() + i * 60_000), i + 1),
    );
    mockedGetLogEntries.mockResolvedValue(logs);

    const result = await calculateCostSavings(makeSettings({ startDate: today.getTime() }));

    expect(result.totalSaved).toBe(0);
    expect(result.dailyRate).toBe(0);
  });

  it('credits partial-day avoidance: baseline 10 − used 4 = 6 avoided', async () => {
    const today = new Date();
    today.setHours(8, 0, 0, 0);

    const logs = Array.from({ length: 4 }, (_, i) =>
      pouchLog(new Date(today.getTime() + i * 60_000), i + 1),
    );
    mockedGetLogEntries.mockResolvedValue(logs);

    const result = await calculateCostSavings(makeSettings({ startDate: today.getTime() }));

    // 6 avoided × 1.0 = 6 currency units
    expect(result.totalSaved).toBe(6);
  });

  it('exposes daily rate and projects it to a 30-day month', async () => {
    const start = new Date();
    start.setDate(start.getDate() - 3); // 4-day window incl. today
    start.setHours(0, 0, 0, 0);

    mockedGetLogEntries.mockResolvedValue(coverDays(start, new Date()));
    const result = await calculateCostSavings(makeSettings({ startDate: start.getTime() }));

    // 4 days × 10 avoided × 1.0 = 40 currency units
    expect(result.totalSaved).toBe(40);
    // daily rate = 40 / 4 = 10
    expect(result.dailyRate).toBe(10);
    // projected month = dailyRate × 30 = 300
    expect(result.projectedMonthlySaving).toBe(300);
  });

  it('groups savings by week and month labels', async () => {
    // 14-day window means at least 2 weeks worth of buckets
    const start = new Date();
    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);

    mockedGetLogEntries.mockResolvedValue(coverDays(start, new Date()));
    const result = await calculateCostSavings(makeSettings({ startDate: start.getTime() }));

    expect(result.weeklySavings.length).toBeGreaterThanOrEqual(2);
    expect(result.monthlySavings.length).toBeGreaterThanOrEqual(1);
    // Each weekly entry sums to a positive saved amount (no zero-day artifacts)
    for (const w of result.weeklySavings) {
      expect(w.saved).toBeGreaterThan(0);
    }
  });

  it('passes the correct time window to getLogEntries', async () => {
    const start = new Date('2026-01-01T00:00:00Z');
    mockedGetLogEntries.mockResolvedValue([]);

    await calculateCostSavings(makeSettings({ startDate: start.getTime() }));

    expect(mockedGetLogEntries).toHaveBeenCalledTimes(1);
    const call = mockedGetLogEntries.mock.calls[0][0];
    // All types now, because a resisted craving is what evidences a zero day (#320).
    expect(call?.type).toBeUndefined();
    expect(typeof call?.startDate).toBe('number');
    expect(typeof call?.endDate).toBe('number');
    expect(call!.endDate as number).toBeGreaterThan(call!.startDate as number);
  });
});
