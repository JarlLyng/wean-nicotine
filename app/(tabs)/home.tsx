import { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { getUserPlan } from '@/lib/db-user-plan';
import { getTaperSettings } from '@/lib/db-settings';
import { calculateDailyAllowance } from '@/lib/taper-plan';
import { createLogEntry, getLogEntriesForDay } from '@/lib/db-log-entries';
import { captureError } from '@/lib/sentry';
import * as Haptics from 'expo-haptics';

function formatAllowanceDisplay(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

export default function HomeScreen() {
  const { colors } = useDesignTokens();
  const [dailyAllowance, setDailyAllowance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pouchesUsedToday, setPouchesUsedToday] = useState(0);
  const [cravingsResistedToday, setCravingsResistedToday] = useState(0);
  const [baselinePouchesPerDay, setBaselinePouchesPerDay] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const isLoadingRef = useRef(false);

  const loadData = useCallback(async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    try {
      if (showLoading) setIsLoading(true);
      const settings = await getTaperSettings();

      if (!settings) {
        setDailyAllowance(null);
        setPouchesUsedToday(0);
        setCravingsResistedToday(0);
        setBaselinePouchesPerDay(null);
        setSettingsId(null);
        return;
      }

      let userPlan = await getUserPlan();

      // If user_plan is missing but settings exist, recreate it
      if (!userPlan) {
        const { saveUserPlan } = await import('@/lib/db-user-plan');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const allowance = calculateDailyAllowance(settings, today);

        await saveUserPlan({
          settingsId: settings.id,
          currentDailyAllowance: allowance,
          lastCalculatedDate: Date.now(),
        }, true);

        userPlan = await getUserPlan();

        if (!userPlan) {
          setDailyAllowance(null);
          setPouchesUsedToday(0);
          setCravingsResistedToday(0);
          setBaselinePouchesPerDay(null);
          return;
        }
      }

      // Recalculate allowance from settings (always fresh, especially after reset/onboarding)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const calculatedAllowance = calculateDailyAllowance(settings, today);

      const todayLogs = await getLogEntriesForDay(today);
      const usedCount = todayLogs.filter(log => log.type === 'pouch_used').length;
      const resistedCount = todayLogs.filter(log => log.type === 'craving_resisted').length;

      const displayAllowance = Math.round(calculatedAllowance * 10) / 10;
      setSettingsId(settings.id);
      setPouchesUsedToday(usedCount);
      setCravingsResistedToday(resistedCount);
      setDailyAllowance(displayAllowance);
      setBaselinePouchesPerDay(settings.baselinePouchesPerDay);
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), { context: 'home_load_data' });
      setDailyAllowance(null);
      setPouchesUsedToday(0);
      setBaselinePouchesPerDay(null);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      isLoadingRef.current = false;
      loadData();
    }, [loadData])
  );

  const handleLogPouch = async () => {
    try {
      setIsLogging(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await createLogEntry('pouch_used');
      // Optimistic UI update (avoid full-screen reload/spinner)
      setPouchesUsedToday((prev) => prev + 1);
      // Reconcile in background (no loading state)
      void loadData({ showLoading: false });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), { context: 'home_log_pouch' });
    } finally {
      setIsLogging(false);
    }
  };

  const handleLogCravingResisted = async () => {
    try {
      setIsLogging(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await createLogEntry('craving_resisted');
      // Optimistic UI update (avoid full-screen reload/spinner)
      setCravingsResistedToday((prev) => prev + 1);
      // Reconcile in background (no loading state)
      void loadData({ showLoading: false });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), { context: 'home_log_craving_resisted' });
    } finally {
      setIsLogging(false);
    }
  };

  // Force remount when settingsId changes (after onboarding/reset)
  // This ensures we get a completely fresh component instance
  const screenKey = `home-screen-${settingsId || 'no-settings'}`;
  
  // React Compiler auto-memoizes this
  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingTop: spacing.lg,
    },
    mainContent: {
      flex: 1,
    },
    card: {
      marginTop: spacing.md,
    },
    label: {
      ...typography.body,
      color: colors.text.secondary,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    progressContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    statsContainer: {
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      ...typography.xl,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    statLabel: {
      ...typography.caption,
      color: colors.text.secondary,
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border.subtle,
      marginHorizontal: spacing.lg,
    },
    loggingButtons: {
      marginTop: 'auto',
      marginBottom: spacing.lg,
      gap: spacing.md,
    },
    logButton: {
      width: '100%',
    },
    placeholderText: {
      ...typography.body,
      color: colors.text.secondary,
      textAlign: 'center',
    },
  });

  return (
    <Screen key={screenKey}>
      <View style={styles.content}>
        {isLoading ? (
          <Card variant="elevated" style={styles.card} padding="lg">
            <ActivityIndicator size="large" color={colors.primary} />
          </Card>
        ) : dailyAllowance !== null ? (
          <View style={styles.mainContent}>
            {/* Daily Allowance Card with Progress Ring */}
            <Card variant="elevated" style={styles.card} padding="lg">
              <Text style={styles.label}>Your Daily Allowance</Text>
              
              {/* Progress Ring Visualization */}
              <View style={styles.progressContainer}>
                <ProgressRing
                  progress={
                    dailyAllowance > 0 
                      ? Math.min(pouchesUsedToday / dailyAllowance, 1)
                      : 0
                  }
                  size={140}
                  strokeWidth={14}
                  color={colors.primary}
                  useGradient={true}
                  showLabel={true}
                  label={
                    dailyAllowance > 0
                      ? `${pouchesUsedToday}/${formatAllowanceDisplay(dailyAllowance)}`
                      : `${pouchesUsedToday}/0`
                  }
                  sublabel="pouches"
                />
              </View>

              {/* Used, Avoided, Remaining, Resisted Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{pouchesUsedToday}</Text>
                    <Text style={styles.statLabel}>Used</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {baselinePouchesPerDay !== null
                        ? Math.max(0, baselinePouchesPerDay - pouchesUsedToday)
                        : 0}
                    </Text>
                    <Text style={styles.statLabel}>Avoided</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {formatAllowanceDisplay(Math.max(0, dailyAllowance - pouchesUsedToday))}
                    </Text>
                    <Text style={styles.statLabel}>Remaining</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{cravingsResistedToday}</Text>
                    <Text style={styles.statLabel}>Resisted</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Action Buttons - Always at bottom */}
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
          </View>
        ) : (
          <Card variant="elevated" style={styles.card} padding="lg">
            <Text style={styles.placeholderText}>
              No plan yet. Complete onboarding to see your daily allowance.
            </Text>
          </Card>
        )}
      </View>
    </Screen>
  );
}
