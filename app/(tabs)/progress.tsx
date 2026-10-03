import { Screen } from '@/components/Screen';
import { Icon } from '@/components/ui/Icon';
import { captureError } from '@/lib/sentry';
import { getTaperSettings } from '@/lib/db-settings';
import { useDesignTokens } from '@/lib/design';
import type { TaperSettings } from '@/lib/models';
import { PatternsCard } from '@/components/PatternsCard';
import { DailyUsageCard } from '@/components/progress/DailyUsageCard';
import { MilestonesList } from '@/components/progress/MilestonesList';
import { TotalProgressCard } from '@/components/progress/TotalProgressCard';
import { getTrend, WeeklyStatsCard } from '@/components/progress/WeeklyStatsCard';
import { REVIEW_MIN_POUCHES_AVOIDED } from '@/lib/constants';
import { maybeRequestReview } from '@/lib/store-review';
import {
  calculateTotalProgressAndMilestones,
  calculateWeeklyProgress,
  getCurrentWeek,
  getDailyBreakdown,
  getPreviousWeek,
  getUsagePatterns,
  type DailyBreakdown,
  type Milestone,
  type TotalProgress,
  type UsagePatterns,
  type WeeklyProgress,
} from '@/lib/progress';
import { borderRadius, spacing, typography } from '@/lib/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Generate a contextual insight sentence from weekly data */
function getWeeklyInsight(
  week: WeeklyProgress,
  previousWeek: WeeklyProgress | null,
  isCurrentWeek: boolean,
): string {
  const { daysUnderLimit, pouchesAvoided, cravingsResisted, actualUsed, baselineTotal } = week;

  // Compare to previous week
  if (previousWeek && isCurrentWeek && previousWeek.actualUsed > 0) {
    const change = previousWeek.actualUsed - actualUsed;
    if (change > 0) {
      return `You're using ${change} fewer pouches than last week. Keep it up!`;
    }
  }

  // Only days with entries count here: a week that is mostly unlogged is not
  // a perfect week, it is an unknown one (#320).
  if (daysUnderLimit >= 7) {
    return 'Perfect week, you stayed under your limit every single day.';
  }
  if (daysUnderLimit >= 5) {
    return `Strong week with ${daysUnderLimit} days under your limit.`;
  }
  if (cravingsResisted > 0 && pouchesAvoided > 0) {
    return `You resisted ${cravingsResisted} craving${cravingsResisted !== 1 ? 's' : ''} and avoided ${pouchesAvoided} pouches.`;
  }
  if (pouchesAvoided > 0) {
    return `${pouchesAvoided} pouches avoided compared to your baseline.`;
  }
  if (baselineTotal === 0) {
    return 'Start logging to see your weekly progress here.';
  }
  return "Every day is a chance to make progress. You've got this.";
}

// ──────────────────────────────────────────────
// Main screen
// ──────────────────────────────────────────────

export default function ProgressScreen() {
  const { colors } = useDesignTokens();
  const [settings, setSettings] = useState<TaperSettings | null>(null);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeeklyProgress | null>(null);
  const [previousWeek, setPreviousWeek] = useState<WeeklyProgress | null>(null);
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdown[]>([]);
  const [prevDailyBreakdown, setPrevDailyBreakdown] = useState<DailyBreakdown[]>([]);
  const [totalProgress, setTotalProgress] = useState<TotalProgress | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [patterns, setPatterns] = useState<UsagePatterns | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviousWeek, setShowPreviousWeek] = useState(false);
  const settingsIdRef = useRef<number | null>(null);
  const lastLoadedRef = useRef(0);
  const s = useMemo(() => createStyles(colors), [colors]);

  const loadData = useCallback(async (force = false) => {
    if (!force && Date.now() - lastLoadedRef.current < 2000) return;
    try {
      setIsLoading(true);

      const currentSettings = await getTaperSettings();
      if (!currentSettings) {
        setSettings(null);
        setSettingsId(null);
        settingsIdRef.current = null;
        setCurrentWeek(null);
        setPreviousWeek(null);
        setDailyBreakdown([]);
        setPrevDailyBreakdown([]);
        setTotalProgress(null);
        setMilestones([]);
        setPatterns(null);
        setIsLoading(false);
        return;
      }

      const prevSettingsId = settingsIdRef.current;
      if (prevSettingsId !== null && prevSettingsId !== currentSettings.id) {
        setSettings(null);
        setCurrentWeek(null);
        setPreviousWeek(null);
        setDailyBreakdown([]);
        setPrevDailyBreakdown([]);
        setTotalProgress(null);
        setMilestones([]);
        setPatterns(null);
        setShowPreviousWeek(false);
      }

      setSettings(currentSettings);
      setSettingsId(currentSettings.id);
      settingsIdRef.current = currentSettings.id;

      const { start: currentStart, end: currentEnd } = getCurrentWeek();
      const { start: prevStart, end: prevEnd } = getPreviousWeek();

      // Six independent reads hit the same DB; running them sequentially used
      // to add up to ~6× the DB round-trip latency. Promise.all lets the SQLite
      // driver pipeline them — each call still goes through the migration-
      // gated init, but the awaits no longer block each other.
      const [
        currentWeekData,
        currentBreakdown,
        previousWeekData,
        prevBreakdown,
        totalAndMilestones,
        usagePatterns,
      ] = await Promise.all([
        calculateWeeklyProgress(currentSettings, currentStart, currentEnd),
        getDailyBreakdown(currentSettings, currentStart, currentEnd),
        calculateWeeklyProgress(currentSettings, prevStart, prevEnd),
        getDailyBreakdown(currentSettings, prevStart, prevEnd),
        calculateTotalProgressAndMilestones(currentSettings),
        getUsagePatterns(currentSettings),
      ]);

      setCurrentWeek(currentWeekData);
      setDailyBreakdown(currentBreakdown);
      setPreviousWeek(previousWeekData);
      setPrevDailyBreakdown(prevBreakdown);
      setTotalProgress(totalAndMilestones.progress);
      setMilestones(totalAndMilestones.milestones);
      setPatterns(usagePatterns);

      // Positive-moment review ask (#180): only once real progress exists.
      // maybeRequestReview self-limits (plan age, 90-day gap, availability).
      if (totalAndMilestones.progress.totalPouchesAvoided >= REVIEW_MIN_POUCHES_AVOIDED) {
        void maybeRequestReview(currentSettings.startDate);
      }
      lastLoadedRef.current = Date.now();
    } catch (error) {
      if (__DEV__) console.error('Error loading progress:', error);
      if (error instanceof Error) captureError(error, { context: 'progress_load_data' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // Full-screen loader on first load
  if (isLoading && (!settings || !currentWeek || !totalProgress)) {
    return (
      <Screen>
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>Loading progress...</Text>
        </View>
      </Screen>
    );
  }

  if (!settings || !currentWeek || !totalProgress) {
    return (
      <Screen>
        <View style={s.emptyContainer}>
          <View style={s.emptyIcon}>
            <Icon name="chart-line-up" size={48} color={colors.text.tertiary} weight="duotone" />
          </View>
          <Text style={s.emptyTitle}>No progress yet</Text>
          <Text style={s.emptyText}>
            Complete onboarding and start logging to see your progress here.
          </Text>
        </View>
      </Screen>
    );
  }

  const currency = settings.currency ?? 'DKK';
  const weekData = showPreviousWeek && previousWeek ? previousWeek : currentWeek;
  const chartData = showPreviousWeek ? prevDailyBreakdown : dailyBreakdown;
  const isCurrentWeek = !showPreviousWeek;
  const screenKey = `progress-screen-${settingsId || 'no-settings'}`;

  // Trend: compare current week's usage to previous week, shown on the current week only
  const usageTrend =
    isCurrentWeek && previousWeek
      ? getTrend(currentWeek.actualUsed, previousWeek.actualUsed)
      : null;

  return (
    <Screen key={screenKey}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => loadData(true)} />}
      >
        <View style={s.content}>
          {/* ── Weekly Insight ── */}
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={s.insight}>{getWeeklyInsight(weekData, previousWeek, isCurrentWeek)}</Text>
          </Animated.View>

          {/* ── Segmented Week Selector ── */}
          <View style={[s.segmentedControl, { backgroundColor: colors.background.muted }]}>
            <TouchableOpacity
              style={[
                s.segment,
                !showPreviousWeek && [s.segmentActive, { backgroundColor: colors.surface.default }],
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: !showPreviousWeek }}
              onPress={() => setShowPreviousWeek(false)}
            >
              <Text style={[s.segmentText, !showPreviousWeek && s.segmentTextActive]}>
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.segment,
                showPreviousWeek && [s.segmentActive, { backgroundColor: colors.surface.default }],
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: showPreviousWeek }}
              onPress={() => setShowPreviousWeek(true)}
            >
              <Text style={[s.segmentText, showPreviousWeek && s.segmentTextActive]}>
                Last Week
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Bar Chart ── */}
          {chartData.length > 0 && <DailyUsageCard data={chartData} style={s.card} />}

          {/* ── Weekly Stats ── */}
          <WeeklyStatsCard week={weekData} trend={usageTrend} currency={currency} style={s.card} />

          {/* ── Total Progress ── */}
          <TotalProgressCard total={totalProgress} currency={currency} style={s.card} />

          {/* ── Usage Patterns ── */}
          {patterns && (
            <PatternsCard
              patterns={patterns}
              hasTriggersConfigured={(settings.triggers?.length ?? 0) > 0}
              style={s.card}
            />
          )}

          {/* ── Milestones ── */}
          <MilestonesList milestones={milestones} style={s.card} />

          {/* ── Dynamic Encouragement ── */}
          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <Text style={s.encouragement}>
              {totalProgress.daysSinceStart <= 3
                ? 'You just started — the first days are the hardest. One step at a time.'
                : totalProgress.totalPouchesAvoided > 50
                  ? `${totalProgress.totalPouchesAvoided} pouches avoided is real, tangible progress.`
                  : "Progress isn't about perfection — it's about moving in the right direction."}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </Screen>
  );
}

// ──────────────────────────────────────────────
// Styles
// ──────────────────────────────────────────────

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    } as ViewStyle,
    content: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: 0,
    } as ViewStyle,

    // Loading / Empty
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    loadingText: {
      ...typography.caption,
      color: colors.text.secondary,
      marginTop: spacing.sm,
    } as TextStyle,
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    } as ViewStyle,
    emptyIcon: {
      marginBottom: spacing.md,
    } as ViewStyle,
    emptyTitle: {
      ...typography.xl,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.sm,
    } as TextStyle,
    emptyText: {
      ...typography.body,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
    } as TextStyle,

    // Insight
    insight: {
      ...typography.body,
      color: colors.text.secondary,
      lineHeight: 22,
      marginBottom: spacing.lg,
    } as TextStyle,

    // Segmented control (iOS-style)
    segmentedControl: {
      flexDirection: 'row',
      borderRadius: borderRadius.sm,
      padding: 3,
      marginBottom: spacing.lg,
    } as ViewStyle,
    segment: {
      flex: 1,
      // 44pt minimum touch target per IAMJARL / Apple HIG. Previously paddingVertical:
      // spacing.sm produced ~32-36pt rows which fail accessibility on phone-only.
      minHeight: 44,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.sm - 2,
    } as ViewStyle,
    segmentActive: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    } as ViewStyle,
    segmentText: {
      ...typography.sm,
      fontWeight: '600',
      color: colors.text.secondary,
    } as TextStyle,
    segmentTextActive: {
      color: colors.text.primary,
      fontWeight: '600',
    } as TextStyle,

    // Cards
    card: {
      marginBottom: spacing.md,
    } as ViewStyle,

    // Encouragement
    encouragement: {
      ...typography.sm,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.xxl,
      lineHeight: 20,
      paddingHorizontal: spacing.lg,
    } as TextStyle,
  });
