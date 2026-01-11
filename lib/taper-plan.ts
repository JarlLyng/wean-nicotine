/**
 * Taper plan calculation utilities
 */

import type { TaperSettings } from './models';

/**
 * Calculate the current daily allowance based on taper settings
 * Formula: baseline * (1 - reductionPercent/100) ^ weeksSinceStart
 */
export function calculateDailyAllowance(
  settings: TaperSettings,
  currentDate: Date = new Date()
): number {
  const startDate = new Date(settings.startDate);
  const weeksSinceStart = getWeeksBetween(startDate, currentDate);
  
  // Clamp to non-negative weeks to prevent allowance exceeding baseline
  // This handles edge cases like timezone issues or device clock being wrong
  const clampedWeeks = Math.max(0, weeksSinceStart);
  
  const reductionFactor = Math.pow(
    1 - settings.weeklyReductionPercent / 100,
    clampedWeeks
  );
  
  const allowance = settings.baselinePouchesPerDay * reductionFactor;
  
  // Round to 1 decimal place, but never go below 0
  // Also ensure allowance never exceeds baseline (safety check)
  return Math.max(0, Math.min(settings.baselinePouchesPerDay, Math.round(allowance * 10) / 10));
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
  weeklyReductionPercent: number = 5
): Omit<TaperSettings, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    baselinePouchesPerDay,
    weeklyReductionPercent,
    startDate: Date.now(),
  };
}
