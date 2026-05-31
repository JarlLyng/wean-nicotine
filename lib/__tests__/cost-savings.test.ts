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

  it('counts a fully-avoided day as baseline × pricePerPouch', async () => {
    // Start = yesterday, no pouches used → 10 avoided
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    mockedGetLogEntries.mockResolvedValue([]);
    const result = await calculateCostSavings(
      makeSettings({ startDate: yesterday.getTime() }),
    );

    // 2 days × 10 avoided × 1.0 = 20 currency units
    expect(result.totalSaved).toBe(20);
  });

  it('clamps over-baseline usage to zero avoided (no negative savings)', async () => {
    const today = new Date();
    today.setHours(8, 0, 0, 0);

    // 15 pouches used today, baseline = 10 → 0 avoided (not -5)
    const logs = Array.from({ length: 15 }, (_, i) =>
      pouchLog(new Date(today.getTime() + i * 60_000), i + 1),
    );
    mockedGetLogEntries.mockResolvedValue(logs);

    const result = await calculateCostSavings(
      makeSettings({ startDate: today.getTime() }),
    );

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

    const result = await calculateCostSavings(
      makeSettings({ startDate: today.getTime() }),
    );

    // 6 avoided × 1.0 = 6 currency units
    expect(result.totalSaved).toBe(6);
  });

  it('exposes daily rate and projects it to a 30-day month', async () => {
    const start = new Date();
    start.setDate(start.getDate() - 3); // 4-day window incl. today
    start.setHours(0, 0, 0, 0);

    mockedGetLogEntries.mockResolvedValue([]);
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

    mockedGetLogEntries.mockResolvedValue([]);
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
    expect(call?.type).toBe('pouch_used');
    expect(typeof call?.startDate).toBe('number');
    expect(typeof call?.endDate).toBe('number');
    expect(call!.endDate as number).toBeGreaterThan(call!.startDate as number);
  });
});
