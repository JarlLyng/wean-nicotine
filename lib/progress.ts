/**
 * Progress calculation utilities
 */

import type { TaperSettings, LogEntry } from './models';
import { getLogEntries } from './db-log-entries';
import { calculateDailyAllowance } from './taper-plan';

export interface WeeklyProgress {
  weekStart: Date;
  weekEnd: Date;
  baselineTotal: number;
  actualUsed: number;
  pouchesAvoided: number;
  moneySaved?: number; // in cents
  daysUnderLimit: number;
  daysOverLimit: number;
}

export interface Milestone {
  id: string;
  type: 'first_day_under_limit' | 'week_under_limit' | 'pouches_avoided' | 'money_saved';
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
  weekEnd: Date
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

  // Calculate baseline for the week (only count days from start date to today)
  // Count actual days, not just time difference
  const days = getDaysInRange(effectiveStart, effectiveEnd);
  const daysInWeek = days.length;
  const baselineTotal = settings.baselinePouchesPerDay * daysInWeek;
  const pouchesAvoided = Math.max(0, baselineTotal - actualUsed);
  
  console.log('calculateWeeklyProgress:', {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    settingsStartDate: settingsStartDate.toISOString(),
    effectiveStart: effectiveStart.toISOString(),
    effectiveEnd: effectiveEnd.toISOString(),
    daysInWeek,
    baselineTotal,
    actualUsed,
    pouchesAvoided,
  });

  // Calculate money saved (if price is set)
  let moneySaved: number | undefined;
  if (settings.pricePerCan) {
    // Assuming ~20 pouches per can (adjust if needed)
    const pouchesPerCan = 20;
    const cansAvoided = pouchesAvoided / pouchesPerCan;
    moneySaved = Math.round(cansAvoided * settings.pricePerCan);
  }

  // Count days under/over limit (only from effective start)
  // Optimize: Pre-group logs by day to avoid O(n^2) filtering
  const logsByDay = new Map<string, number>();
  for (const log of usedLogs) {
    const logDate = new Date(log.timestamp);
    const dayKey = `${logDate.getFullYear()}-${logDate.getMonth()}-${logDate.getDate()}`;
    logsByDay.set(dayKey, (logsByDay.get(dayKey) || 0) + 1);
  }

  let daysUnderLimit = 0;
  let daysOverLimit = 0;

  for (const day of days) {
    const dayAllowance = calculateDailyAllowance(settings, day);
    const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
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

/**
 * Calculate total progress since start
 */
export async function calculateTotalProgress(
  settings: TaperSettings
): Promise<{
  totalPouchesAvoided: number;
  totalMoneySaved?: number;
  daysSinceStart: number;
  averageDailyUsage: number;
}> {
  const startDate = new Date(settings.startDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const logs = await getLogEntries({
    startDate: startDate.getTime(),
    endDate: today.getTime(),
  });

  const usedLogs = logs.filter((log) => log.type === 'pouch_used');
  const totalUsed = usedLogs.length;

  const daysSinceStart = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const baselineTotal = settings.baselinePouchesPerDay * daysSinceStart;
  const totalPouchesAvoided = Math.max(0, baselineTotal - totalUsed);

  let totalMoneySaved: number | undefined;
  if (settings.pricePerCan) {
    const pouchesPerCan = 20;
    const cansAvoided = totalPouchesAvoided / pouchesPerCan;
    totalMoneySaved = Math.round(cansAvoided * settings.pricePerCan);
  }

  const averageDailyUsage = daysSinceStart > 0 ? totalUsed / daysSinceStart : 0;

  return {
    totalPouchesAvoided,
    totalMoneySaved,
    daysSinceStart,
    averageDailyUsage,
  };
}

/**
 * Detect milestones
 */
export async function detectMilestones(
  settings: TaperSettings
): Promise<Milestone[]> {
  const milestones: Milestone[] = [];
  const startDate = new Date(settings.startDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const logs = await getLogEntries({
    startDate: startDate.getTime(),
    endDate: today.getTime(),
  });

  const usedLogs = logs.filter((log) => log.type === 'pouch_used');

  // Check for first day under limit
  const days = getDaysInRange(startDate, today);
  let firstDayUnderLimit: Date | null = null;

  for (const day of days) {
    const dayAllowance = calculateDailyAllowance(settings, day);
    const dayLogs = usedLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return (
        logDate.getFullYear() === day.getFullYear() &&
        logDate.getMonth() === day.getMonth() &&
        logDate.getDate() === day.getDate()
      );
    });
    const dayUsed = dayLogs.length;

    if (dayUsed <= dayAllowance && dayUsed > 0) {
      firstDayUnderLimit = day;
      break;
    }
  }

  if (firstDayUnderLimit) {
    milestones.push({
      id: 'first_day_under_limit',
      type: 'first_day_under_limit',
      title: 'First Day Under Limit',
      description: 'You stayed within your daily allowance!',
      achievedAt: firstDayUnderLimit.getTime(),
    });
  }

  // Check for pouches avoided milestones (100, 500, 1000)
  const totalProgress = await calculateTotalProgress(settings);
  const milestonesThresholds = [100, 500, 1000, 2500, 5000];
  
  for (const threshold of milestonesThresholds) {
    if (totalProgress.totalPouchesAvoided >= threshold) {
      milestones.push({
        id: `pouches_avoided_${threshold}`,
        type: 'pouches_avoided',
        title: `${threshold} Pouches Avoided`,
        description: `You've avoided ${threshold} pouches compared to your baseline!`,
        achievedAt: today.getTime(),
        value: totalProgress.totalPouchesAvoided,
      });
    }
  }

  // Check for money saved milestones (if price is set)
  if (totalProgress.totalMoneySaved) {
    const moneyMilestones = [1000, 5000, 10000, 25000, 50000]; // in cents
    for (const threshold of moneyMilestones) {
      if (totalProgress.totalMoneySaved >= threshold) {
        milestones.push({
          id: `money_saved_${threshold}`,
          type: 'money_saved',
          title: `$${(threshold / 100).toFixed(2)} Saved`,
          description: `You've saved $${(threshold / 100).toFixed(2)} compared to your baseline!`,
          achievedAt: today.getTime(),
          value: totalProgress.totalMoneySaved,
        });
      }
    }
  }

  return milestones;
}

/**
 * Get current week start and end dates
 */
export function getCurrentWeek(): { start: Date; end: Date } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
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
