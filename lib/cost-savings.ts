/**
 * Cost savings calculation utility.
 * Reads existing taper_settings and log_entries to compute how much money
 * the user has saved by reducing nicotine use.
 */

import type { TaperSettings } from './models';
import { getLogEntries } from './db-log-entries';

const POUCHES_PER_CAN = 20;

function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);
  return `${monday.getDate()}/${monday.getMonth() + 1}`;
}

function toMonthLabel(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export interface WeekSaving {
  weekLabel: string;
  saved: number; // cents
}

export interface MonthSaving {
  monthLabel: string;
  saved: number; // cents
}

export interface CostSavingsData {
  totalSaved: number; // cents
  weeklySavings: WeekSaving[];
  monthlySavings: MonthSaving[];
  dailyRate: number; // cents per day average
  projectedMonthlySaving: number; // cents
}

export async function calculateCostSavings(
  settings: TaperSettings,
): Promise<CostSavingsData> {
  const pricePerCan = settings.pricePerCan ?? 0;
  const pricePerPouch = pricePerCan / POUCHES_PER_CAN;

  const startDate = new Date(settings.startDate);
  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const logs = await getLogEntries({
    type: 'pouch_used',
    startDate: startDate.getTime(),
    endDate: today.getTime(),
  });

  // Group used by day
  const usedByDay = new Map<string, number>();
  for (const log of logs) {
    const key = toDayKey(new Date(log.timestamp));
    usedByDay.set(key, (usedByDay.get(key) ?? 0) + 1);
  }

  // Walk each day from start to today
  const weekMap = new Map<string, number>();
  const monthMap = new Map<string, number>();
  let totalAvoided = 0;
  let dayCount = 0;

  const current = new Date(startDate);
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  while (current <= todayStart) {
    const key = toDayKey(current);
    const used = usedByDay.get(key) ?? 0;
    const avoided = Math.max(0, settings.baselinePouchesPerDay - used);
    const savedCents = Math.round(avoided * pricePerPouch);

    totalAvoided += avoided;

    const wk = toWeekLabel(current);
    weekMap.set(wk, (weekMap.get(wk) ?? 0) + savedCents);

    const mo = toMonthLabel(current);
    monthMap.set(mo, (monthMap.get(mo) ?? 0) + savedCents);

    dayCount++;
    current.setDate(current.getDate() + 1);
  }

  const totalSaved = Math.round(totalAvoided * pricePerPouch);
  const dailyRate = dayCount > 0 ? Math.round(totalSaved / dayCount) : 0;
  const projectedMonthlySaving = dailyRate * 30;

  const weeklySavings = [...weekMap.entries()].map(([weekLabel, saved]) => ({ weekLabel, saved }));
  const monthlySavings = [...monthMap.entries()].map(([monthLabel, saved]) => ({ monthLabel, saved }));

  return {
    totalSaved,
    weeklySavings,
    monthlySavings,
    dailyRate,
    projectedMonthlySaving,
  };
}
