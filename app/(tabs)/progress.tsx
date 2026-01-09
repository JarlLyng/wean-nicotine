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
import { animations, borderRadius, colors, spacing, typography } from '@/lib/theme';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

export default function ProgressScreen() {
  const [settings, setSettings] = useState<TaperSettings | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeeklyProgress | null>(null);
  const [previousWeek, setPreviousWeek] = useState<WeeklyProgress | null>(null);
  const [totalProgress, setTotalProgress] = useState<any>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreviousWeek, setShowPreviousWeek] = useState(false);

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
        setIsLoading(false);
        return;
      }

      setSettings(currentSettings);

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
        <View style={styles.loadingContainer}>
          <Text>Loading progress...</Text>
        </View>
      </Screen>
    );
  }

  if (!settings || !currentWeek || !totalProgress) {
    return (
      <Screen>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No progress data available</Text>
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
  const screenKey = `progress-screen-${settings?.id || 'no-settings'}`;
  
  return (
    <Screen key={screenKey} variant="gradient" title="Progress">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}>
        <View style={styles.content}>
          {/* Week Selector */}
          <View style={styles.weekSelector}>
            <TouchableOpacity
              style={[styles.weekButton, !showPreviousWeek && styles.weekButtonActive]}
              onPress={() => setShowPreviousWeek(false)}>
              <Text style={[styles.weekButtonText, !showPreviousWeek && styles.weekButtonTextActive]}>
                This Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.weekButton, showPreviousWeek && styles.weekButtonActive]}
              onPress={() => setShowPreviousWeek(true)}>
              <Text style={[styles.weekButtonText, showPreviousWeek && styles.weekButtonTextActive]}>
                Previous Week
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Stats Card */}
          <Card variant="elevated" style={styles.card} padding="lg">
            <Text style={styles.cardTitle}>{weekLabel}</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weekData.pouchesAvoided ?? 0}</Text>
                <Text style={styles.statLabel}>Pouches Avoided</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{weekData.daysUnderLimit ?? 0}</Text>
                <Text style={styles.statLabel}>Days Under Limit</Text>
              </View>
            </View>
            {weekData.moneySaved && weekData.moneySaved > 0 && (
              <View style={styles.moneyRow}>
                <Text style={styles.moneyLabel}>Money Saved:</Text>
                <Text style={styles.moneyValue}>${((weekData.moneySaved ?? 0) / 100).toFixed(2)}</Text>
              </View>
            )}
          </Card>

          {/* Total Progress Card */}
          <Card variant="elevated" style={styles.card} padding="lg">
            <Text style={styles.cardTitle}>Total Progress</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalProgress.totalPouchesAvoided ?? 0}</Text>
                <Text style={styles.statLabel}>Total Pouches Avoided</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalProgress.daysSinceStart ?? 0}</Text>
                <Text style={styles.statLabel}>Days Since Start</Text>
              </View>
            </View>
            {totalProgress.totalMoneySaved && totalProgress.totalMoneySaved > 0 && (
              <View style={styles.moneyRow}>
                <Text style={styles.moneyLabel}>Total Money Saved:</Text>
                <Text style={styles.moneyValue}>
                  ${((totalProgress.totalMoneySaved ?? 0) / 100).toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.averageRow}>
              <Text style={styles.averageLabel}>Average Daily Usage:</Text>
              <Text style={styles.averageValue}>
                {(totalProgress.averageDailyUsage ?? 0).toFixed(1)} pouches/day
              </Text>
            </View>
          </Card>

          {/* Milestones Card */}
          {milestones.length > 0 && (
            <Card variant="elevated" style={styles.card} padding="lg">
              <Text style={styles.cardTitle}>Milestones</Text>
              {milestones.map((milestone, index) => (
                <Animated.View
                  key={milestone.id}
                  style={styles.milestoneItem}
                  entering={FadeInRight.delay(index * 100).duration(animations.normal).springify()}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                  <Text style={styles.milestoneDate}>
                    {new Date(milestone.achievedAt).toLocaleDateString()}
                  </Text>
                </Animated.View>
              ))}
            </Card>
          )}

          {/* Encouragement Message */}
          <Card variant="flat" style={styles.encouragementCard} padding="md">
            <Text style={styles.encouragementText}>
              Every step forward counts. Progress isn't about perfection — it's about moving in the
              right direction.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    color: colors.textSecondary,
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
    borderColor: colors.neutral[200],
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  weekButtonActive: {
    borderColor: colors.accentStart,
    backgroundColor: colors.accentStart,
  },
  weekButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
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
    color: colors.textPrimary,
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
    color: colors.accentStart,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  moneyLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  moneyValue: {
    ...typography['2xl'],
    fontWeight: 'bold',
    color: colors.accentStart,
  },
  averageRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  averageLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  averageValue: {
    ...typography.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  milestoneItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  milestoneTitle: {
    ...typography.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  milestoneDescription: {
    ...typography.caption,
    color: colors.textSecondary,
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
    color: colors.semantic.success.dark,
    lineHeight: 20,
    textAlign: 'center',
  },
});
