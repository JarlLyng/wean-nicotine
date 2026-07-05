/**
 * Shared domain constants (#112).
 *
 * Single source for magic numbers that were previously duplicated across
 * lib/progress.ts, lib/cost-savings.ts, and lib/notifications.ts. If broader
 * product support ever lands (#44), POUCHES_PER_CAN becomes per-product —
 * having one definition makes that refactor a one-file change.
 */

/** Pouches in a standard can — drives all cost-savings math. */
export const POUCHES_PER_CAN = 20;

/** Days used to project a "monthly" saving from the daily rate. */
export const PROJECTED_MONTH_DAYS = 30;

/** Default hour (24h, local) for the daily check-in notification. */
export const DEFAULT_CHECK_IN_HOUR = 20;

/** Cumulative pouches-avoided milestone thresholds. */
export const POUCH_MILESTONE_THRESHOLDS = [100, 500, 1000, 2500, 5000];

/** Cumulative money-saved milestone thresholds (smallest currency unit). */
export const MONEY_MILESTONE_THRESHOLDS = [1000, 5000, 10000, 25000, 50000];

/** Cumulative cravings-resisted milestone thresholds. */
export const CRAVING_MILESTONE_THRESHOLDS = [10, 25, 50, 100, 250];

// ── Pace nudge (#222) ──────────────────────────────────────────────
// "If you're consistently 20%+ over your allowance, the pace is too
// aggressive" — the blog's guidance, encoded. All tunable in one place.

/** Usage must exceed allowance by this factor across the window to nudge. */
export const PACE_NUDGE_OVER_FACTOR = 1.2;

/** Trailing window (complete days, excluding today) the assessment looks at. */
export const PACE_NUDGE_WINDOW_DAYS = 14;

/** Minimum complete days of data before the nudge can ever appear. */
export const PACE_NUDGE_MIN_DAYS = 7;

/** After a dismissal, stay quiet for this many days. */
export const PACE_NUDGE_SNOOZE_DAYS = 7;

/** app_preferences key holding the last-dismissed timestamp (ms epoch). */
export const PACE_NUDGE_DISMISSED_AT_KEY = 'pace_nudge_dismissed_at';
