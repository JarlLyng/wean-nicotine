/**
 * Taper plan calculation utilities (Wean Nicotine)
 */

import type { TaperSettings } from './models';

/**
 * Calculate the current daily allowance based on taper settings
 * Formula: baseline * (1 - reductionPercent/100) ^ weeksSinceStart
 */
export function calculateDailyAllowance(
  settings: TaperSettings,
  currentDate: Date = new Date(),
): number {
  const startDate = new Date(settings.startDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(currentDate);
  endDate.setHours(0, 0, 0, 0);
  const weeksSinceStart = getWeeksBetween(startDate, endDate);
  // Stepwise weekly reduction: use full weeks only (no fractional week)
  const clampedWeeks = Math.max(0, Math.floor(weeksSinceStart));

  const clampedPercent = Math.max(0, Math.min(100, settings.weeklyReductionPercent));
  const reductionFactor = Math.pow(1 - clampedPercent / 100, clampedWeeks);

  const allowance = settings.baselinePouchesPerDay * reductionFactor;

  // Round to 1 decimal place, but never go below 0
  // Also ensure allowance never exceeds baseline (safety check)
  return Math.max(0, Math.min(settings.baselinePouchesPerDay, Math.round(allowance * 10) / 10));
}

/**
 * Whole-pouch allowance for display (#219).
 *
 * The computed allowance keeps 1-decimal precision because the taper math
 * needs it — rounding the stored value would stall gentle paces (3%/week on
 * a low baseline barely moves the integer). But you can't use half a pouch,
 * so the Today screen shows the FLOOR of the allowance: "3 today" for 3.5.
 * Flooring (not rounding) means staying under the displayed target always
 * keeps you under the real one — the forgiving direction.
 */
export function getDisplayAllowance(allowance: number): number {
  return Math.max(0, Math.floor(allowance));
}

/**
 * Estimate how many weeks until the DISPLAYED daily target reaches zero
 * (#123). Iterates the exact same math as calculateDailyAllowance —
 * 1-decimal rounding, then whole-pouch flooring via getDisplayAllowance —
 * so the onboarding preview can never drift from what the app will
 * actually do (the goal celebration in #223 triggers on the same
 * condition).
 *
 * Returns null when the pace can never reach zero (0%) or exceeds
 * `maxWeeks` (10 years — unreachable for any real pace/baseline combo).
 */
export function estimateWeeksToZero(
  baselinePouchesPerDay: number,
  weeklyReductionPercent: number,
  maxWeeks: number = 520,
): number | null {
  if (baselinePouchesPerDay <= 0) return 0;
  const clampedPercent = Math.max(0, Math.min(100, weeklyReductionPercent));
  if (clampedPercent === 0) return null;

  for (let week = 0; week <= maxWeeks; week++) {
    const factor = Math.pow(1 - clampedPercent / 100, week);
    const allowance = Math.max(
      0,
      Math.min(baselinePouchesPerDay, Math.round(baselinePouchesPerDay * factor * 10) / 10),
    );
    if (getDisplayAllowance(allowance) === 0) return week;
  }
  return null;
}

/**
 * Get number of weeks between two dates
 */
function getWeeksBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays / 7;
}

/**
 * Generate default taper plan settings
 */
export function generateDefaultTaperPlan(
  baselinePouchesPerDay: number,
  weeklyReductionPercent: number = 5,
): Omit<TaperSettings, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    baselinePouchesPerDay,
    weeklyReductionPercent,
    startDate: Date.now(),
  };
}
