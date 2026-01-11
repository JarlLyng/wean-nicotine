import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { spacing, colors, typography } from '@/lib/theme';
import { getUserPlan } from '@/lib/db-user-plan';
import { getTaperSettings } from '@/lib/db-settings';
import { calculateDailyAllowance } from '@/lib/taper-plan';
import { createLogEntry , getLogEntriesForDay } from '@/lib/db-log-entries';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const [dailyAllowance, setDailyAllowance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pouchesUsedToday, setPouchesUsedToday] = useState(0);
  const [isLogging, setIsLogging] = useState(false);
  const [settingsId, setSettingsId] = useState<number | null>(null); // Track settings ID for debugging
  const isLoadingRef = useRef(false); // Prevent multiple simultaneous loads
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Debounce timer

  const loadData = useCallback(async () => {
    // Clear any pending loads
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
    
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      console.log('Home screen: Load already in progress, skipping...');
      return;
    }
    isLoadingRef.current = true;
    try {
      console.log('Home screen: Loading data...');
      setIsLoading(true);
      // Get settings first (needed to recreate user_plan if missing)
      const settings = await getTaperSettings();
      console.log('Home screen: Settings:', settings);
      
      if (!settings) {
        console.log('Home screen: No settings found');
        setDailyAllowance(null);
        setPouchesUsedToday(0);
        setSettingsId(null);
        return;
      }

      let userPlan = await getUserPlan();
      console.log('Home screen: User plan:', userPlan);
      
      // If user_plan is missing but settings exist, recreate it
      if (!userPlan) {
        console.log('Home screen: No user plan found, recreating from settings...');
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
        console.log('Home screen: Recreated user plan with ID:', planId);
        
        if (!userPlan) {
          console.error('Home screen: Failed to recreate user plan');
          setDailyAllowance(null);
          setPouchesUsedToday(0);
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
      console.log('Home screen: Calculated allowance:', calculatedAllowance, 'from settings:', {
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

      // Update all state atomically to ensure React re-renders
      const roundedAllowance = Math.round(allowance);
      console.log('Home screen: About to update state - dailyAllowance:', roundedAllowance, 'settingsId:', settings.id, 'updatedAt:', settings.updatedAt, 'usedCount:', usedCount);
      
      // Update state - React will handle re-rendering automatically
      setSettingsId(settings.id);
      setPouchesUsedToday(usedCount);
      setDailyAllowance(roundedAllowance);
      
      console.log('Home screen: State update called - dailyAllowance:', roundedAllowance, 'settingsId:', settings.id, 'updatedAt:', settings.updatedAt);
    } catch (error) {
      console.error('Error loading data:', error);
      setDailyAllowance(null);
      setPouchesUsedToday(0);
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
    console.log('Home screen: Component mounted - resetting all state');
    setDailyAllowance(null);
    setPouchesUsedToday(0);
    setSettingsId(null);
    setIsLoading(true);
    isLoadingRef.current = false;
  }, []); // Only run on mount

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen: useFocusEffect triggered');
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
    console.log('Home screen: dailyAllowance changed to:', dailyAllowance, 'settingsId:', settingsId);
  }, [dailyAllowance, settingsId]);

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

  // Force remount when settingsId changes (after onboarding/reset)
  // This ensures we get a completely fresh component instance
  const screenKey = `home-screen-${settingsId || 'no-settings'}`;
  
  return (
    <Screen key={screenKey} variant="gradient" title="Today">
      <View style={styles.content}>
        {isLoading ? (
          <Card variant="elevated" style={styles.card} padding="lg">
            <ActivityIndicator size="large" color={colors.accentStart} />
          </Card>
        ) : dailyAllowance !== null ? (
          <>
            {/* Daily Allowance Card with Progress Ring */}
            <Card variant="elevated" style={styles.card} padding="lg">
              <Text style={styles.label}>Your Daily Allowance</Text>
              
              {/* Progress Ring Visualization */}
              <View style={styles.progressContainer}>
                <ProgressRing
                  key={`progress-${dailyAllowance}-${pouchesUsedToday}`}
                  progress={
                    dailyAllowance > 0 
                      ? Math.min(pouchesUsedToday / dailyAllowance, 1)
                      : 0
                  }
                  size={140}
                  strokeWidth={14}
                  color={colors.accentStart}
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
