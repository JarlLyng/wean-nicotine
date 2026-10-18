/**
 * Locale-aware date and time labels.
 *
 * The copy is English only for now (#315), but the order of day and month and
 * the 12- or 24-hour clock follow the phone's region: a US phone reads
 * 9/18/2026 and 8:00 PM, a British one 18/09/2026 and 20:00. Every visible
 * date or time goes through here so the screens agree with each other.
 *
 * `locale` exists for tests. The app leaves it undefined, which means the
 * device locale.
 */

type DateInput = Date | number;

/** Day, month and year in numbers: 9/18/2026 (en-US), 18/09/2026 (en-GB). */
export function formatNumericDate(date: DateInput, locale?: string): string {
  return new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

/** Day and month in numbers, no year: 9/14 (en-US), 14/09 (en-GB). */
export function formatDayMonth(date: DateInput, locale?: string): string {
  return new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'numeric' });
}

/** Short month name and year: Sep 2026. */
export function formatMonthYear(date: DateInput, locale?: string): string {
  return new Date(date).toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

/** Day, short month name and year: Sep 18, 2026 (en-US), 18 Sept 2026 (en-GB). */
export function formatMediumDate(date: DateInput, locale?: string): string {
  return new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * A time of day in the locale's own clock: 8:00 PM (en-US), 20:00 (en-GB).
 * Takes hour and minute rather than a Date because reminders are stored and
 * scheduled that way.
 */
export function formatTimeOfDay(hour: number, minute = 0, locale?: string): string {
  // Any fixed day works; 1 January has no daylight saving change to skip an hour.
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
