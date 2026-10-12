/**
 * The taper as a staircase, for the home page (#396).
 *
 * Computed with the app's own maths, imported from the app's lib/, so the
 * page cannot drift from what the app does: calculateDailyAllowance for each
 * week's allowance, getDisplayAllowance for the whole pouches the app shows,
 * and estimateWeeksToZero for where it ends. If the week-by-week allowance and
 * the estimate ever disagree, the build fails here.
 */
import {
  calculateDailyAllowance,
  estimateWeeksToZero,
  getDisplayAllowance,
} from '../../../lib/taper-plan';
import type { TaperSettings } from '../../../lib/models';

/** One week of the plan. `week` counts from 0, as the app does. */
export interface StairStep {
  week: number;
  perDay: number;
}

/** Consecutive weeks at the same allowance. Weeks count from 0. */
export interface StairRun {
  fromWeek: number;
  toWeek: number;
  perDay: number;
}

export interface Staircase {
  baseline: number;
  percent: number;
  /** What the app's onboarding says: "you'd reach zero in about N weeks". */
  weeksToZero: number;
  /** Weeks 0 to weeksToZero; the last one is the first at zero. */
  steps: StairStep[];
  runs: StairRun[];
}

export function computeStaircase(baseline: number, percent: number): Staircase {
  const weeksToZero = estimateWeeksToZero(baseline, percent);
  if (weeksToZero === null)
    throw new Error(`a ${percent}% taper from ${baseline} never reaches zero`);

  // Any start date works: only whole weeks since it count.
  const start = new Date(2026, 0, 5);
  const settings: TaperSettings = {
    id: 0,
    baselinePouchesPerDay: baseline,
    weeklyReductionPercent: percent,
    startDate: start.getTime(),
    createdAt: 0,
    updatedAt: 0,
  };

  const steps: StairStep[] = [];
  for (let week = 0; week <= weeksToZero; week++) {
    // Sample mid-week, so a daylight-saving change cannot move a day into the
    // neighbouring week.
    const day = new Date(start);
    day.setDate(start.getDate() + week * 7 + 3);
    steps.push({ week, perDay: getDisplayAllowance(calculateDailyAllowance(settings, day)) });
  }

  const last = steps[steps.length - 1];
  const beforeLast = steps[steps.length - 2];
  if (last.perDay !== 0 || (beforeLast && beforeLast.perDay === 0)) {
    throw new Error('the weekly allowance and estimateWeeksToZero disagree on where the plan ends');
  }

  const runs: StairRun[] = [];
  for (const step of steps) {
    const run = runs[runs.length - 1];
    if (run && run.perDay === step.perDay) run.toWeek = step.week;
    else runs.push({ fromWeek: step.week, toWeek: step.week, perDay: step.perDay });
  }

  return { baseline, percent, weeksToZero, steps, runs };
}

/** The page's example, decided in the site brief: 10 a day at 10% a week. */
export const EXAMPLE_STAIRCASE = computeStaircase(10, 10);
