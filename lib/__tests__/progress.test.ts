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
  assessPace,
  calculateWeeklyProgress,
  calculateTotalProgressAndMilestones,
  computePaceAssessment,
  computeUsagePatterns,
  getCurrentWeek,
  getPreviousWeek,
  getUsagePatterns,
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
      logs.push(
        pouchLog(
          new Date(
            `2026-01-05T${String(8 + (i % 12)).padStart(2, '0')}:${String((i * 2) % 60).padStart(2, '0')}:00Z`,
          ),
          i,
        ),
      );
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

  it('dates craving milestones by the day the cumulative count crossed the threshold (#92)', async () => {
    // 2 cravings/day for 10 days starting 20 days ago -> the 10th craving
    // lands on day 5. achievedAt must be that DAY (day-walk semantics,
    // consistent with pouch/money milestones), not a raw log timestamp.
    const start = new Date();
    start.setDate(start.getDate() - 20);
    start.setHours(0, 0, 0, 0);
    const settings = makeSettings({ startDate: start.getTime(), weeklyReductionPercent: 0 });

    const logs: LogEntry[] = [];
    let id = 0;
    for (let d = 0; d < 10; d++) {
      for (let n = 0; n < 2; n++) {
        const t = new Date(start);
        t.setDate(start.getDate() + d);
        t.setHours(10 + n, 30, 0, 0);
        logs.push(cravingLog(t, id++));
      }
    }
    mockedGetLogEntries.mockResolvedValue(logs);

    const { milestones } = await calculateTotalProgressAndMilestones(settings);
    const m = milestones.find((x) => x.id === 'cravings_resisted_10');
    expect(m).toBeDefined();

    const expectedDay = new Date(start);
    expectedDay.setDate(start.getDate() + 4); // day 5 (0-indexed +4)
    const achieved = new Date(m!.achievedAt);
    expect(achieved.getFullYear()).toBe(expectedDay.getFullYear());
    expect(achieved.getMonth()).toBe(expectedDay.getMonth());
    expect(achieved.getDate()).toBe(expectedDay.getDate());
  });
});

describe('computeUsagePatterns', () => {
  function at(hour: number, day: number = 1, trigger?: string): LogEntry {
    const d = new Date(2026, 5, day, hour, 30, 0); // June 2026, local time
    return {
      id: hour * 100 + day,
      type: 'pouch_used',
      timestamp: d.getTime(),
      trigger,
      createdAt: d.getTime(),
    };
  }

  it('buckets pouches into parts of day by local hour', () => {
    const logs = [
      at(6),
      at(9), // morning (5–11)
      at(12),
      at(14),
      at(16), // afternoon (11–17)
      at(18), // evening (17–22)
      at(23),
      at(2, 2), // night (22–5)
    ];
    const result = computeUsagePatterns(logs, 30);

    expect(result.totalPouches).toBe(8);
    expect(result.partsOfDay).toEqual([
      { key: 'morning', label: 'Morning', count: 2 },
      { key: 'afternoon', label: 'Afternoon', count: 3 },
      { key: 'evening', label: 'Evening', count: 1 },
      { key: 'night', label: 'Night', count: 2 },
    ]);
  });

  it('counts triggers most-frequent-first and excludes untagged logs', () => {
    const logs = [
      at(8, 1, 'Stress'),
      at(9, 2, 'Stress'),
      at(10, 3, 'With coffee'),
      at(11, 4), // untagged
    ];
    const result = computeUsagePatterns(logs, 30);

    expect(result.taggedPouches).toBe(3);
    expect(result.triggerCounts).toEqual([
      { trigger: 'Stress', count: 2 },
      { trigger: 'With coffee', count: 1 },
    ]);
  });

  it('breaks trigger-count ties alphabetically for stable ordering', () => {
    const logs = [at(8, 1, 'Work breaks'), at(9, 2, 'After meals')];
    const result = computeUsagePatterns(logs, 30);
    expect(result.triggerCounts.map((t) => t.trigger)).toEqual(['After meals', 'Work breaks']);
  });

  it('ignores craving_resisted entries entirely', () => {
    const d = new Date(2026, 5, 1, 8, 0, 0);
    const logs: LogEntry[] = [
      {
        id: 1,
        type: 'craving_resisted',
        timestamp: d.getTime(),
        trigger: 'Stress',
        createdAt: d.getTime(),
      },
    ];
    const result = computeUsagePatterns(logs, 30);
    expect(result.totalPouches).toBe(0);
    expect(result.taggedPouches).toBe(0);
    expect(result.triggerCounts).toEqual([]);
  });

  it('returns empty buckets for no logs', () => {
    const result = computeUsagePatterns([], 30);
    expect(result.totalPouches).toBe(0);
    expect(result.partsOfDay.every((p) => p.count === 0)).toBe(true);
  });
});

describe('getUsagePatterns', () => {
  beforeEach(() => {
    mockedGetLogEntries.mockReset();
  });

  it('caps the window at the taper start date', async () => {
    // Taper started 5 days ago — a 30-day request should only cover 5 days
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 4);
    const settings = makeSettings({ startDate: start.getTime() });
    mockedGetLogEntries.mockResolvedValue([]);

    const result = await getUsagePatterns(settings, 30);

    expect(result.windowDays).toBe(5);
    const call = mockedGetLogEntries.mock.calls[0][0]!;
    expect(call.type).toBe('pouch_used');
    expect(call.startDate).toBe(start.getTime());
  });

  it('uses the full window when the taper started earlier', async () => {
    const settings = makeSettings({
      startDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
    });
    mockedGetLogEntries.mockResolvedValue([]);

    const result = await getUsagePatterns(settings, 30);
    expect(result.windowDays).toBe(30);
  });
});

describe('computePaceAssessment', () => {
  const day = (allowance: number, used: number) => ({ allowance, used });

  it('flags too-aggressive when usage is 20%+ over allowance across the window', () => {
    // 7 days, allowance 10/day = 70; used 84 = exactly 1.2x
    const days = Array.from({ length: 7 }, () => day(10, 12));
    expect(computePaceAssessment(days).tooAggressive).toBe(true);
  });

  it('does not flag when usage is under the 1.2x threshold', () => {
    // 70 allowance, 80 used = 1.14x — over, but not "consistently 20%+"
    const days = Array.from({ length: 7 }, () => day(10, 80 / 7));
    expect(computePaceAssessment(days).tooAggressive).toBe(false);
  });

  it('requires a minimum sample before ever flagging', () => {
    // 6 days massively over — still no nudge (min is 7 days)
    const days = Array.from({ length: 6 }, () => day(10, 30));
    expect(computePaceAssessment(days).tooAggressive).toBe(false);
  });

  it('never flags when total allowance is zero', () => {
    // End of taper: allowance 0, any usage is "over" but the nudge to
    // slow down makes no sense — that is taper-complete territory (#223).
    const days = Array.from({ length: 14 }, () => day(0, 2));
    expect(computePaceAssessment(days).tooAggressive).toBe(false);
  });

  it('returns totals for transparency', () => {
    const result = computePaceAssessment([day(10, 12), day(9, 11)]);
    expect(result.sampleDays).toBe(2);
    expect(result.totalAllowance).toBe(19);
    expect(result.totalUsed).toBe(23);
  });
});

describe('assessPace', () => {
  beforeEach(() => {
    mockedGetLogEntries.mockReset();
  });

  it('returns an empty assessment when the plan started today', async () => {
    const settings = makeSettings({ startDate: Date.now() });
    const result = await assessPace(settings);
    expect(result.sampleDays).toBe(0);
    expect(result.tooAggressive).toBe(false);
    expect(mockedGetLogEntries).not.toHaveBeenCalled();
  });

  it('excludes today from the window (queries end yesterday)', async () => {
    const settings = makeSettings({
      startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    });
    mockedGetLogEntries.mockResolvedValue([]);

    await assessPace(settings);

    const call = mockedGetLogEntries.mock.calls[0][0]!;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    expect(call.endDate).toBeLessThan(todayStart.getTime());
    expect(call.type).toBe('pouch_used');
  });

  it('flags a consistently-over user with a full window of data', async () => {
    // Flat pace (0% reduction) so allowance = 10/day for the whole window.
    const settings = makeSettings({
      baselinePouchesPerDay: 10,
      weeklyReductionPercent: 0,
      startDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
    });
    // 13 pouches every day for the last 14 complete days = 1.3x allowance
    const logs: LogEntry[] = [];
    let id = 0;
    for (let d = 1; d <= 14; d++) {
      for (let n = 0; n < 13; n++) {
        const t = new Date();
        t.setDate(t.getDate() - d);
        t.setHours(8 + (n % 12), 15, 0, 0);
        logs.push(pouchLog(t, id++));
      }
    }
    mockedGetLogEntries.mockResolvedValue(logs);

    const result = await assessPace(settings);
    expect(result.sampleDays).toBe(14);
    expect(result.tooAggressive).toBe(true);
  });
});
