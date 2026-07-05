/**
 * useHomeData — loads and maintains the Today screen's data.
 *
 * Reads taper settings, recomputes today's allowance from the taper-plan
 * math, and counts today's pouches + cravings resisted. The DB is reread
 * whenever the screen comes back into focus.
 *
 * Exposes optimistic counter mutators so one-tap logging can update the UI
 * instantly while the DB write happens in the background.
 *
 * Load outcomes are modelled explicitly via `status`:
 *  - `'loading'`  — first load in progress, no result yet
 *  - `'no-settings'` — DB read succeeded but the user has not completed
 *                     onboarding. The Today screen renders the "complete
 *                     onboarding" CTA.
 *  - `'ready'`    — settings loaded; counters reflect today's state
 *  - `'error'`    — load threw. The screen surfaces a calmer "couldn't
 *                   load right now" message instead of the onboarding CTA,
 *                   so a parse failure / transient SQLite error never
 *                   tricks the user into thinking they have no plan.
 *
 * (Previously this hook also maintained a `user_plan` row that cached the
 *  daily allowance. The cache was never read for display — the allowance is
 *  always recomputed from settings — so the table was redundant and has
 *  been dropped. See #11.)
 */

import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getTaperSettings } from '@/lib/db-settings';
import { calculateDailyAllowance, getDisplayAllowance } from '@/lib/taper-plan';
import { getLogEntriesForDay } from '@/lib/db-log-entries';
import { getPreference, setPreference } from '@/lib/db-preferences';
import { assessPace, calculateTotalProgressAndMilestones } from '@/lib/progress';
import {
  GOAL_CELEBRATED_KEY,
  PACE_NUDGE_DISMISSED_AT_KEY,
  PACE_NUDGE_SNOOZE_DAYS,
} from '@/lib/constants';
import { captureError } from '@/lib/sentry';

export type HomeStatus = 'loading' | 'no-settings' | 'ready' | 'error';

export interface HomeData {
  dailyAllowance: number | null;
  pouchesUsedToday: number;
  cravingsResistedToday: number;
  baselinePouchesPerDay: number | null;
  settingsId: number | null;
  /** The user's onboarding-selected triggers — drives the optional post-log tag row. */
  triggers: string[];
  /** True when the pace assessment suggests easing up AND the nudge isn't snoozed (#222). */
  showPaceNudge: boolean;
  /** True the first time the allowance reaches zero — one-time celebration (#223). */
  showGoalCelebration: boolean;
  /** Cumulative pouches avoided, loaded only for the celebration copy. */
  goalPouchesAvoided: number | null;
}

const EMPTY_DATA: HomeData = {
  dailyAllowance: null,
  pouchesUsedToday: 0,
  cravingsResistedToday: 0,
  baselinePouchesPerDay: null,
  settingsId: null,
  triggers: [],
  showPaceNudge: false,
  showGoalCelebration: false,
  goalPouchesAvoided: null,
};

export interface UseHomeDataResult {
  data: HomeData;
  status: HomeStatus;
  /** @deprecated Use `status === 'loading'`. Kept for callers mid-migration. */
  isLoading: boolean;
  reload: (options?: { showLoading?: boolean }) => Promise<void>;
  incrementPouches: () => void;
  decrementPouches: () => void;
  incrementCravings: () => void;
  decrementCravings: () => void;
  /** Hide the pace nudge and snooze it for PACE_NUDGE_SNOOZE_DAYS. */
  dismissPaceNudge: () => void;
  /** Acknowledge the goal celebration — it never shows again for this plan. */
  dismissGoalCelebration: () => void;
}

export function useHomeData(): UseHomeDataResult {
  const [data, setData] = useState<HomeData>(EMPTY_DATA);
  const [status, setStatus] = useState<HomeStatus>('loading');
  const isLoadingRef = useRef(false);

  const reload = useCallback(async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      if (showLoading) setStatus('loading');

      const settings = await getTaperSettings();
      if (!settings) {
        // Genuine "user has not finished onboarding" — distinct from a
        // load failure below, so the UI can confidently route to onboarding
        // without risking data wipe on a parse error.
        setData(EMPTY_DATA);
        setStatus('no-settings');
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const calculatedAllowance = calculateDailyAllowance(settings, today);

      const [todayLogs, paceAssessment, nudgeDismissedAt, goalCelebrated] = await Promise.all([
        getLogEntriesForDay(today),
        assessPace(settings),
        getPreference(PACE_NUDGE_DISMISSED_AT_KEY),
        getPreference(GOAL_CELEBRATED_KEY),
      ]);
      const usedCount = todayLogs.filter((log) => log.type === 'pouch_used').length;
      const resistedCount = todayLogs.filter((log) => log.type === 'craving_resisted').length;

      // Nudge only when the assessment says so AND the user hasn't dismissed
      // it within the snooze window — it must never nag (#222).
      const snoozeUntil =
        (Number(nudgeDismissedAt) || 0) + PACE_NUDGE_SNOOZE_DAYS * 24 * 60 * 60 * 1000;
      const showPaceNudge = paceAssessment.tooAggressive && Date.now() >= snoozeUntil;

      // One-time goal celebration when the whole-pouch target reaches zero (#223).
      const goalReached = getDisplayAllowance(calculatedAllowance) === 0;
      let showGoalCelebration = false;
      let goalPouchesAvoided: number | null = null;
      if (goalReached && !goalCelebrated) {
        // Rare path — one extra query only in the not-yet-celebrated state,
        // to give the celebration its headline number.
        const { progress } = await calculateTotalProgressAndMilestones(settings);
        goalPouchesAvoided = progress.totalPouchesAvoided;
        showGoalCelebration = true;
      } else if (!goalReached && goalCelebrated) {
        // The plan was edited and the allowance rose above zero — re-arm the
        // celebration for a genuine second finish.
        setPreference(GOAL_CELEBRATED_KEY, '').catch(() => {});
      }

      setData({
        dailyAllowance: Math.round(calculatedAllowance * 10) / 10,
        pouchesUsedToday: usedCount,
        cravingsResistedToday: resistedCount,
        baselinePouchesPerDay: settings.baselinePouchesPerDay,
        settingsId: settings.id,
        triggers: settings.triggers ?? [],
        showPaceNudge,
        showGoalCelebration,
        goalPouchesAvoided,
      });
      setStatus('ready');
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'home_load_data',
      });
      // IMPORTANT: do NOT clear `data` to EMPTY_DATA on error. Doing so
      // looks indistinguishable from "no settings" and could push the user
      // back through onboarding (which wipes everything). Keep whatever we
      // last rendered and surface 'error' so the screen can show a calm
      // retry affordance instead.
      setStatus('error');
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  // Refresh whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      isLoadingRef.current = false;
      void reload();
    }, [reload]),
  );

  // Optimistic counter mutators (used by one-tap logging + undo)
  const incrementPouches = useCallback(() => {
    setData((prev) => ({ ...prev, pouchesUsedToday: prev.pouchesUsedToday + 1 }));
  }, []);

  const decrementPouches = useCallback(() => {
    setData((prev) => ({ ...prev, pouchesUsedToday: Math.max(0, prev.pouchesUsedToday - 1) }));
  }, []);

  const incrementCravings = useCallback(() => {
    setData((prev) => ({ ...prev, cravingsResistedToday: prev.cravingsResistedToday + 1 }));
  }, []);

  const decrementCravings = useCallback(() => {
    setData((prev) => ({
      ...prev,
      cravingsResistedToday: Math.max(0, prev.cravingsResistedToday - 1),
    }));
  }, []);

  const dismissPaceNudge = useCallback(() => {
    // Optimistic hide; the preference write snoozes future loads.
    setData((prev) => ({ ...prev, showPaceNudge: false }));
    setPreference(PACE_NUDGE_DISMISSED_AT_KEY, String(Date.now())).catch((error) => {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'home_dismiss_pace_nudge',
      });
    });
  }, []);

  const dismissGoalCelebration = useCallback(() => {
    setData((prev) => ({ ...prev, showGoalCelebration: false }));
    setPreference(GOAL_CELEBRATED_KEY, String(Date.now())).catch((error) => {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'home_dismiss_goal_celebration',
      });
    });
  }, []);

  return {
    data,
    status,
    isLoading: status === 'loading',
    reload,
    incrementPouches,
    decrementPouches,
    incrementCravings,
    decrementCravings,
    dismissPaceNudge,
    dismissGoalCelebration,
  };
}
