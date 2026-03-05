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
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(currentDate);
  endDate.setHours(0, 0, 0, 0);
  const weeksSinceStart = getWeeksBetween(startDate, endDate);
  // Stepwise weekly reduction: use full weeks only (no fractional week)
  const clampedWeeks = Math.max(0, Math.floor(weeksSinceStart));
  
  const clampedPercent = Math.max(0, Math.min(100, settings.weeklyReductionPercent));
  const reductionFactor = Math.pow(
    1 - clampedPercent / 100,
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
