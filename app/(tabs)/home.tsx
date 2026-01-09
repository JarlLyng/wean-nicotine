import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { spacing, colors, typography } from '@/lib/theme';
import { getUserPlan } from '@/lib/db-user-plan';
import { getTaperSettings } from '@/lib/db-settings';
import { calculateDailyAllowance } from '@/lib/taper-plan';
import { createLogEntry } from '@/lib/db-log-entries';
import { getLogEntriesForDay } from '@/lib/db-log-entries';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const [dailyAllowance, setDailyAllowance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pouchesUsedToday, setPouchesUsedToday] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const [settingsId, setSettingsId] = useState<number | null>(null); // Track settings ID to force re-render

  const loadData = useCallback(async () => {
    try {
      console.log('Home screen: Loading data...');
      setIsLoading(true);
      const userPlan = await getUserPlan();
      console.log('Home screen: User plan:', userPlan);
      
      if (!userPlan) {
        console.log('Home screen: No user plan found');
        setDailyAllowance(null);
        setPouchesUsedToday(0);
        return;
      }

      // Get settings to check if we need to recalculate
      const settings = await getTaperSettings();
      console.log('Home screen: Settings:', settings);
      
      if (!settings) {
        console.log('Home screen: No settings found');
        setDailyAllowance(null);
        setPouchesUsedToday(0);
        setSettingsId(null);
        return;
      }

      // Always recalculate daily allowance from settings to ensure it's up-to-date
      // This ensures that if settings changed (e.g., after "Start Over"), we use the new values
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastCalculated = new Date(userPlan.lastCalculatedDate);
      lastCalculated.setHours(0, 0, 0, 0);

      // Recalculate allowance based on current settings and date
      // This ensures we always show the correct allowance, especially after reset/onboarding
      const allowance = calculateDailyAllowance(settings, today);
      console.log('Home screen: Calculated allowance:', allowance, 'from settings:', {
        baseline: settings.baselinePouchesPerDay,
        startDate: new Date(settings.startDate).toISOString(),
        reductionPercent: settings.weeklyReductionPercent,
        settingsId: settings.id,
      });

      // Update settings ID to force re-render if settings changed
      setSettingsId(settings.id);
      // Force state update
      setDailyAllowance(allowance);
      console.log('Home screen: State updated - dailyAllowance:', allowance, 'settingsId:', settings.id);

      // Load pouches used today
      const todayLogs = await getLogEntriesForDay(today);
      const usedCount = todayLogs.filter(log => log.type === 'pouch_used').length;
      setPouchesUsedToday(usedCount);
    } catch (error) {
      console.error('Error loading data:', error);
      setDailyAllowance(null);
      setPouchesUsedToday(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen: useFocusEffect triggered');
      // Force reload by resetting state first
      setDailyAllowance(null);
      setPouchesUsedToday(0);
      setSettingsId(null);
      setIsLoading(true);
      // Then load fresh data
      loadData();
    }, [loadData])
  );

  // Also load on mount as backup
  useEffect(() => {
    console.log('Home screen: useEffect (mount) triggered');
    loadData();
  }, [loadData]);

  const handleLogPouch = async () => {
    try {
      setIsLogging(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await createLogEntry('pouch_used');
      await loadData(); // Reload to update count
    } catch (error) {
      console.error('Error logging pouch:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const handleLogCravingResisted = async () => {
    try {
      setIsLogging(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await createLogEntry('craving_resisted');
      await loadData(); // Reload to update count
    } catch (error) {
      console.error('Error logging craving resisted:', error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Screen variant="gradient" title="Today">
      <View style={styles.content}>
        {isLoading ? (
          <Card variant="elevated" style={styles.card} padding="lg">
            <ActivityIndicator size="large" color={colors.accentStart} />
          </Card>
        ) : dailyAllowance !== null ? (
          <>
            {/* Daily Allowance Card with Progress Ring */}
            <Card key={`allowance-card-${settingsId}-${dailyAllowance}`} variant="elevated" style={styles.card} padding="lg">
              <Text style={styles.label}>Your Daily Allowance</Text>
              
              {/* Progress Ring Visualization */}
              <View style={styles.progressContainer}>
                <ProgressRing
                  key={`progress-${settingsId}-${dailyAllowance}`}
                  progress={Math.min(pouchesUsedToday / dailyAllowance, 1)}
                  size={120}
                  strokeWidth={12}
                  color={colors.accentStart}
                  showLabel={true}
                  label={`${pouchesUsedToday}/${Math.round(dailyAllowance)}`}
                  sublabel="pouches"
                />
              </View>

              {/* Used vs Remaining Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{pouchesUsedToday}</Text>
                  <Text style={styles.statLabel}>Used</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {Math.max(0, Math.round(dailyAllowance - pouchesUsedToday))}
                  </Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
              </View>
            </Card>

            {/* Action Buttons */}
            <View style={styles.loggingButtons}>
              <Button
                title="Used a pouch"
                onPress={handleLogPouch}
                disabled={isLogging}
                loading={isLogging}
                variant="primary"
                style={styles.logButton}
              />
              <Button
                title="Resisted craving"
                onPress={handleLogCravingResisted}
                disabled={isLogging}
                loading={isLogging}
                variant="secondary"
                style={styles.logButton}
              />
            </View>
          </>
        ) : (
          <Card variant="elevated" style={styles.card} padding="lg">
            <Text style={styles.placeholderText}>
              Daily allowance will appear here
            </Text>
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  card: {
    marginTop: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.title,
    fontSize: 24,
    fontWeight: '700',
    color: colors.accentStart,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.lg,
  },
  loggingButtons: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  logButton: {
    width: '100%',
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
