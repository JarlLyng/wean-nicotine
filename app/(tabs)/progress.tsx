import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { getTaperSettings } from '@/lib/db-settings';
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
import { useDesignTokens } from '@/lib/design';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function ProgressScreen() {
  const { colors } = useDesignTokens();
  const [settings, setSettings] = useState<TaperSettings | null>(null);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeeklyProgress | null>(null);
  const [previousWeek, setPreviousWeek] = useState<WeeklyProgress | null>(null);
  const [totalProgress, setTotalProgress] = useState<any>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviousWeek, setShowPreviousWeek] = useState(false);
  const progressStyles = createProgressStyles(colors);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Reset state to ensure fresh data
      setCurrentWeek(null);
      setPreviousWeek(null);
      setTotalProgress(null);
      setMilestones([]);
      
      const currentSettings = await getTaperSettings();
      if (!currentSettings) {
        setSettings(null);
        setSettingsId(null);
        setIsLoading(false);
        return;
      }

      // Check if settings have changed (e.g., after reset/onboarding)
      if (settingsId !== null && settingsId !== currentSettings.id) {
        console.log('Progress screen: Settings changed! Old ID:', settingsId, 'New ID:', currentSettings.id);
        // Settings have changed - reset everything
        setSettings(null);
        setCurrentWeek(null);
        setPreviousWeek(null);
        setTotalProgress(null);
        setMilestones([]);
      }

      setSettings(currentSettings);
      setSettingsId(currentSettings.id);

      // Calculate current week progress
      const { start: currentStart, end: currentEnd } = getCurrentWeek();
      console.log('Progress screen: Calculating current week progress from', currentStart.toISOString(), 'to', currentEnd.toISOString());
      const currentWeekData = await calculateWeeklyProgress(
        currentSettings,
        currentStart,
        currentEnd
      );
      console.log('Progress screen: Current week data:', currentWeekData);
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
      console.log('Progress screen: Calculating total progress from start date', new Date(currentSettings.startDate).toISOString());
      const total = await calculateTotalProgress(currentSettings);
      console.log('Progress screen: Total progress data:', total);
      setTotalProgress(total);

      // Detect milestones
      const detectedMilestones = await detectMilestones(currentSettings);
      setMilestones(detectedMilestones);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Reset state when screen comes into focus to ensure fresh data
      setSettings(null);
      setSettingsId(null);
      setCurrentWeek(null);
      setPreviousWeek(null);
      setTotalProgress(null);
      setMilestones([]);
      setIsLoading(true);
      // Small delay to ensure database is ready
      const timer = setTimeout(() => {
        loadData();
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }, [])
  );

  if (isLoading) {
    return (
      <Screen>
        <View style={progressStyles.loadingContainer}>
          <Text>Loading progress...</Text>
        </View>
      </Screen>
    );
  }

  if (!settings || !currentWeek || !totalProgress) {
    return (
      <Screen>
        <View style={progressStyles.emptyContainer}>
          <Text style={progressStyles.emptyText}>No progress data available</Text>
        </View>
      </Screen>
    );
  }

  const weekData = showPreviousWeek && previousWeek ? previousWeek : currentWeek;
  const weekLabel = showPreviousWeek ? 'Previous Week' : 'This Week';

  if (!weekData) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No progress data available</Text>
        </View>
      </Screen>
    );
  }

  // Force remount when settings change (after onboarding/reset)
  const screenKey = `progress-screen-${settingsId || 'no-settings'}`;
  
  return (
    <Screen key={screenKey} variant="gradient" title="Progress">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}>
        <View style={progressStyles.content}>
          {/* Week Selector */}
          <View style={progressStyles.weekSelector}>
            <TouchableOpacity
              style={[progressStyles.weekButton, !showPreviousWeek && progressStyles.weekButtonActive]}
              onPress={() => setShowPreviousWeek(false)}>
              <Text style={[progressStyles.weekButtonText, !showPreviousWeek && progressStyles.weekButtonTextActive]}>
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[progressStyles.weekButton, showPreviousWeek && progressStyles.weekButtonActive]}
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
            </View>
            {weekData.moneySaved !== undefined && weekData.moneySaved !== null && weekData.moneySaved > 0 && (
              <View style={progressStyles.moneyRow}>
                <Text style={progressStyles.moneyLabel}>Money Saved:</Text>
                <Text style={progressStyles.moneyValue}>${((weekData.moneySaved ?? 0) / 100).toFixed(2)}</Text>
              </View>
            )}
          </Card>

          {/* Total Progress Card */}
          <Card variant="elevated" style={progressStyles.card} padding="lg">
            <Text style={progressStyles.cardTitle}>Total Progress</Text>
            <View style={progressStyles.statRow}>
              <View style={progressStyles.statItem}>
                <Text style={progressStyles.statValue}>{Number(totalProgress.totalPouchesAvoided ?? 0)}</Text>
                <Text style={progressStyles.statLabel}>Total Pouches Avoided</Text>
              </View>
              <View style={progressStyles.statItem}>
                <Text style={progressStyles.statValue}>{Number(totalProgress.daysSinceStart ?? 0)}</Text>
                <Text style={progressStyles.statLabel}>Days Since Start</Text>
              </View>
            </View>
            {totalProgress.totalMoneySaved !== undefined && totalProgress.totalMoneySaved !== null && totalProgress.totalMoneySaved > 0 && (
              <View style={progressStyles.moneyRow}>
                <Text style={progressStyles.moneyLabel}>Total Money Saved:</Text>
                <Text style={progressStyles.moneyValue}>
                  ${((totalProgress.totalMoneySaved ?? 0) / 100).toFixed(2)}
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
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.text.inverse,
  },
  card: {
    marginBottom: spacing.md,
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
    ...typography.caption,
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
