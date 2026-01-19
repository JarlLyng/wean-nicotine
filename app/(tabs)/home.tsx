import { useState, useEffect, useRef, useCallback } from 'react';
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
import { createLogEntry , getLogEntriesForDay } from '@/lib/db-log-entries';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { colors } = useDesignTokens();
  const devLog = (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  };
  const [dailyAllowance, setDailyAllowance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pouchesUsedToday, setPouchesUsedToday] = useState(0);
  const [cravingsResistedToday, setCravingsResistedToday] = useState(0);
  const [baselinePouchesPerDay, setBaselinePouchesPerDay] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [settingsId, setSettingsId] = useState<number | null>(null); // Track settings ID for debugging
  const isLoadingRef = useRef(false); // Prevent multiple simultaneous loads
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Debounce timer

  const loadData = useCallback(async ({ showLoading = true }: { showLoading?: boolean } = {}) => {
    // Clear any pending loads
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      devLog('Home screen: Load already in progress, skipping...');
      return;
    }
    isLoadingRef.current = true;
    try {
      devLog('Home screen: Loading data...');
      if (showLoading) setIsLoading(true);
      // Get settings first (needed to recreate user_plan if missing)
      const settings = await getTaperSettings();
      devLog('Home screen: Settings:', settings);
      
        if (!settings) {
        devLog('Home screen: No settings found');
        setDailyAllowance(null);
        setPouchesUsedToday(0);
        setCravingsResistedToday(0);
        setBaselinePouchesPerDay(null);
        setSettingsId(null);
        return;
      }

      let userPlan = await getUserPlan();
      devLog('Home screen: User plan:', userPlan);
      
      // If user_plan is missing but settings exist, recreate it
      if (!userPlan) {
        devLog('Home screen: No user plan found, recreating from settings...');
        const { saveUserPlan } = await import('@/lib/db-user-plan');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyAllowance = calculateDailyAllowance(settings, today);
        
        const planId = await saveUserPlan({
          settingsId: settings.id,
          currentDailyAllowance: dailyAllowance,
          lastCalculatedDate: Date.now(),
        }, true); // forceCreate = true
        
        // Reload the plan
        userPlan = await getUserPlan();
        devLog('Home screen: Recreated user plan with ID:', planId);
        
        if (!userPlan) {
          console.error('Home screen: Failed to recreate user plan');
          setDailyAllowance(null);
          setPouchesUsedToday(0);
          setCravingsResistedToday(0);
          setBaselinePouchesPerDay(null);
          return;
        }
      }

      // Always recalculate daily allowance from settings to ensure it's up-to-date
      // This ensures that if settings changed (e.g., after "Start Over"), we use the new values
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastCalculated = new Date(userPlan.lastCalculatedDate);
      lastCalculated.setHours(0, 0, 0, 0);

      // Recalculate allowance based on current settings and date
      // This ensures we always show the correct allowance, especially after reset/onboarding
      const calculatedAllowance = calculateDailyAllowance(settings, today);
      devLog('Home screen: Calculated allowance:', calculatedAllowance, 'from settings:', {
        baseline: settings.baselinePouchesPerDay,
        startDate: new Date(settings.startDate).toISOString(),
        reductionPercent: settings.weeklyReductionPercent,
        settingsId: settings.id,
        userPlanAllowance: userPlan.currentDailyAllowance,
        userPlanSettingsId: userPlan.settingsId,
      });

      // Use calculated allowance (always fresh from settings)
      // If userPlan has a different settingsId, it means settings were reset
      const allowance = calculatedAllowance;
      
      
      // Load pouches used today first
      const todayLogs = await getLogEntriesForDay(today);
      const usedCount = todayLogs.filter(log => log.type === 'pouch_used').length;
      const resistedCount = todayLogs.filter(log => log.type === 'craving_resisted').length;

      // Update all state atomically to ensure React re-renders
      const roundedAllowance = Math.round(allowance);
      devLog('Home screen: About to update state - dailyAllowance:', roundedAllowance, 'settingsId:', settings.id, 'updatedAt:', settings.updatedAt, 'usedCount:', usedCount, 'resistedCount:', resistedCount);
      
      // Update state - React will handle re-rendering automatically
      setSettingsId(settings.id);
      setPouchesUsedToday(usedCount);
      setCravingsResistedToday(resistedCount);
      setDailyAllowance(roundedAllowance);
      setBaselinePouchesPerDay(settings.baselinePouchesPerDay);
      
      devLog('Home screen: State update called - dailyAllowance:', roundedAllowance, 'settingsId:', settings.id, 'updatedAt:', settings.updatedAt);
      } catch (error) {
      console.error('Error loading data:', error);
      setDailyAllowance(null);
      setPouchesUsedToday(0);
      setBaselinePouchesPerDay(null);
      setIsLoading(false);
      isLoadingRef.current = false;
    } finally {
      // Small delay to ensure state updates are flushed before hiding loading
      // This ensures React has time to process all state updates
      setTimeout(() => {
        setIsLoading(false);
        isLoadingRef.current = false;
      }, 50);
    }
  }, []);

  // Reset all state on mount to ensure clean start
  useEffect(() => {
    devLog('Home screen: Component mounted - resetting all state');
    setDailyAllowance(null);
    setPouchesUsedToday(0);
    setCravingsResistedToday(0);
    setBaselinePouchesPerDay(null);
    setSettingsId(null);
    setIsLoading(true);
    isLoadingRef.current = false;
  }, []); // Only run on mount

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      devLog('Home screen: useFocusEffect triggered');
      // Clear any pending loads
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      // Reset loading flag to allow new load
      isLoadingRef.current = false;
      setIsLoading(true);
      // Debounce load to prevent multiple rapid calls
      loadTimeoutRef.current = setTimeout(() => {
        loadData();
        loadTimeoutRef.current = null;
      }, 200);
      return () => {
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
        isLoadingRef.current = false;
      };
    }, [loadData])
  );

  // Log when dailyAllowance changes to debug rendering
  useEffect(() => {
    devLog('Home screen: dailyAllowance changed to:', dailyAllowance, 'settingsId:', settingsId);
  }, [dailyAllowance, settingsId]);

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
      // Optimistic UI update (avoid full-screen reload/spinner)
      setCravingsResistedToday((prev) => prev + 1);
      // Reconcile in background (no loading state)
      void loadData({ showLoading: false });
    } catch (error) {
      console.error('Error logging craving resisted:', error);
    } finally {
      setIsLogging(false);
    }
  };

  // Force remount when settingsId changes (after onboarding/reset)
  // This ensures we get a completely fresh component instance
  const screenKey = `home-screen-${settingsId || 'no-settings'}`;
  
  // Create styles inside component to access dynamic colors
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
      ...typography.title,
      fontSize: 24,
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
    <Screen key={screenKey} title="Today">
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
                      ? `${pouchesUsedToday}/${Math.round(dailyAllowance)}`
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
                      {Math.max(0, Math.round(dailyAllowance - pouchesUsedToday))}
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
              Daily allowance will appear here
            </Text>
          </Card>
        )}
      </View>
    </Screen>
  );
}
