import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing, colors } from '@/lib/theme';
import { getTaperSettings } from '@/lib/db-settings';
import {
  calculateWeeklyProgress,
  calculateTotalProgress,
  detectMilestones,
  getCurrentWeek,
  getPreviousWeek,
  type WeeklyProgress,
  type Milestone,
} from '@/lib/progress';
import type { TaperSettings } from '@/lib/models';

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
      const currentSettings = await getTaperSettings();
      if (!currentSettings) {
        setIsLoading(false);
        return;
      }

      setSettings(currentSettings);

      // Calculate current week progress
      const { start: currentStart, end: currentEnd } = getCurrentWeek();
      const currentWeekData = await calculateWeeklyProgress(
        currentSettings,
        currentStart,
        currentEnd
      );
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
      const total = await calculateTotalProgress(currentSettings);
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
      loadData();
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

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} />}>
        <View style={styles.content}>
          <Text style={styles.title}>Progress</Text>

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
          <View style={styles.card}>
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
          </View>

          {/* Total Progress Card */}
          <View style={styles.card}>
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
          </View>

          {/* Milestones Card */}
          {milestones.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Milestones</Text>
              {milestones.map((milestone) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                  <Text style={styles.milestoneDate}>
                    {new Date(milestone.achievedAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Encouragement Message */}
          <View style={styles.encouragementCard}>
            <Text style={styles.encouragementText}>
              Every step forward counts. Progress isn't about perfection — it's about moving in the
              right direction.
            </Text>
          </View>
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
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  weekSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  weekButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  weekButtonActive: {
    borderColor: colors.accentStart,
    backgroundColor: colors.accentStart,
  },
  weekButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  weekButtonTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: '#333',
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
    fontSize: 14,
    color: '#666',
  },
  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  moneyLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  moneyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accentStart,
  },
  averageRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  averageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xs,
  },
  averageValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  milestoneItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.xs,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xs,
  },
  milestoneDate: {
    fontSize: 12,
    color: '#999',
  },
  encouragementCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  encouragementText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
    textAlign: 'center',
  },
});
