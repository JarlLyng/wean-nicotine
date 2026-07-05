/**
 * Progress calculation utilities (Wean Nicotine)
 */

import type { TaperSettings, LogEntry } from './models';
import { getLogEntries } from './db-log-entries';
import { calculateDailyAllowance } from './taper-plan';
import { formatMoney } from './currency';
import {
  CRAVING_MILESTONE_THRESHOLDS,
  MONEY_MILESTONE_THRESHOLDS,
  PACE_NUDGE_MIN_DAYS,
  PACE_NUDGE_OVER_FACTOR,
  PACE_NUDGE_WINDOW_DAYS,
  POUCH_MILESTONE_THRESHOLDS,
  POUCHES_PER_CAN,
} from './constants';

function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export interface WeeklyProgress {
  weekStart: Date;
  weekEnd: Date;
  baselineTotal: number;
  actualUsed: number;
  pouchesAvoided: number;
  cravingsResisted: number;
  moneySaved?: number; // in cents
  daysUnderLimit: number;
  daysOverLimit: number;
}

export interface Milestone {
  id: string;
  type:
    | 'first_day_under_limit'
    | 'week_under_limit'
    | 'pouches_avoided'
    | 'money_saved'
    | 'cravings_resisted';
  title: string;
  description: string;
  achievedAt: number;
  value?: number; // e.g., pouches avoided, money saved
}

/**
 * Calculate weekly progress
 */
export async function calculateWeeklyProgress(
  settings: TaperSettings,
  weekStart: Date,
  weekEnd: Date,
): Promise<WeeklyProgress> {
  // Ensure we only use dates from after the taper start date
  const settingsStartDate = new Date(settings.startDate);
  settingsStartDate.setHours(0, 0, 0, 0);

  // If the week is entirely before the start date, return empty progress
  if (weekEnd < settingsStartDate) {
    return {
      weekStart,
      weekEnd,
      baselineTotal: 0,
      actualUsed: 0,
      pouchesAvoided: 0,
      cravingsResisted: 0,
      daysUnderLimit: 0,
      daysOverLimit: 0,
    };
  }

  // Only calculate from startDate onwards, and only up to today
  const effectiveStart = weekStart < settingsStartDate ? settingsStartDate : weekStart;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const effectiveEnd = weekEnd > today ? today : weekEnd;

  // If effective start is after effective end, return empty progress
  if (effectiveEnd < effectiveStart) {
    return {
      weekStart,
      weekEnd,
      baselineTotal: 0,
      actualUsed: 0,
      pouchesAvoided: 0,
      cravingsResisted: 0,
      moneySaved: 0,
      daysUnderLimit: 0,
      daysOverLimit: 0,
    };
  }

  const logs = await getLogEntries({
    startDate: effectiveStart.getTime(),
    endDate: effectiveEnd.getTime(),
  });

  const usedLogs = logs.filter((log) => log.type === 'pouch_used');
  const actualUsed = usedLogs.length;
  const resistedLogs = logs.filter((log) => log.type === 'craving_resisted');
  const cravingsResisted = resistedLogs.length;

  // Calculate baseline for the week (only count days from start date to today)
  // Count actual days, not just time difference
  const days = getDaysInRange(effectiveStart, effectiveEnd);
  const daysInWeek = days.length;
  const baselineTotal = settings.baselinePouchesPerDay * daysInWeek;
  const pouchesAvoided = Math.max(0, baselineTotal - actualUsed);

  // Calculate money saved (if price is set)
  let moneySaved: number | undefined;
  if (settings.pricePerCan) {
    const cansAvoided = pouchesAvoided / POUCHES_PER_CAN;
    moneySaved = Math.round(cansAvoided * settings.pricePerCan);
  }

  // Count days under/over limit (only from effective start)
  // Pre-group logs by day for O(1) lookup
  const logsByDay = new Map<string, number>();
  for (const log of usedLogs) {
    const dayKey = toDayKey(new Date(log.timestamp));
    logsByDay.set(dayKey, (logsByDay.get(dayKey) || 0) + 1);
  }

  let daysUnderLimit = 0;
  let daysOverLimit = 0;

  for (const day of days) {
    const dayAllowance = calculateDailyAllowance(settings, day);
    const dayKey = toDayKey(day);
    const dayUsed = logsByDay.get(dayKey) || 0;

    if (dayUsed <= dayAllowance) {
      daysUnderLimit++;
    } else {
      daysOverLimit++;
    }
  }

  return {
    weekStart,
    weekEnd,
    baselineTotal,
    actualUsed,
    pouchesAvoided,
    cravingsResisted,
    moneySaved,
    daysUnderLimit,
    daysOverLimit,
  };
}

/**
 * Get all days in a date range
 */
function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export interface TotalProgress {
  totalPouchesAvoided: number;
  totalCravingsResisted: number;
  totalMoneySaved?: number;
  daysSinceStart: number;
  averageDailyUsage: number;
}

/**
 * Calculate total progress and detect milestones in a single DB query + single pass.
 * Previously these were two separate functions each querying the DB independently.
 */
export async function calculateTotalProgressAndMilestones(
  settings: TaperSettings,
): Promise<{ progress: TotalProgress; milestones: Milestone[] }> {
  const startDate = new Date(settings.startDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Single DB query for all logs since start
  const logs = await getLogEntries({
    startDate: startDate.getTime(),
    endDate: today.getTime(),
  });

  // Partition and sort logs in one pass
  const usedLogs: LogEntry[] = [];
  const resistedLogs: LogEntry[] = [];
  for (const log of logs) {
    if (log.type === 'pouch_used') usedLogs.push(log);
    else if (log.type === 'craving_resisted') resistedLogs.push(log);
  }
  resistedLogs.sort((a, b) => a.timestamp - b.timestamp);

  const totalUsed = usedLogs.length;
  const totalCravingsResisted = resistedLogs.length;

  // Group used logs by day for O(1) lookup
  const usedCountsByDay = new Map<string, number>();
  for (const log of usedLogs) {
    const dayKey = toDayKey(new Date(log.timestamp));
    usedCountsByDay.set(dayKey, (usedCountsByDay.get(dayKey) || 0) + 1);
  }

  const days = getDaysInRange(startDate, today);
  const daysSinceStart = days.length;

  // --- Single pass over days: total progress + first-day milestone + threshold milestones ---
  const milestones: Milestone[] = [];
  let foundFirstDayUnderLimit = false;

  const pouchThresholds = POUCH_MILESTONE_THRESHOLDS;
  const moneyThresholds = settings.pricePerCan ? MONEY_MILESTONE_THRESHOLDS : [];
  const remainingPouchThresholds = new Set(pouchThresholds);
  const remainingMoneyThresholds = new Set(moneyThresholds);
  const pouchMilestoneDates = new Map<number, number>();
  const moneyMilestoneDates = new Map<number, number>();

  let cumBase = 0;
  let cumUsed = 0;

  for (const day of days) {
    const dayKey = toDayKey(day);
    const dayUsed = usedCountsByDay.get(dayKey) ?? 0;
    cumBase += settings.baselinePouchesPerDay;
    cumUsed += dayUsed;
    const avoided = cumBase - cumUsed;

    // First day under limit
    if (!foundFirstDayUnderLimit && dayUsed > 0) {
      const dayAllowance = calculateDailyAllowance(settings, day);
      if (dayUsed <= dayAllowance) {
        milestones.push({
          id: 'first_day_under_limit',
          type: 'first_day_under_limit',
          title: 'First Day Under Limit',
          description: 'You stayed within your daily allowance!',
          achievedAt: day.getTime(),
        });
        foundFirstDayUnderLimit = true;
      }
    }

    // Pouch thresholds
    for (const t of [...remainingPouchThresholds]) {
      if (avoided >= t) {
        pouchMilestoneDates.set(t, day.getTime());
        remainingPouchThresholds.delete(t);
      }
    }

    // Money thresholds
    if (settings.pricePerCan) {
      for (const t of [...remainingMoneyThresholds]) {
        const pouchesNeeded = (t * POUCHES_PER_CAN) / settings.pricePerCan;
        if (avoided >= pouchesNeeded) {
          moneyMilestoneDates.set(t, day.getTime());
          remainingMoneyThresholds.delete(t);
        }
      }
    }
  }

  const totalPouchesAvoided = Math.max(0, cumBase - cumUsed);

  // Calculate money saved
  let totalMoneySaved: number | undefined;
  if (settings.pricePerCan) {
    const cansAvoided = totalPouchesAvoided / POUCHES_PER_CAN;
    totalMoneySaved = Math.round(cansAvoided * settings.pricePerCan);
  }

  const averageDailyUsage = daysSinceStart > 0 ? totalUsed / daysSinceStart : 0;

  // --- Build milestone list ---
  for (const threshold of pouchThresholds) {
    if (totalPouchesAvoided >= threshold) {
      milestones.push({
        id: `pouches_avoided_${threshold}`,
        type: 'pouches_avoided',
        title: `${threshold} Pouches Avoided`,
        description: `You've avoided ${threshold} pouches compared to your baseline!`,
        achievedAt: pouchMilestoneDates.get(threshold) ?? today.getTime(),
        value: totalPouchesAvoided,
      });
    }
  }

  const cravingThresholds = CRAVING_MILESTONE_THRESHOLDS;
  for (const threshold of cravingThresholds) {
    if (totalCravingsResisted >= threshold) {
      milestones.push({
        id: `cravings_resisted_${threshold}`,
        type: 'cravings_resisted',
        title: `${threshold} Cravings Resisted`,
        description: `You've resisted ${threshold} cravings. That's real progress.`,
        achievedAt: resistedLogs[threshold - 1].timestamp,
        value: totalCravingsResisted,
      });
    }
  }

  if (settings.pricePerCan && totalMoneySaved !== undefined) {
    for (const threshold of moneyThresholds) {
      if (totalMoneySaved >= threshold) {
        milestones.push({
          id: `money_saved_${threshold}`,
          type: 'money_saved',
          title: `${formatMoney(threshold, settings.currency ?? 'DKK')} Saved`,
          description: `You've saved ${formatMoney(threshold, settings.currency ?? 'DKK')} compared to your baseline!`,
          achievedAt: moneyMilestoneDates.get(threshold) ?? today.getTime(),
          value: totalMoneySaved,
        });
      }
    }
  }

  return {
    progress: {
      totalPouchesAvoided,
      totalCravingsResisted,
      totalMoneySaved,
      daysSinceStart,
      averageDailyUsage,
    },
    milestones,
  };
}

/**
 * Daily breakdown for bar chart visualization.
 */
export interface DailyBreakdown {
  date: Date;
  dayLabel: string; // 'Mon', 'Tue', ...
  used: number;
  allowance: number;
  resisted: number;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Get per-day breakdown for a given week (used by the bar chart on Progress).
 */
export async function getDailyBreakdown(
  settings: TaperSettings,
  weekStart: Date,
  weekEnd: Date,
): Promise<DailyBreakdown[]> {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const settingsStart = new Date(settings.startDate);
  settingsStart.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logs = await getLogEntries({
    startDate: weekStart.getTime(),
    endDate: weekEnd.getTime(),
  });

  const usedByDay = new Map<string, number>();
  const resistedByDay = new Map<string, number>();
  for (const log of logs) {
    const key = toDayKey(new Date(log.timestamp));
    if (log.type === 'pouch_used') usedByDay.set(key, (usedByDay.get(key) ?? 0) + 1);
    else if (log.type === 'craving_resisted')
      resistedByDay.set(key, (resistedByDay.get(key) ?? 0) + 1);
  }

  const days = getDaysInRange(weekStart, weekEnd);
  return days.map((day, i) => {
    const key = toDayKey(day);
    const dayDate = new Date(day);
    dayDate.setHours(0, 0, 0, 0);
    const isFuture = dayDate > today;
    const isBeforeStart = dayDate < settingsStart;
    return {
      date: day,
      dayLabel: dayLabels[i % 7],
      used: isBeforeStart || isFuture ? 0 : (usedByDay.get(key) ?? 0),
      allowance: isBeforeStart ? 0 : calculateDailyAllowance(settings, day),
      resisted: isBeforeStart || isFuture ? 0 : (resistedByDay.get(key) ?? 0),
      isToday: dayDate.getTime() === today.getTime(),
      isFuture,
    };
  });
}

// ──────────────────────────────────────────────
// Usage patterns (#221) — time-of-day + trigger breakdown
// ──────────────────────────────────────────────

export type PartOfDayKey = 'morning' | 'afternoon' | 'evening' | 'night';

export interface PartOfDayBucket {
  key: PartOfDayKey;
  label: string;
  count: number;
}

export interface TriggerCount {
  trigger: string;
  count: number;
}

export interface UsagePatterns {
  /** Days the window actually covers (capped by taper start). */
  windowDays: number;
  /** Total pouch logs inside the window. */
  totalPouches: number;
  /** Pouch counts bucketed by part of day, in day order. */
  partsOfDay: PartOfDayBucket[];
  /** Pouch counts per trigger tag, most frequent first. Untagged logs are excluded. */
  triggerCounts: TriggerCount[];
  /** How many pouch logs in the window carry a trigger tag. */
  taggedPouches: number;
}

/**
 * Bucket an hour (0–23) into a part of day. Boundaries are deliberately
 * coarse — this is descriptive insight, not clinical analysis.
 */
function partOfDay(hour: number): PartOfDayKey {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Pure aggregation over pouch logs. Exported for unit testing — the DB read
 * lives in `getUsagePatterns` below.
 */
export function computeUsagePatterns(logs: LogEntry[], windowDays: number): UsagePatterns {
  const buckets: Record<PartOfDayKey, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };
  const triggerMap = new Map<string, number>();
  let totalPouches = 0;
  let taggedPouches = 0;

  for (const log of logs) {
    if (log.type !== 'pouch_used') continue;
    totalPouches++;
    buckets[partOfDay(new Date(log.timestamp).getHours())]++;
    if (log.trigger) {
      taggedPouches++;
      triggerMap.set(log.trigger, (triggerMap.get(log.trigger) ?? 0) + 1);
    }
  }

  const triggerCounts = [...triggerMap.entries()]
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count || a.trigger.localeCompare(b.trigger));

  return {
    windowDays,
    totalPouches,
    partsOfDay: [
      { key: 'morning', label: 'Morning', count: buckets.morning },
      { key: 'afternoon', label: 'Afternoon', count: buckets.afternoon },
      { key: 'evening', label: 'Evening', count: buckets.evening },
      { key: 'night', label: 'Night', count: buckets.night },
    ],
    triggerCounts,
    taggedPouches,
  };
}

/**
 * Usage patterns over the trailing `days` window (default 30), capped at the
 * taper start date so a brand-new plan doesn't dilute shares with empty days.
 */
export async function getUsagePatterns(
  settings: TaperSettings,
  days: number = 30,
): Promise<UsagePatterns> {
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const windowStart = new Date();
  windowStart.setHours(0, 0, 0, 0);
  windowStart.setDate(windowStart.getDate() - (days - 1));

  const taperStart = new Date(settings.startDate);
  taperStart.setHours(0, 0, 0, 0);
  const start = taperStart > windowStart ? taperStart : windowStart;

  const logs = await getLogEntries({
    type: 'pouch_used',
    startDate: start.getTime(),
    endDate: end.getTime(),
  });

  const windowDays = getDaysInRange(start, end).length;
  return computeUsagePatterns(logs, windowDays);
}

// ──────────────────────────────────────────────
// Pace assessment (#222) — "is the pace too aggressive?"
// ──────────────────────────────────────────────

export interface PaceAssessment {
  /** Complete days the assessment covers (today is excluded — it's partial). */
  sampleDays: number;
  /** Sum of daily allowances across the window. */
  totalAllowance: number;
  /** Pouches actually used across the window. */
  totalUsed: number;
  /**
   * True when usage exceeds allowance by PACE_NUDGE_OVER_FACTOR across a
   * window of at least PACE_NUDGE_MIN_DAYS. Encodes the blog's guidance:
   * "consistently 20%+ over your allowance → the pace is too aggressive".
   */
  tooAggressive: boolean;
}

/**
 * Pure assessment over per-day (allowance, used) pairs. Exported for tests.
 */
export function computePaceAssessment(days: { allowance: number; used: number }[]): PaceAssessment {
  let totalAllowance = 0;
  let totalUsed = 0;
  for (const day of days) {
    totalAllowance += day.allowance;
    totalUsed += day.used;
  }
  return {
    sampleDays: days.length,
    totalAllowance,
    totalUsed,
    tooAggressive:
      days.length >= PACE_NUDGE_MIN_DAYS &&
      totalAllowance > 0 &&
      totalUsed >= totalAllowance * PACE_NUDGE_OVER_FACTOR,
  };
}

/**
 * Assess the trailing PACE_NUDGE_WINDOW_DAYS of complete days (yesterday
 * backwards, capped at taper start). Today is excluded: a partial day would
 * bias the ratio downward every morning.
 */
export async function assessPace(settings: TaperSettings): Promise<PaceAssessment> {
  const windowEnd = new Date();
  windowEnd.setHours(0, 0, 0, 0);
  windowEnd.setDate(windowEnd.getDate() - 1); // yesterday
  windowEnd.setHours(23, 59, 59, 999);

  const windowStart = new Date(windowEnd);
  windowStart.setHours(0, 0, 0, 0);
  windowStart.setDate(windowStart.getDate() - (PACE_NUDGE_WINDOW_DAYS - 1));

  const taperStart = new Date(settings.startDate);
  taperStart.setHours(0, 0, 0, 0);
  const start = taperStart > windowStart ? taperStart : windowStart;

  if (start > windowEnd) {
    // Plan started today — no complete days yet
    return computePaceAssessment([]);
  }

  const logs = await getLogEntries({
    type: 'pouch_used',
    startDate: start.getTime(),
    endDate: windowEnd.getTime(),
  });

  const usedByDay = new Map<string, number>();
  for (const log of logs) {
    const key = toDayKey(new Date(log.timestamp));
    usedByDay.set(key, (usedByDay.get(key) ?? 0) + 1);
  }

  const days = getDaysInRange(start, windowEnd).map((day) => ({
    allowance: calculateDailyAllowance(settings, day),
    used: usedByDay.get(toDayKey(day)) ?? 0,
  }));

  return computePaceAssessment(days);
}

/**
 * Get current week start and end dates
 */
export function getCurrentWeek(): { start: Date; end: Date } {
  const today = new Date();
  // Monday-start weeks (common in DK/SE/NO)
  // Convert JS day (Sun=0..Sat=6) to Monday-first index (Mon=0..Sun=6)
  const dayOfWeek = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get previous week start and end dates
 */
export function getPreviousWeek(): { start: Date; end: Date } {
  const { start } = getCurrentWeek();
  const prevStart = new Date(start);
  prevStart.setDate(start.getDate() - 7);
  prevStart.setHours(0, 0, 0, 0);

  const prevEnd = new Date(prevStart);
  prevEnd.setDate(prevStart.getDate() + 6);
  prevEnd.setHours(23, 59, 59, 999);

  return { start: prevStart, end: prevEnd };
}
