/**
 * Unit tests for taper-plan.ts
 *
 * Covers the core nicotine reduction math:
 * - Daily allowance calculation (baseline * (1 - r)^weeks)
 * - Default taper plan generation
 * - Edge cases: zero baseline, zero percent, 100% reduction, future dates,
 *   same-day calculation, partial weeks
 */

import { calculateDailyAllowance, generateDefaultTaperPlan } from '../taper-plan';
import type { TaperSettings } from '../models';

function makeSettings(partial: Partial<TaperSettings> = {}): TaperSettings {
  return {
    id: 1,
    baselinePouchesPerDay: 12,
    weeklyReductionPercent: 5,
    startDate: new Date('2026-01-01T00:00:00Z').getTime(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...partial,
  };
}

describe('calculateDailyAllowance', () => {
  describe('day zero (same day as start)', () => {
    it('returns the baseline exactly', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 12 });
      const today = new Date('2026-01-01T00:00:00Z');
      expect(calculateDailyAllowance(settings, today)).toBe(12);
    });

    it('handles fractional baselines', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 7.5 });
      const today = new Date('2026-01-01T00:00:00Z');
      expect(calculateDailyAllowance(settings, today)).toBe(7.5);
    });
  });

  describe('weekly reduction', () => {
    it('reduces by 5% after 1 week', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 12, weeklyReductionPercent: 5 });
      const after1Week = new Date('2026-01-08T00:00:00Z');
      // 12 * 0.95 = 11.4
      expect(calculateDailyAllowance(settings, after1Week)).toBe(11.4);
    });

    it('compounds reductions over multiple weeks', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 12, weeklyReductionPercent: 5 });
      const after4Weeks = new Date('2026-01-29T00:00:00Z');
      // 12 * 0.95^4 ≈ 9.77
      expect(calculateDailyAllowance(settings, after4Weeks)).toBe(9.8);
    });

    it('uses full weeks only (no fractional week reduction)', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 12, weeklyReductionPercent: 5 });
      // 3 days in — still week 0, no reduction yet
      const day3 = new Date('2026-01-04T00:00:00Z');
      expect(calculateDailyAllowance(settings, day3)).toBe(12);
      // 6 days in — still week 0
      const day6 = new Date('2026-01-07T00:00:00Z');
      expect(calculateDailyAllowance(settings, day6)).toBe(12);
      // 7 days in — week 1 starts
      const day7 = new Date('2026-01-08T00:00:00Z');
      expect(calculateDailyAllowance(settings, day7)).toBe(11.4);
    });

    it('handles aggressive 15% weekly reduction', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 10, weeklyReductionPercent: 15 });
      const after1Week = new Date('2026-01-08T00:00:00Z');
      // 10 * 0.85 = 8.5
      expect(calculateDailyAllowance(settings, after1Week)).toBe(8.5);
    });

    it('handles gentle 3% weekly reduction', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 10, weeklyReductionPercent: 3 });
      const after1Week = new Date('2026-01-08T00:00:00Z');
      // 10 * 0.97 = 9.7
      expect(calculateDailyAllowance(settings, after1Week)).toBe(9.7);
    });
  });

  describe('edge cases', () => {
    it('never returns negative allowance even after many weeks', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 12, weeklyReductionPercent: 10 });
      const after100Weeks = new Date('2027-12-01T00:00:00Z');
      const allowance = calculateDailyAllowance(settings, after100Weeks);
      expect(allowance).toBeGreaterThanOrEqual(0);
    });

    it('never exceeds the baseline (safety check against bad inputs)', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 12, weeklyReductionPercent: 0 });
      const after10Weeks = new Date('2026-03-12T00:00:00Z');
      const allowance = calculateDailyAllowance(settings, after10Weeks);
      expect(allowance).toBeLessThanOrEqual(12);
    });

    it('returns 0 when baseline is 0', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 0, weeklyReductionPercent: 5 });
      const today = new Date('2026-01-15T00:00:00Z');
      expect(calculateDailyAllowance(settings, today)).toBe(0);
    });

    it('treats 0% reduction as no reduction', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 10, weeklyReductionPercent: 0 });
      const after4Weeks = new Date('2026-01-29T00:00:00Z');
      expect(calculateDailyAllowance(settings, after4Weeks)).toBe(10);
    });

    it('treats 100% reduction as reaching zero after 1 week', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 10, weeklyReductionPercent: 100 });
      const after1Week = new Date('2026-01-08T00:00:00Z');
      expect(calculateDailyAllowance(settings, after1Week)).toBe(0);
    });

    it('clamps reduction percent above 100 to 100', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 10, weeklyReductionPercent: 150 });
      const after1Week = new Date('2026-01-08T00:00:00Z');
      expect(calculateDailyAllowance(settings, after1Week)).toBe(0);
    });

    it('clamps negative reduction percent to 0', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 10, weeklyReductionPercent: -5 });
      const after4Weeks = new Date('2026-01-29T00:00:00Z');
      expect(calculateDailyAllowance(settings, after4Weeks)).toBe(10);
    });

    it('returns baseline when current date is before start date', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 12, weeklyReductionPercent: 5 });
      const beforeStart = new Date('2025-12-01T00:00:00Z');
      // Negative weeks are clamped to 0, so full baseline returned
      expect(calculateDailyAllowance(settings, beforeStart)).toBe(12);
    });
  });

  describe('rounding', () => {
    it('rounds to 1 decimal place', () => {
      const settings = makeSettings({ baselinePouchesPerDay: 13, weeklyReductionPercent: 7 });
      const after2Weeks = new Date('2026-01-15T00:00:00Z');
      // 13 * 0.93^2 = 11.2437 → 11.2
      const allowance = calculateDailyAllowance(settings, after2Weeks);
      expect(allowance).toBe(11.2);
      // Sanity: no long decimals
      expect(allowance.toString()).toMatch(/^\d+(\.\d)?$/);
    });
  });

  describe('default current date', () => {
    it('uses the current time when no date is provided', () => {
      const settings = makeSettings({
        baselinePouchesPerDay: 12,
        weeklyReductionPercent: 5,
        startDate: Date.now(),
      });
      // At start date with default "now", allowance should equal baseline
      expect(calculateDailyAllowance(settings)).toBe(12);
    });
  });
});

describe('generateDefaultTaperPlan', () => {
  it('uses 5% as the default weekly reduction', () => {
    const plan = generateDefaultTaperPlan(12);
    expect(plan.weeklyReductionPercent).toBe(5);
    expect(plan.baselinePouchesPerDay).toBe(12);
  });

  it('accepts a custom weekly reduction', () => {
    const plan = generateDefaultTaperPlan(10, 10);
    expect(plan.weeklyReductionPercent).toBe(10);
    expect(plan.baselinePouchesPerDay).toBe(10);
  });

  it('sets startDate to now (within a few seconds)', () => {
    const before = Date.now();
    const plan = generateDefaultTaperPlan(12);
    const after = Date.now();
    expect(plan.startDate).toBeGreaterThanOrEqual(before);
    expect(plan.startDate).toBeLessThanOrEqual(after);
  });
});
