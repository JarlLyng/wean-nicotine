import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Toast } from '@/components/ui/Toast';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { createLogEntry, deleteLogEntry, setLogEntryTrigger } from '@/lib/db-log-entries';
import { getDisplayAllowance } from '@/lib/taper-plan';
import { GoalReachedCard } from '@/components/GoalReachedCard';
import { PaceNudge } from '@/components/PaceNudge';
import { TriggerTagRow } from '@/components/TriggerTagRow';
import { captureError } from '@/lib/sentry';
import { useHomeData } from '@/hooks/useHomeData';
import * as Haptics from 'expo-haptics';

type UndoKind = 'pouch_used' | 'craving_resisted';

interface UndoState {
  entryId: number;
  kind: UndoKind;
}

/**
 * The pouch entry currently offered for optional trigger tagging (#220).
 * Separate from UndoState so tagging stays available after the undo toast
 * times out — the row is dismissed by ×, undo, or the next log instead.
 */
interface TagTargetState {
  entryId: number;
  selected: string | null;
}

// (Displayed allowance is floored to whole pouches — see getDisplayAllowance
// in lib/taper-plan.ts. The precise decimal value still drives the taper math.)

export default function HomeScreen() {
  const { colors } = useDesignTokens();
  const {
    data,
    isLoading,
    status,
    reload,
    incrementPouches,
    decrementPouches,
    incrementCravings,
    decrementCravings,
    dismissPaceNudge,
    dismissGoalCelebration,
  } = useHomeData();
  const {
    dailyAllowance,
    pouchesUsedToday,
    cravingsResistedToday,
    baselinePouchesPerDay,
    settingsId,
    triggers,
    showPaceNudge,
    showGoalCelebration,
    goalPouchesAvoided,
  } = data;

  // Whole-pouch target for display (#219) — the precise decimal allowance
  // still drives the taper math and progress calculations.
  const displayAllowance = dailyAllowance !== null ? getDisplayAllowance(dailyAllowance) : 0;

  // UI-only transient state — not part of the data layer
  const [isLogging, setIsLogging] = useState(false);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const [tagTarget, setTagTarget] = useState<TagTargetState | null>(null);

  const handleLogPouch = useCallback(async () => {
    try {
      setIsLogging(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const entryId = await createLogEntry('pouch_used');
      incrementPouches();
      setUndo({ entryId, kind: 'pouch_used' });
      // Offer optional trigger tagging for the new entry (replaces any
      // previous offer — only the latest pouch is taggable).
      setTagTarget(triggers.length > 0 ? { entryId, selected: null } : null);
      void reload({ showLoading: false });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'home_log_pouch',
      });
    } finally {
      setIsLogging(false);
    }
  }, [incrementPouches, reload, triggers]);

  const handleLogCravingResisted = useCallback(async () => {
    try {
      setIsLogging(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const entryId = await createLogEntry('craving_resisted');
      incrementCravings();
      setUndo({ entryId, kind: 'craving_resisted' });
      setTagTarget(null);
      void reload({ showLoading: false });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'home_log_craving_resisted',
      });
    } finally {
      setIsLogging(false);
    }
  }, [incrementCravings, reload]);

  const handleTagTrigger = useCallback(
    async (trigger: string | null) => {
      if (!tagTarget) return;
      const { entryId } = tagTarget;
      // Optimistic — the chip highlights immediately
      setTagTarget({ entryId, selected: trigger });
      try {
        await setLogEntryTrigger(entryId, trigger);
      } catch (error) {
        captureError(error instanceof Error ? error : new Error(String(error)), {
          context: 'home_tag_trigger',
        });
        setTagTarget({ entryId, selected: null });
      }
    },
    [tagTarget],
  );

  const handleTagDismiss = useCallback(() => {
    setTagTarget(null);
  }, []);

  // Retract the tag offer when the user leaves the tab — "the last pouch"
  // reference goes stale once they've moved on.
  useFocusEffect(
    useCallback(() => {
      return () => setTagTarget(null);
    }, []),
  );

  const handleUndo = useCallback(async () => {
    if (!undo) return;
    const { entryId, kind } = undo;
    // Optimistic rollback so the tap feels instant
    if (kind === 'pouch_used') {
      decrementPouches();
      // The tag offer points at the entry being deleted — retract it
      setTagTarget((current) => (current?.entryId === entryId ? null : current));
    } else {
      decrementCravings();
    }
    setUndo(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await deleteLogEntry(entryId);
      void reload({ showLoading: false });
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        context: 'home_undo_log_entry',
      });
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
        ) : status === 'error' ? (
          <Card variant="elevated" style={styles.card} padding="lg">
            <Text style={styles.placeholderText}>Couldn{'’'}t load your data right now.</Text>
            <Button
              title="Try again"
              onPress={() => reload({ showLoading: true })}
              variant="secondary"
              style={styles.logButton}
            />
          </Card>
        ) : dailyAllowance !== null ? (
          <View style={styles.mainContent}>
            {showGoalCelebration ? (
              <GoalReachedCard
                totalPouchesAvoided={goalPouchesAvoided}
                onDismiss={dismissGoalCelebration}
                style={styles.card}
              />
            ) : (
              <Card variant="elevated" style={styles.card} padding="lg">
                <Text style={styles.label}>Your Daily Allowance</Text>

                <View style={styles.progressContainer}>
                  <ProgressRing
                    progress={
                      displayAllowance > 0 ? Math.min(pouchesUsedToday / displayAllowance, 1) : 0
                    }
                    size={140}
                    strokeWidth={14}
                    color={colors.primary}
                    useGradient={true}
                    showLabel={true}
                    label={`${pouchesUsedToday}/${displayAllowance}`}
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
                        {Math.max(0, displayAllowance - pouchesUsedToday)}
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
            )}

            {showPaceNudge && <PaceNudge onDismiss={dismissPaceNudge} style={styles.card} />}

            <View style={styles.loggingButtons}>
              {tagTarget !== null && (
                <TriggerTagRow
                  triggers={triggers}
                  selected={tagTarget.selected}
                  onSelect={handleTagTrigger}
                  onDismiss={handleTagDismiss}
                />
              )}
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
        message={undo?.kind === 'pouch_used' ? 'Pouch logged' : 'Craving resisted — nice.'}
        actionLabel="Undo"
        onActionPress={handleUndo}
        onDismiss={handleUndoDismiss}
      />
    </Screen>
  );
}
