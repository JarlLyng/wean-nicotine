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

// ── Taper-complete state (#223) ────────────────────────────────────

/**
 * app_preferences key marking that the one-time "you reached your goal"
 * celebration has been shown. Cleared automatically if the plan is edited
 * so the allowance rises above zero again (re-arming the celebration for
 * a genuine second finish). Wiped by Start Over like all preferences.
 */
export const GOAL_CELEBRATED_KEY = 'taper_goal_celebrated';

// ── In-app review prompt (#180) ────────────────────────────────────
// Apple hard-caps StoreKit review prompts at 3/365 days; these are our
// stricter self-imposed limits so the ask only lands on positive moments.

/** app_preferences key holding the last review-request timestamp (ms epoch). */
export const REVIEW_LAST_REQUEST_KEY = 'review_last_requested_at';

/** Minimum days between our own review requests. */
export const REVIEW_MIN_DAYS_BETWEEN = 90;

/** Never ask before the plan is at least this old (also guards post-reset). */
export const REVIEW_MIN_DAYS_SINCE_START = 14;

/** Progress-milestone trigger: ask only once this many pouches are avoided. */
export const REVIEW_MIN_POUCHES_AVOIDED = 100;
