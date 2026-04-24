/**
 * useHomeData — loads and maintains the Today screen's data.
 *
 * Encapsulates:
 *  - Reading taper settings + user plan from the DB
 *  - Recreating a missing user plan (self-healing)
 *  - Calculating today's allowance via taper-plan math
 *  - Counting today's pouches and cravings resisted
 *  - Reloading when the screen comes back into focus
 *
 * Exposes both a reload function and optimistic mutators so the UI layer
 * can update counters instantly (one-tap logging) and reconcile with the
 * DB in the background. Errors are swallowed into EMPTY_DATA and reported
 * to Sentry — the screen always renders something.
 */

import { useState, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getUserPlan, saveUserPlan } from '@/lib/db-user-plan';
import { getTaperSettings } from '@/lib/db-settings';
import { calculateDailyAllowance } from '@/lib/taper-plan';
import { getLogEntriesForDay } from '@/lib/db-log-entries';
import { captureError } from '@/lib/sentry';

export interface HomeData {
  dailyAllowance: number | null;
  pouchesUsedToday: number;
  cravingsResistedToday: number;
  baselinePouchesPerDay: number | null;
  settingsId: number | null;
}

const EMPTY_DATA: HomeData = {
  dailyAllowance: null,
  pouchesUsedToday: 0,
  cravingsResistedToday: 0,
  baselinePouchesPerDay: null,
  settingsId: null,
};

export interface UseHomeDataResult {
  data: HomeData;
  isLoading: boolean;
  reload: (options?: { showLoading?: boolean }) => Promise<void>;
  incrementPouches: () => void;
  decrementPouches: () => void;
  incrementCravings: () => void;
  decrementCravings: () => void;
}

export function useHomeData(): UseHomeDataResult {
  const [data, setData] = useState<HomeData>(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(false);

  const reload = useCallback(
    async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      try {
        if (showLoading) setIsLoading(true);

        const settings = await getTaperSettings();
        if (!settings) {
          setData(EMPTY_DATA);
          return;
        }

        // Self-heal: if user_plan is missing, recreate it from settings
        let userPlan = await getUserPlan();
        if (!userPlan) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const allowance = calculateDailyAllowance(settings, today);
          await saveUserPlan(
            {
              settingsId: settings.id,
              currentDailyAllowance: allowance,
              lastCalculatedDate: Date.now(),
            },
            true,
          );
          userPlan = await getUserPlan();
          if (!userPlan) {
            setData(EMPTY_DATA);
            return;
          }
        }

        // Always recalculate allowance from settings — especially after reset/onboarding
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const calculatedAllowance = calculateDailyAllowance(settings, today);

        const todayLogs = await getLogEntriesForDay(today);
        const usedCount = todayLogs.filter((log) => log.type === 'pouch_used').length;
        const resistedCount = todayLogs.filter((log) => log.type === 'craving_resisted').length;

        setData({
          dailyAllowance: Math.round(calculatedAllowance * 10) / 10,
          pouchesUsedToday: usedCount,
          cravingsResistedToday: resistedCount,
          baselinePouchesPerDay: settings.baselinePouchesPerDay,
          settingsId: settings.id,
        });
      } catch (error) {
        captureError(
          error instanceof Error ? error : new Error(String(error)),
          { context: 'home_load_data' },
        );
        setData(EMPTY_DATA);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    },
    [],
  );

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
    setData((prev) => ({ ...prev, cravingsResistedToday: Math.max(0, prev.cravingsResistedToday - 1) }));
  }, []);

  return {
    data,
    isLoading,
    reload,
    incrementPouches,
    decrementPouches,
    incrementCravings,
    decrementCravings,
  };
}
