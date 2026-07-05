/**
 * In-app review prompt (#180).
 *
 * Thin wrapper around expo-store-review that only ever asks at positive
 * moments and self-limits frequency:
 *
 * - Never before the plan is REVIEW_MIN_DAYS_SINCE_START days old. This
 *   doubles as the "not right after Reset" guard — Start Over wipes
 *   preferences AND creates a fresh plan, so the age gate re-arms.
 * - At most once per REVIEW_MIN_DAYS_BETWEEN days (Apple additionally
 *   hard-caps prompts at 3/365 — the OS may silently swallow requests).
 * - Only when StoreReview.isAvailableAsync() says the platform can show it.
 *
 * Privacy: expo-store-review makes no network calls of its own and touches
 * no user data — the request goes straight to StoreKit.
 */

import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { getPreference, setPreference } from './db-preferences';
import {
  REVIEW_LAST_REQUEST_KEY,
  REVIEW_MIN_DAYS_BETWEEN,
  REVIEW_MIN_DAYS_SINCE_START,
} from './constants';
import { captureError } from './sentry';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Request an App Store review if all gates pass. Fire-and-forget: callers
 * should not await UI on this. Returns true when a request was actually
 * issued (useful for tests), false when any gate declined.
 */
export async function maybeRequestReview(planStartDate: number): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    // Plan must be mature enough that the user has real experience to rate —
    // and a freshly reset plan never prompts.
    const planAgeDays = (Date.now() - planStartDate) / DAY_MS;
    if (planAgeDays < REVIEW_MIN_DAYS_SINCE_START) return false;

    const last = Number(await getPreference(REVIEW_LAST_REQUEST_KEY)) || 0;
    if (Date.now() - last < REVIEW_MIN_DAYS_BETWEEN * DAY_MS) return false;

    if (!(await StoreReview.isAvailableAsync())) return false;

    // Record BEFORE requesting: iOS gives no callback on whether the sheet
    // actually showed, and double-asking is worse than under-asking.
    await setPreference(REVIEW_LAST_REQUEST_KEY, String(Date.now()));
    await StoreReview.requestReview();
    return true;
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      context: 'maybe_request_review',
    });
    return false;
  }
}
