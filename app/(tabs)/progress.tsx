import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { formatMoney } from '@/lib/currency';
import { captureError } from '@/lib/sentry';
import { getTaperSettings } from '@/lib/db-settings';
import { useDesignTokens } from '@/lib/design';
import type { TaperSettings } from '@/lib/models';
import {
    calculateTotalProgressAndMilestones,
    calculateWeeklyProgress,
    getCurrentWeek,
    getDailyBreakdown,
    getPreviousWeek,
    type DailyBreakdown,
    type Milestone,
    type TotalProgress,
    type WeeklyProgress,
} from '@/lib/progress';
import { animations, borderRadius, spacing, typography } from '@/lib/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** Icon + color for milestone type */
function milestoneIcon(type: Milestone['type']): { name: 'medal' | 'trophy' | 'lightning' | 'coins' | 'brain' | 'star'; color: string } {
  switch (type) {
    case 'first_day_under_limit': return { name: 'medal', color: '#FF9500' };
    case 'week_under_limit': return { name: 'trophy', color: '#FFD700' };
    case 'pouches_avoided': return { name: 'lightning', color: '#FF6B35' };
    case 'money_saved': return { name: 'coins', color: '#4CAF50' };
    case 'cravings_resisted': return { name: 'brain', color: '#CE63FF' };
    default: return { name: 'star', color: '#FF9500' };
  }
}

/** Generate a contextual insight sentence from weekly data */
function getWeeklyInsight(week: WeeklyProgress, previousWeek: WeeklyProgress | null, isCurrentWeek: boolean): string {
  const { daysUnderLimit, pouchesAvoided, cravingsResisted, actualUsed, baselineTotal } = week;

  // Compare to previous week
  if (previousWeek && isCurrentWeek && previousWeek.actualUsed > 0) {
    const change = previousWeek.actualUsed - actualUsed;
    if (change > 0) {
      return `You're using ${change} fewer pouches than last week. Keep it up!`;
    }
  }

  if (daysUnderLimit >= 7) {
    return 'Perfect week — you stayed under your limit every single day.';
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

/** Trend arrow + label comparing this vs. previous week */
function getTrend(current: number, previous: number): { arrow: string; label: string; isPositive: boolean } | null {
  if (previous === 0) return null;
  const diff = current - previous;
  if (diff === 0) return null;
  // For "used" lower is better, but this is generic — caller decides meaning
  return {
    arrow: diff > 0 ? '↑' : '↓',
    label: `${Math.abs(diff)}`,
    isPositive: diff < 0, // less usage is positive
  };
}

// ──────────────────────────────────────────────
// Bar chart component
// ──────────────────────────────────────────────

function WeekBarChart({ data, colors }: { data: DailyBreakdown[]; colors: ReturnType<typeof useDesignTokens>['colors'] }) {
  // Find max value for scaling (at least 1 to avoid division by zero)
  const maxVal = Math.max(1, ...data.map(d => Math.max(d.used, d.allowance)));
  const BAR_HEIGHT = 120;

  return (
    <View style={barStyles.container}>
      {data.map((day, i) => {
        const usedHeight = (day.used / maxVal) * BAR_HEIGHT;
        const allowanceHeight = (day.allowance / maxVal) * BAR_HEIGHT;
        const overLimit = day.used > day.allowance && !day.isFuture;
        const underLimit = day.used <= day.allowance && day.used > 0;

        return (
          <Animated.View
            key={day.dayLabel}
            style={barStyles.column}
            entering={FadeInDown.delay(i * 60).duration(300).springify()}>
            {/* Value label */}
            <Text style={[barStyles.valueLabel, { color: day.isFuture ? colors.text.tertiary : colors.text.primary }]}>
              {day.isFuture ? '–' : day.used}
            </Text>

            {/* Bar area */}
            <View style={[barStyles.barArea, { height: BAR_HEIGHT }]}>
              {/* Allowance line (dashed background) */}
              <View
                style={[
                  barStyles.allowanceLine,
                  {
                    bottom: allowanceHeight,
                    backgroundColor: colors.border.subtle,
                  },
                ]}
              />
              {/* Used bar */}
              <View
                style={[
                  barStyles.bar,
                  {
                    height: Math.max(day.isFuture ? 0 : 2, usedHeight),
                    backgroundColor: day.isFuture
                      ? colors.background.muted
                      : overLimit
                        ? colors.error
                        : underLimit
                          ? colors.primary
                          : colors.background.muted,
                    borderRadius: borderRadius.sm / 2,
                    opacity: day.isFuture ? 0.3 : 1,
                  },
                ]}
              />
            </View>

            {/* Day label */}
            <Text
              style={[
                barStyles.dayLabel,
                {
                  color: day.isToday ? colors.primary : colors.text.tertiary,
                  fontWeight: day.isToday ? '700' : '400',
                },
              ]}>
              {day.dayLabel}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  barArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: '55%',
    minWidth: 12,
    maxWidth: 28,
  },
  allowanceLine: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    height: 1.5,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
});

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
        setShowPreviousWeek(false);
      }

      setSettings(currentSettings);
      setSettingsId(currentSettings.id);
      settingsIdRef.current = currentSettings.id;

      const { start: currentStart, end: currentEnd } = getCurrentWeek();
      const currentWeekData = await calculateWeeklyProgress(currentSettings, currentStart, currentEnd);
      setCurrentWeek(currentWeekData);

      const currentBreakdown = await getDailyBreakdown(currentSettings, currentStart, currentEnd);
      setDailyBreakdown(currentBreakdown);

      const { start: prevStart, end: prevEnd } = getPreviousWeek();
      const previousWeekData = await calculateWeeklyProgress(currentSettings, prevStart, prevEnd);
      setPreviousWeek(previousWeekData);

      const prevBreakdown = await getDailyBreakdown(currentSettings, prevStart, prevEnd);
      setPrevDailyBreakdown(prevBreakdown);

      const { progress: total, milestones: detectedMilestones } =
        await calculateTotalProgressAndMilestones(currentSettings);
      setTotalProgress(total);
      setMilestones(detectedMilestones);
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
    }, [loadData])
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
          <Text style={s.emptyEmoji}>📊</Text>
          <Text style={s.emptyTitle}>No progress yet</Text>
          <Text style={s.emptyText}>Complete onboarding and start logging to see your progress here.</Text>
        </View>
      </Screen>
    );
  }

  const currency = settings.currency ?? 'DKK';
  const weekData = showPreviousWeek && previousWeek ? previousWeek : currentWeek;
  const chartData = showPreviousWeek ? prevDailyBreakdown : dailyBreakdown;
  const isCurrentWeek = !showPreviousWeek;
  const screenKey = `progress-screen-${settingsId || 'no-settings'}`;

  // Trend: compare current week's usage to previous week
  const usageTrend = previousWeek ? getTrend(currentWeek.actualUsed, previousWeek.actualUsed) : null;

  return (
    <Screen key={screenKey}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => loadData(true)} />}>
        <View style={s.content}>

          {/* ── Weekly Insight ── */}
          <Animated.View entering={FadeIn.duration(400)}>
            <Text style={s.insight}>
              {getWeeklyInsight(weekData, previousWeek, isCurrentWeek)}
            </Text>
          </Animated.View>

          {/* ── Segmented Week Selector ── */}
          <View style={[s.segmentedControl, { backgroundColor: colors.background.muted }]}>
            <TouchableOpacity
              style={[s.segment, !showPreviousWeek && [s.segmentActive, { backgroundColor: colors.surface.default }]]}
              accessibilityRole="button"
              accessibilityState={{ selected: !showPreviousWeek }}
              onPress={() => setShowPreviousWeek(false)}>
              <Text style={[s.segmentText, !showPreviousWeek && s.segmentTextActive]}>
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.segment, showPreviousWeek && [s.segmentActive, { backgroundColor: colors.surface.default }]]}
              accessibilityRole="button"
              accessibilityState={{ selected: showPreviousWeek }}
              onPress={() => setShowPreviousWeek(true)}>
              <Text style={[s.segmentText, showPreviousWeek && s.segmentTextActive]}>
                Last Week
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Bar Chart ── */}
          {chartData.length > 0 && (
            <Card variant="elevated" style={s.card} padding="lg">
              <View style={s.chartHeader}>
                <Text style={s.cardTitle}>Daily Usage</Text>
                <View style={s.legendRow}>
                  <View style={[s.legendDot, { backgroundColor: colors.primary }]} />
                  <Text style={s.legendText}>Under limit</Text>
                  <View style={[s.legendDot, { backgroundColor: colors.error }]} />
                  <Text style={s.legendText}>Over</Text>
                </View>
              </View>
              <WeekBarChart data={chartData} colors={colors} />
            </Card>
          )}

          {/* ── Weekly Stats ── */}
          <Card variant="elevated" style={s.card} padding="lg">
            <View style={s.statsGrid}>
              <View style={s.statBox}>
                <Icon name="minus" size={20} color={colors.primary} weight="regular" />
                <Text style={s.statValue}>{Number(weekData.pouchesAvoided ?? 0)}</Text>
                <Text style={s.statLabel}>Avoided</Text>
              </View>
              <View style={s.statBox}>
                <Icon name="check-circle" size={20} color={colors.success} weight="regular" />
                <Text style={s.statValue}>{Number(weekData.daysUnderLimit ?? 0)}/7</Text>
                <Text style={s.statLabel}>Days on track</Text>
              </View>
              <View style={s.statBox}>
                <Icon name="brain" size={20} color={colors.warning} weight="regular" />
                <Text style={s.statValue}>{Number(weekData.cravingsResisted ?? 0)}</Text>
                <Text style={s.statLabel}>Resisted</Text>
              </View>
            </View>

            {/* Trend indicator */}
            {usageTrend && isCurrentWeek && (
              <View style={s.trendRow}>
                <Text style={[s.trendArrow, { color: usageTrend.isPositive ? colors.success : colors.error }]}>
                  {usageTrend.arrow} {usageTrend.label}
                </Text>
                <Text style={s.trendLabel}>
                  {usageTrend.isPositive ? 'fewer' : 'more'} pouches vs. last week
                </Text>
              </View>
            )}

            {/* Money saved */}
            {weekData.moneySaved != null && weekData.moneySaved > 0 && (
              <View style={s.moneyRow}>
                <Text style={s.moneyLabel}>Saved this week</Text>
                <Text style={s.moneyValue}>
                  {formatMoney(weekData.moneySaved, currency)}
                </Text>
              </View>
            )}
          </Card>

          {/* ── Total Progress ── */}
          <Card variant="elevated" style={s.card} padding="lg">
            <Text style={s.cardTitle}>All Time</Text>
            <View style={s.statsGrid}>
              <View style={s.statBox}>
                <Text style={s.statValueLarge}>{Number(totalProgress.totalPouchesAvoided ?? 0)}</Text>
                <Text style={s.statLabel}>Pouches avoided</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statValueLarge}>{Number(totalProgress.daysSinceStart ?? 0)}</Text>
                <Text style={s.statLabel}>Days</Text>
              </View>
              <View style={s.statBox}>
                <Text style={s.statValueLarge}>{Number(totalProgress.totalCravingsResisted ?? 0)}</Text>
                <Text style={s.statLabel}>Resisted</Text>
              </View>
            </View>

            {totalProgress.totalMoneySaved != null && totalProgress.totalMoneySaved > 0 && (
              <View style={s.moneyRow}>
                <Text style={s.moneyLabel}>Total saved</Text>
                <Text style={s.moneyValue}>
                  {formatMoney(totalProgress.totalMoneySaved, currency)}
                </Text>
              </View>
            )}

            <View style={s.averageRow}>
              <Text style={s.averageLabel}>Average daily usage</Text>
              <Text style={s.averageValue}>
                {(totalProgress.averageDailyUsage ?? 0).toFixed(1)} / day
              </Text>
            </View>
          </Card>

          {/* ── Milestones ── */}
          {milestones.length > 0 && (
            <Card variant="elevated" style={s.card} padding="lg">
              <Text style={s.cardTitle}>Milestones</Text>
              {milestones.map((milestone, index) => {
                const badge = milestoneIcon(milestone.type);
                return (
                  <Animated.View
                    key={milestone.id}
                    style={[s.milestoneItem, index === milestones.length - 1 && s.milestoneItemLast]}
                    entering={FadeInRight.delay(index * 80).duration(animations.normal).springify()}>
                    <View style={[s.milestoneIconWrap, { backgroundColor: badge.color + '18' }]}>
                      <Icon name={badge.name} size={22} color={badge.color} weight="fill" />
                    </View>
                    <View style={s.milestoneContent}>
                      <Text style={s.milestoneTitle}>{milestone.title}</Text>
                      <Text style={s.milestoneDate}>
                        {new Date(milestone.achievedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </Card>
          )}

          {/* ── Dynamic Encouragement ── */}
          <Animated.View entering={FadeIn.delay(300).duration(400)}>
            <Text style={s.encouragement}>
              {totalProgress.daysSinceStart <= 3
                ? 'You just started — the first days are the hardest. One step at a time.'
                : totalProgress.totalPouchesAvoided > 50
                  ? `${totalProgress.totalPouchesAvoided} pouches avoided is real, tangible progress.`
                  : 'Progress isn\'t about perfection — it\'s about moving in the right direction.'}
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

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
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
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  } as TextStyle,
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
    paddingVertical: spacing.sm,
    alignItems: 'center',
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
    fontWeight: '500',
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
  cardTitle: {
    ...typography.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  } as TextStyle,

  // Chart header
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  } as ViewStyle,
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  } as ViewStyle,
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,
  legendText: {
    ...typography.xs,
    color: colors.text.tertiary,
    marginRight: spacing.sm,
  } as TextStyle,

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  statBox: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  } as ViewStyle,
  statValue: {
    ...typography.xl,
    fontWeight: '700',
    color: colors.text.primary,
  } as TextStyle,
  statValueLarge: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: colors.primary,
  } as TextStyle,
  statLabel: {
    ...typography.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,

  // Trend
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    gap: spacing.xs,
  } as ViewStyle,
  trendArrow: {
    ...typography.sm,
    fontWeight: '700',
  } as TextStyle,
  trendLabel: {
    ...typography.sm,
    color: colors.text.secondary,
  } as TextStyle,

  // Money
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  } as ViewStyle,
  moneyLabel: {
    ...typography.body,
    color: colors.text.secondary,
  } as TextStyle,
  moneyValue: {
    ...typography.xl,
    fontWeight: '700',
    color: colors.primary,
  } as TextStyle,

  // Average
  averageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  } as ViewStyle,
  averageLabel: {
    ...typography.sm,
    color: colors.text.secondary,
  } as TextStyle,
  averageValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  } as TextStyle,

  // Milestones
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    gap: spacing.md,
  } as ViewStyle,
  milestoneItemLast: {
    borderBottomWidth: 0,
  } as ViewStyle,
  milestoneIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  milestoneContent: {
    flex: 1,
  } as ViewStyle,
  milestoneTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  } as TextStyle,
  milestoneDate: {
    ...typography.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  } as TextStyle,

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
