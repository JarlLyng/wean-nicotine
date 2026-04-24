/**
 * Unit tests for progress.ts
 *
 * Covers:
 * - getCurrentWeek / getPreviousWeek (week boundary calculation)
 * - calculateWeeklyProgress (baseline vs actual, avoided count, days under/over)
 * - calculateTotalProgressAndMilestones (cumulative totals, milestone detection)
 *
 * Mocks the DB layer (getLogEntries) so tests can run without SQLite.
 */

import type { LogEntry, TaperSettings } from '../models';

// Mock the DB module BEFORE importing progress.ts
jest.mock('../db-log-entries', () => ({
  getLogEntries: jest.fn(),
}));

import { getLogEntries } from '../db-log-entries';
import {
  calculateWeeklyProgress,
  calculateTotalProgressAndMilestones,
  getCurrentWeek,
  getPreviousWeek,
} from '../progress';

const mockedGetLogEntries = getLogEntries as jest.MockedFunction<typeof getLogEntries>;

function makeSettings(partial: Partial<TaperSettings> = {}): TaperSettings {
  return {
    id: 1,
    baselinePouchesPerDay: 10,
    weeklyReductionPercent: 5,
    startDate: new Date('2026-01-01T00:00:00Z').getTime(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...partial,
  };
}

function pouchLog(timestamp: Date, id: number = 0): LogEntry {
  return {
    id,
    type: 'pouch_used',
    timestamp: timestamp.getTime(),
    createdAt: timestamp.getTime(),
  };
}

function cravingLog(timestamp: Date, id: number = 0): LogEntry {
  return {
    id,
    type: 'craving_resisted',
    timestamp: timestamp.getTime(),
    createdAt: timestamp.getTime(),
  };
}

beforeEach(() => {
  mockedGetLogEntries.mockReset();
});

describe('getCurrentWeek', () => {
  it('returns a 7-day span ending Sunday', () => {
    const { start, end } = getCurrentWeek();
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    // 7-day span is slightly less than 7.0 because end is 23:59:59 on Sun vs 00:00 on Mon
    expect(diffDays).toBeCloseTo(6.999, 2);
  });

  it('uses Monday-based weeks (Nordic convention)', () => {
    const { start } = getCurrentWeek();
    expect(start.getDay()).toBe(1); // Monday
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });
});

describe('getPreviousWeek', () => {
  it('starts 7 days before the current week start', () => {
    const current = getCurrentWeek();
    const previous = getPreviousWeek();
    const diffDays = (current.start.getTime() - previous.start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(7);
  });

  it('also uses Monday-based weeks', () => {
    const { start } = getPreviousWeek();
    expect(start.getDay()).toBe(1);
  });
});

describe('calculateWeeklyProgress', () => {
  it('returns empty progress when the week is entirely before the start date', async () => {
    const settings = makeSettings({ startDate: new Date('2026-02-01T00:00:00Z').getTime() });
    mockedGetLogEntries.mockResolvedValue([]);

    const weekStart = new Date('2026-01-05T00:00:00Z');
    const weekEnd = new Date('2026-01-11T23:59:59Z');
    const result = await calculateWeeklyProgress(settings, weekStart, weekEnd);

    expect(result.baselineTotal).toBe(0);
    expect(result.actualUsed).toBe(0);
    expect(result.pouchesAvoided).toBe(0);
  });

  it('calculates baseline, actual use, and avoided count', async () => {
    const settings = makeSettings({ baselinePouchesPerDay: 10 });
    mockedGetLogEntries.mockResolvedValue([
      pouchLog(new Date('2026-01-05T10:00:00Z')),
      pouchLog(new Date('2026-01-05T14:00:00Z')),
      pouchLog(new Date('2026-01-06T09:00:00Z')),
    ]);

    const weekStart = new Date('2026-01-05T00:00:00Z');
    const weekEnd = new Date('2026-01-11T23:59:59Z');
    const result = await calculateWeeklyProgress(settings, weekStart, weekEnd);

    // Baseline = 10/day * days in effective range (week end may be capped to today)
    expect(result.baselineTotal).toBeGreaterThan(0);
    expect(result.actualUsed).toBe(3);
    expect(result.pouchesAvoided).toBe(result.baselineTotal - 3);
  });

  it('counts cravings resisted separately from pouches used', async () => {
    const settings = makeSettings({ baselinePouchesPerDay: 10 });
    mockedGetLogEntries.mockResolvedValue([
      pouchLog(new Date('2026-01-05T10:00:00Z')),
      cravingLog(new Date('2026-01-05T11:00:00Z')),
      cravingLog(new Date('2026-01-05T15:00:00Z')),
    ]);

    const weekStart = new Date('2026-01-05T00:00:00Z');
    const weekEnd = new Date('2026-01-11T23:59:59Z');
    const result = await calculateWeeklyProgress(settings, weekStart, weekEnd);

    expect(result.actualUsed).toBe(1);
    expect(result.cravingsResisted).toBe(2);
  });

  it('does not let pouchesAvoided go negative when usage exceeds baseline', async () => {
    const settings = makeSettings({ baselinePouchesPerDay: 2 });
    // 10 pouches logged across a week — way over a 2/day baseline
    const logs: LogEntry[] = [];
    for (let i = 0; i < 30; i++) {
      logs.push(pouchLog(new Date(`2026-01-05T${String(8 + (i % 12)).padStart(2, '0')}:${String(i * 2 % 60).padStart(2, '0')}:00Z`), i));
    }
    mockedGetLogEntries.mockResolvedValue(logs);

    const weekStart = new Date('2026-01-05T00:00:00Z');
    const weekEnd = new Date('2026-01-11T23:59:59Z');
    const result = await calculateWeeklyProgress(settings, weekStart, weekEnd);

    expect(result.pouchesAvoided).toBeGreaterThanOrEqual(0);
  });

  it('calculates money saved when pricePerCan is set', async () => {
    const settings = makeSettings({
      baselinePouchesPerDay: 20, // 1 can/day
      pricePerCan: 5000, // 50.00 in cents
    });
    mockedGetLogEntries.mockResolvedValue([]);

    // Full week, no logs: avoided = 20 * 7 = 140 pouches = 7 cans = 35000 cents
    // (using local-midnight dates to stay timezone-safe)
    const weekStart = new Date('2026-01-05T00:00:00');
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date('2026-01-11T23:59:59');
    weekEnd.setHours(23, 59, 59, 999);
    const result = await calculateWeeklyProgress(settings, weekStart, weekEnd);

    expect(result.moneySaved).toBeGreaterThan(0);
    // Exactly 7 days in the week
    expect(result.moneySaved).toBe(35000);
  });

  it('does not calculate money saved when pricePerCan is missing', async () => {
    const settings = makeSettings({ baselinePouchesPerDay: 20 });
    mockedGetLogEntries.mockResolvedValue([]);

    const weekStart = new Date('2026-01-05T00:00:00Z');
    const weekEnd = new Date('2026-01-11T23:59:59Z');
    const result = await calculateWeeklyProgress(settings, weekStart, weekEnd);

    expect(result.moneySaved).toBeUndefined();
  });
});

describe('calculateTotalProgressAndMilestones', () => {
  it('returns zero totals when there are no logs and no elapsed time', async () => {
    // Start = today, so no days elapsed, no pouches avoided yet
    const settings = makeSettings({ startDate: Date.now() });
    mockedGetLogEntries.mockResolvedValue([]);

    const { progress, milestones } = await calculateTotalProgressAndMilestones(settings);

    expect(progress.totalCravingsResisted).toBe(0);
    expect(progress.totalPouchesAvoided).toBeLessThan(100); // no threshold milestones hit
    expect(milestones.filter((m) => m.type === 'pouches_avoided')).toHaveLength(0);
    expect(milestones.filter((m) => m.type === 'cravings_resisted')).toHaveLength(0);
  });

  it('detects the "first day under limit" milestone', async () => {
    const settings = makeSettings({
      baselinePouchesPerDay: 10,
      weeklyReductionPercent: 0, // no reduction so allowance stays at 10
      startDate: new Date('2026-01-01T00:00:00Z').getTime(),
    });
    // 5 pouches on day 1 — well under the 10 allowance
    const logs = [
      pouchLog(new Date('2026-01-01T09:00:00Z'), 1),
      pouchLog(new Date('2026-01-01T10:00:00Z'), 2),
      pouchLog(new Date('2026-01-01T11:00:00Z'), 3),
      pouchLog(new Date('2026-01-01T12:00:00Z'), 4),
      pouchLog(new Date('2026-01-01T13:00:00Z'), 5),
    ];
    mockedGetLogEntries.mockResolvedValue(logs);

    const { milestones } = await calculateTotalProgressAndMilestones(settings);
    const firstDayMilestone = milestones.find((m) => m.id === 'first_day_under_limit');

    expect(firstDayMilestone).toBeDefined();
    expect(firstDayMilestone?.type).toBe('first_day_under_limit');
  });

  it('detects pouches-avoided threshold milestones', async () => {
    // Baseline = 10/day, startDate 200 days ago, no logs → avoided = 2000 pouches
    const twoHundredDaysAgo = new Date();
    twoHundredDaysAgo.setDate(twoHundredDaysAgo.getDate() - 200);
    const settings = makeSettings({
      baselinePouchesPerDay: 10,
      weeklyReductionPercent: 0,
      startDate: twoHundredDaysAgo.getTime(),
    });
    mockedGetLogEntries.mockResolvedValue([]);

    const { milestones } = await calculateTotalProgressAndMilestones(settings);
    const thresholdIds = milestones.map((m) => m.id);

    expect(thresholdIds).toContain('pouches_avoided_100');
    expect(thresholdIds).toContain('pouches_avoided_500');
    expect(thresholdIds).toContain('pouches_avoided_1000');
  });

  it('detects cravings-resisted threshold milestones', async () => {
    const settings = makeSettings({
      baselinePouchesPerDay: 10,
      weeklyReductionPercent: 0,
      startDate: new Date().getTime() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    });
    const logs: LogEntry[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (30 - i));
      logs.push(cravingLog(d, i));
    }
    mockedGetLogEntries.mockResolvedValue(logs);

    const { milestones } = await calculateTotalProgressAndMilestones(settings);
    const craving10 = milestones.find((m) => m.id === 'cravings_resisted_10');
    const craving25 = milestones.find((m) => m.id === 'cravings_resisted_25');

    expect(craving10).toBeDefined();
    expect(craving25).toBeDefined();
  });
});
