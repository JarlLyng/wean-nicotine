import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Toast } from '@/components/ui/Toast';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { createLogEntry, deleteLogEntry } from '@/lib/db-log-entries';
import { captureError } from '@/lib/sentry';
import { useHomeData } from '@/hooks/useHomeData';
import * as Haptics from 'expo-haptics';

type UndoKind = 'pouch_used' | 'craving_resisted';

interface UndoState {
  entryId: number;
  kind: UndoKind;
}

function formatAllowanceDisplay(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
}

export default function HomeScreen() {
  const { colors } = useDesignTokens();
  const {
    data,
    isLoading,
    reload,
    incrementPouches,
    decrementPouches,
    incrementCravings,
    decrementCravings,
  } = useHomeData();
  const { dailyAllowance, pouchesUsedToday, cravingsResistedToday, baselinePouchesPerDay, settingsId } = data;

  // UI-only transient state — not part of the data layer
  const [isLogging, setIsLogging] = useState(false);
  const [undo, setUndo] = useState<UndoState | null>(null);

  const handleLogPouch = useCallback(async () => {
    try {
      setIsLogging(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const entryId = await createLogEntry('pouch_used');
      incrementPouches();
      setUndo({ entryId, kind: 'pouch_used' });
      void reload({ showLoading: false });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), { context: 'home_log_pouch' });
    } finally {
      setIsLogging(false);
    }
  }, [incrementPouches, reload]);

  const handleLogCravingResisted = useCallback(async () => {
    try {
      setIsLogging(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const entryId = await createLogEntry('craving_resisted');
      incrementCravings();
      setUndo({ entryId, kind: 'craving_resisted' });
      void reload({ showLoading: false });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), { context: 'home_log_craving_resisted' });
    } finally {
      setIsLogging(false);
    }
  }, [incrementCravings, reload]);

  const handleUndo = useCallback(async () => {
    if (!undo) return;
    const { entryId, kind } = undo;
    // Optimistic rollback so the tap feels instant
    if (kind === 'pouch_used') {
      decrementPouches();
    } else {
      decrementCravings();
    }
    setUndo(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await deleteLogEntry(entryId);
      void reload({ showLoading: false });
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error(String(error)),
        { context: 'home_undo_log_entry' }
      );
      // On delete failure, refetch so the UI reflects real DB state
      void reload({ showLoading: false });
    }
  }, [undo, decrementPouches, decrementCravings, reload]);

  const handleUndoDismiss = useCallback(() => {
    setUndo(null);
  }, []);

  // Force remount when settingsId changes (after onboarding/reset)
  const screenKey = `home-screen-${settingsId || 'no-settings'}`;

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
            <Card variant="elevated" style={styles.card} padding="lg">
              <Text style={styles.label}>Your Daily Allowance</Text>

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
      <Toast
        visible={undo !== null}
        message={
          undo?.kind === 'pouch_used'
            ? 'Pouch logged'
            : 'Craving resisted — nice.'
        }
        actionLabel="Undo"
        onActionPress={handleUndo}
        onDismiss={handleUndoDismiss}
      />
    </Screen>
  );
}
