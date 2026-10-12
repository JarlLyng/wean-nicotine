/**
 * Capture mode, for the marketing site's screenshots and the Today loop (#396).
 *
 * Fills the database with a calm sample month so the screens show numbers the
 * app really computes (#338), not hand-made ones: a 10-a-day plan at 10% a
 * week (the site's staircase example), four weeks in, every day under its
 * allowance, a few cravings let pass and a few triggers tagged, so Today,
 * Progress and Patterns all have something true to show. Nothing in it reads
 * as a streak, and no day is over, so nothing turns red.
 *
 * It only runs in a build made with the `capture` EAS profile, which sets
 * extra.captureMode through app.config.js. A production build cannot set it,
 * and the seed replaces everything on the device, so never install a capture
 * build on a phone that holds a real plan.
 */
import Constants from 'expo-constants';
import type { LogEntryType, TaperSettings } from './models';
import { calculateDailyAllowance, getDisplayAllowance } from './taper-plan';

export const CAPTURE_MODE: boolean = Constants.expoConfig?.extra?.captureMode === true;

/** The site's staircase example: 10 a day at 10% a week. */
export const CAPTURE_PLAN = {
  baselinePouchesPerDay: 10,
  weeklyReductionPercent: 10,
  pricePerCan: 5000, // 50 kr, in øre
  currency: 'DKK' as const,
  triggers: ['Coffee', 'After meals', 'Stress'],
};

/** Days since the plan started; 30 puts today in week 4, at 6 a day. */
const DAYS_IN = 30;

/** Pouches already logged today, so the loop's one tap lands well under the allowance. */
export const CAPTURE_TODAY_SO_FAR = 2;

export interface CaptureEntry {
  type: LogEntryType;
  timestamp: number;
  trigger?: string;
}

export interface CaptureData {
  settings: Omit<TaperSettings, 'id' | 'createdAt' | 'updatedAt'>;
  entries: CaptureEntry[];
}

const at = (day: Date, hours: number, minutes: number) => {
  const d = new Date(day);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
};

/** Morning, afternoon and evening slots, each with the trigger that fits it. */
const SLOTS: { h: number; m: number; trigger?: string }[] = [
  { h: 8, m: 5, trigger: 'Coffee' },
  { h: 10, m: 40 },
  { h: 13, m: 15, trigger: 'After meals' },
  { h: 15, m: 50 },
  { h: 18, m: 20, trigger: 'Stress' },
  { h: 20, m: 45 },
  { h: 12, m: 30 },
  { h: 17, m: 10 },
  { h: 21, m: 30 },
];

export function buildCaptureData(now: Date = new Date()): CaptureData {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - DAYS_IN);

  const settings = { ...CAPTURE_PLAN, startDate: start.getTime() };
  const plan = settings as TaperSettings;
  const entries: CaptureEntry[] = [];

  for (let i = 0; i < DAYS_IN; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const allowance = getDisplayAllowance(calculateDailyAllowance(plan, day));
    // One or two under the allowance, never over: a calm month.
    const used = Math.max(0, allowance - 1 - (i % 3 === 0 ? 1 : 0));
    for (let p = 0; p < used; p++) {
      const slot = SLOTS[p % SLOTS.length];
      entries.push({
        type: 'pouch_used',
        timestamp: at(day, slot.h, slot.m),
        // Tag about a third of them; tagging is optional in the app.
        trigger: i % 3 !== 1 ? slot.trigger : undefined,
      });
    }
    if (i % 2 === 0) entries.push({ type: 'craving_resisted', timestamp: at(day, 16, 30) });
  }

  // Today so far: early, and never later than now.
  const latest = now.getTime() - 60_000;
  entries.push({ type: 'craving_resisted', timestamp: Math.min(at(today, 7, 10), latest) });
  for (let p = 0; p < CAPTURE_TODAY_SO_FAR; p++) {
    const slot = SLOTS[p];
    entries.push({
      type: 'pouch_used',
      timestamp: Math.min(at(today, slot.h - 1, slot.m), latest),
      trigger: slot.trigger,
    });
  }

  return { settings, entries };
}
