/**
 * Tests for the capture-mode sample month (#396).
 *
 * The site's screenshots must show numbers the app really computes (#338), on
 * a calm month: every day under its allowance, today well under, enough
 * pouches for Patterns, and no day left without an entry (an unlogged day is
 * an unknown one since #320, and Progress would say so).
 */

import { buildCaptureData, CAPTURE_PLAN, CAPTURE_TODAY_SO_FAR } from '../capture-mode';
import type { TaperSettings } from '../models';
import { calculateDailyAllowance, getDisplayAllowance } from '../taper-plan';

const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

function check(now: Date) {
  const { settings, entries } = buildCaptureData(now);
  const plan = settings as TaperSettings;
  const byDay = new Map<string, { used: number; any: number; date: Date }>();
  for (const e of entries) {
    const k = dayKey(e.timestamp);
    const v = byDay.get(k) ?? { used: 0, any: 0, date: new Date(e.timestamp) };
    v.any++;
    if (e.type === 'pouch_used') v.used++;
    byDay.set(k, v);
  }
  return { settings, entries, plan, byDay };
}

describe('buildCaptureData', () => {
  const now = new Date(2026, 9, 12, 14, 0);

  it("uses the site's example plan, four weeks in, so today allows 6", () => {
    const { settings, plan } = check(now);
    expect(settings.baselinePouchesPerDay).toBe(CAPTURE_PLAN.baselinePouchesPerDay);
    expect(settings.weeklyReductionPercent).toBe(CAPTURE_PLAN.weeklyReductionPercent);
    expect(getDisplayAllowance(calculateDailyAllowance(plan, now))).toBe(6);
  });

  it('keeps every day under its allowance, and today well under even after one more tap', () => {
    const { plan, byDay } = check(now);
    for (const { used, date } of byDay.values()) {
      expect(used).toBeLessThan(getDisplayAllowance(calculateDailyAllowance(plan, date)));
    }
    const today = byDay.get(dayKey(now.getTime()));
    expect(today?.used).toBe(CAPTURE_TODAY_SO_FAR);
    expect(CAPTURE_TODAY_SO_FAR + 1).toBeLessThan(6);
  });

  it('logs something on every day from the start to today, so no day reads as unknown', () => {
    const { settings, byDay } = check(now);
    const day = new Date(settings.startDate);
    while (day.getTime() <= now.getTime()) {
      expect(byDay.has(dayKey(day.getTime()))).toBe(true);
      day.setDate(day.getDate() + 1);
    }
  });

  it('has enough pouches for Patterns and tags only the plan triggers', () => {
    const { entries } = check(now);
    const monthAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    const recent = entries.filter((e) => e.type === 'pouch_used' && e.timestamp >= monthAgo);
    expect(recent.length).toBeGreaterThanOrEqual(10);
    for (const e of entries) {
      if (e.trigger) expect(CAPTURE_PLAN.triggers).toContain(e.trigger);
    }
  });

  it('never logs in the future, even when captured early in the morning', () => {
    const early = new Date(2026, 9, 12, 6, 30);
    const { entries } = check(early);
    for (const e of entries) expect(e.timestamp).toBeLessThanOrEqual(early.getTime());
  });

  it('holds across the spring clock change', () => {
    const { plan, byDay } = check(new Date(2026, 3, 10, 12, 0));
    for (const { used, date } of byDay.values()) {
      expect(used).toBeLessThan(getDisplayAllowance(calculateDailyAllowance(plan, date)) + 1);
    }
  });
});
