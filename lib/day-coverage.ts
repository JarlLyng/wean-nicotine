/**
 * Which days we actually have data for (#320).
 *
 * Every "earned" figure in the app (money saved, pouches avoided, days under
 * limit, milestones) used to treat a day with no log entries as a day with
 * zero pouches used. That rewards missing data exactly like perfect
 * adherence: stop logging for a fortnight and the app reports a better result
 * than someone who logged honestly and went over twice.
 *
 * The rule, in one place so it cannot drift between call sites:
 *
 *   A day counts when it has at least one log entry of ANY type.
 *
 * A `craving_resisted` entry with no `pouch_used` is evidence the person was
 * present and genuinely used zero, so it counts as a real zero rather than
 * being thrown away. A day with nothing at all is UNKNOWN, not zero, and is
 * left out of earned totals instead of being credited.
 *
 * Deliberately NOT applied to `computePaceAssessment`: that looks for days
 * *over* allowance, so unknown days make it under-trigger, which is the safe
 * direction for a nudge. See the comment there before changing it.
 */

import type { LogEntry } from './models';

/** Local-time day key, `YYYY-MM-DD`. */
export function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * The set of day keys covered by at least one log entry, of any type.
 * Pass the unfiltered entries for the range you are about to walk.
 */
export function daysWithLogs(logs: LogEntry[]): Set<string> {
  const covered = new Set<string>();
  for (const log of logs) {
    covered.add(toDayKey(new Date(log.timestamp)));
  }
  return covered;
}

/** True when we have evidence of what happened on this day. */
export function hasData(covered: Set<string>, date: Date): boolean {
  return covered.has(toDayKey(date));
}
