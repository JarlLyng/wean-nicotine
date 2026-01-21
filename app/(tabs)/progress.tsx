import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { formatMoney } from '@/lib/currency';
import { getTaperSettings } from '@/lib/db-settings';
import { useDesignTokens } from '@/lib/design';
import type { TaperSettings } from '@/lib/models';
import {
    calculateTotalProgress,
    calculateWeeklyProgress,
    detectMilestones,
    getCurrentWeek,
    getPreviousWeek,
    type Milestone,
    type WeeklyProgress,
} from '@/lib/progress';
import { animations, borderRadius, spacing, typography } from '@/lib/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function ProgressScreen() {
  const { colors } = useDesignTokens();
  const devLog = (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  };
  const [settings, setSettings] = useState<TaperSettings | null>(null);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeeklyProgress | null>(null);
  const [previousWeek, setPreviousWeek] = useState<WeeklyProgress | null>(null);
  const [totalProgress, setTotalProgress] = useState<any>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviousWeek, setShowPreviousWeek] = useState(false);
  const settingsIdRef = useRef<number | null>(null);
  const progressStyles = createProgressStyles(colors);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const currentSettings = await getTaperSettings();
      if (!currentSettings) {
        setSettings(null);
        setSettingsId(null);
        settingsIdRef.current = null;
        setCurrentWeek(null);
        setPreviousWeek(null);
        setTotalProgress(null);
        setMilestones([]);
        setIsLoading(false);
        return;
      }

      // Check if settings have changed (e.g., after reset/onboarding)
      const prevSettingsId = settingsIdRef.current;
      if (prevSettingsId !== null && prevSettingsId !== currentSettings.id) {
        devLog('Progress screen: Settings changed! Old ID:', prevSettingsId, 'New ID:', currentSettings.id);
        // Settings have changed - reset everything
        setSettings(null);
        setCurrentWeek(null);
        setPreviousWeek(null);
        setTotalProgress(null);
        setMilestones([]);
        setShowPreviousWeek(false);
      }

      setSettings(currentSettings);
      setSettingsId(currentSettings.id);
      settingsIdRef.current = currentSettings.id;

      // Calculate current week progress
      const { start: currentStart, end: currentEnd } = getCurrentWeek();
      devLog('Progress screen: Calculating current week progress from', currentStart.toISOString(), 'to', currentEnd.toISOString());
      const currentWeekData = await calculateWeeklyProgress(
        currentSettings,
        currentStart,
        currentEnd
      );
      devLog('Progress screen: Current week data:', currentWeekData);
      setCurrentWeek(currentWeekData);

      // Calculate previous week progress
      const { start: prevStart, end: prevEnd } = getPreviousWeek();
      const previousWeekData = await calculateWeeklyProgress(
        currentSettings,
        prevStart,
        prevEnd
      );
      setPreviousWeek(previousWeekData);

      // Calculate total progress
      devLog('Progress screen: Calculating total progress from start date', new Date(currentSettings.startDate).toISOString());
      const total = await calculateTotalProgress(currentSettings);
      devLog('Progress screen: Total progress data:', total);
      setTotalProgress(total);

      // Detect milestones
      const detectedMilestones = await detectMilestones(currentSettings);
      setMilestones(detectedMilestones);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {};
    }, [loadData])
  );

  // Only show the full-screen loader on first load (or when we truly have no data yet).
  if (isLoading && (!settings || !currentWeek || !totalProgress)) {
    return (
      <Screen>
        <View style={progressStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={progressStyles.loadingText}>Loading progress...</Text>
        </View>
      </Screen>
    );
  }

  if (!settings || !currentWeek || !totalProgress) {
    return (
      <Screen>
        <View style={progressStyles.emptyContainer}>
          <Text style={progressStyles.emptyText}>No data yet. Complete onboarding to start tracking.</Text>
        </View>
      </Screen>
    );
  }

  const currency = settings.currency ?? 'DKK';

  const weekData = showPreviousWeek && previousWeek ? previousWeek : currentWeek;
  const weekLabel = showPreviousWeek ? 'Previous Week' : 'This Week';

  if (!weekData) {
    return (
      <Screen>
        <View style={progressStyles.emptyContainer}>
          <Text style={progressStyles.emptyText}>No data yet. Complete onboarding to start tracking.</Text>
        </View>
      </Screen>
    );
  }

  // Force remount when settings change (after onboarding/reset)
  const screenKey = `progress-screen-${settingsId || 'no-settings'}`;
  
  return (
    <Screen key={screenKey} title="Progress">
      <ScrollView
        contentContainerStyle={progressStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}>
        <View style={progressStyles.content}>
          {/* Week Selector */}
          <View style={progressStyles.weekSelector}>
            <TouchableOpacity
              style={[progressStyles.weekButton, !showPreviousWeek && progressStyles.weekButtonActive]}
              accessibilityRole="button"
              accessibilityLabel="This week"
              accessibilityState={{ selected: !showPreviousWeek }}
              onPress={() => setShowPreviousWeek(false)}>
              <Text style={[progressStyles.weekButtonText, !showPreviousWeek && progressStyles.weekButtonTextActive]}>
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[progressStyles.weekButton, showPreviousWeek && progressStyles.weekButtonActive]}
              accessibilityRole="button"
              accessibilityLabel="Previous week"
              accessibilityState={{ selected: showPreviousWeek }}
              onPress={() => setShowPreviousWeek(true)}>
              <Text style={[progressStyles.weekButtonText, showPreviousWeek && progressStyles.weekButtonTextActive]}>
                Previous Week
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Stats Card */}
          <Card variant="elevated" style={progressStyles.card} padding="lg">
            <Text style={progressStyles.cardTitle}>{weekLabel}</Text>
            <View style={progressStyles.statRow}>
              <View style={progressStyles.statItem}>
                <Text style={progressStyles.statValue}>{Number(weekData.pouchesAvoided ?? 0)}</Text>
                <Text style={progressStyles.statLabel}>Pouches Avoided</Text>
              </View>
              <View style={progressStyles.statItem}>
                <Text style={progressStyles.statValue}>{Number(weekData.daysUnderLimit ?? 0)}</Text>
                <Text style={progressStyles.statLabel}>Days Under Limit</Text>
              </View>
              <View style={progressStyles.statItem}>
                <Text style={progressStyles.statValue}>{Number(weekData.cravingsResisted ?? 0)}</Text>
                <Text style={progressStyles.statLabel}>Cravings Resisted</Text>
              </View>
            </View>
            {weekData.moneySaved !== undefined && weekData.moneySaved !== null && weekData.moneySaved > 0 && (
              <View style={progressStyles.moneyRow}>
                <Text style={progressStyles.moneyLabel}>Money Saved</Text>
                <Text style={progressStyles.moneyValue}>
                  {formatMoney(weekData.moneySaved ?? 0, currency)}
                </Text>
              </View>
            )}
          </Card>

          {/* Total Progress Card */}
          <Card variant="elevated" style={progressStyles.card} padding="lg">
            <Text style={progressStyles.cardTitle}>Total Progress</Text>
            <View style={progressStyles.statRow}>
              <View style={progressStyles.statItem}>
                <Text style={progressStyles.statValue}>{Number(totalProgress.totalPouchesAvoided ?? 0)}</Text>
                <Text style={progressStyles.statLabel}>Pouches Avoided</Text>
              </View>
              <View style={progressStyles.statItem}>
                <Text style={progressStyles.statValue}>{Number(totalProgress.daysSinceStart ?? 0)}</Text>
                <Text style={progressStyles.statLabel}>Total Days</Text>
              </View>
              <View style={progressStyles.statItem}>
                <Text style={progressStyles.statValue}>{Number(totalProgress.totalCravingsResisted ?? 0)}</Text>
                <Text style={progressStyles.statLabel}>Total Resisted</Text>
              </View>
            </View>
            {totalProgress.totalMoneySaved !== undefined && totalProgress.totalMoneySaved !== null && totalProgress.totalMoneySaved > 0 && (
              <View style={progressStyles.moneyRow}>
                <Text style={progressStyles.moneyLabel}>Total Money Saved</Text>
                <Text style={progressStyles.moneyValue}>
                  {formatMoney(totalProgress.totalMoneySaved ?? 0, currency)}
                </Text>
              </View>
            )}
            <View style={progressStyles.averageRow}>
              <Text style={progressStyles.averageLabel}>Average Daily Usage:</Text>
              <Text style={progressStyles.averageValue}>
                {(totalProgress.averageDailyUsage ?? 0).toFixed(1)} pouches/day
              </Text>
            </View>
          </Card>

          {/* Milestones Card */}
          {milestones.length > 0 && (
            <Card variant="elevated" style={progressStyles.card} padding="lg">
              <Text style={progressStyles.cardTitle}>Milestones</Text>
              {milestones.map((milestone, index) => (
                <Animated.View
                  key={milestone.id}
                  style={progressStyles.milestoneItem}
                  entering={FadeInRight.delay(index * 100).duration(animations.normal).springify()}>
                  <Text style={progressStyles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={progressStyles.milestoneDescription}>{milestone.description}</Text>
                  <Text style={progressStyles.milestoneDate}>
                    {new Date(milestone.achievedAt).toLocaleDateString()}
                  </Text>
                </Animated.View>
              ))}
            </Card>
          )}

          {/* Encouragement Message */}
          <Card variant="flat" style={progressStyles.encouragementCard} padding="md">
            <Text style={progressStyles.encouragementText}>
              Every step forward counts. Progress isn&apos;t about perfection — it&apos;s about moving in the
              right direction.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createProgressStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    // Match preview: remove left/right padding, keep vertical padding
    paddingVertical: spacing.md,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  weekSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  weekButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.subtle,
    backgroundColor: colors.surface.default,
    alignItems: 'center',
  },
  weekButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  weekButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  weekButtonTextActive: {
    color: colors.onPrimary,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.xl,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    // Match preview: 12px labels (e.g. "Days Under Limit")
    ...typography.xs,
    color: colors.text.secondary,
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  moneyLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  moneyValue: {
    ...typography['2xl'],
    fontWeight: 'bold',
    color: colors.primary,
  },
  averageRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  averageLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  averageValue: {
    ...typography.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  milestoneItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  milestoneTitle: {
    ...typography.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  milestoneDescription: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  milestoneDate: {
    ...typography.xs,
    color: colors.text.tertiary,
  },
  encouragementCard: {
    marginTop: spacing.md,
  },
  encouragementText: {
    ...typography.caption,
    color: colors.success,
    lineHeight: 20,
    textAlign: 'center',
  },
});
