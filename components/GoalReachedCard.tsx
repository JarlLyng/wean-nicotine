/**
 * GoalReachedCard — one-time "you reached your goal" acknowledgement (#223).
 *
 * Shown on Home the first time the daily allowance reaches zero. This is
 * deliberately NOT a streak or a "days clean" counter (see CLAUDE.md —
 * cumulative "pouches avoided" stays the long-term metric). It's a single
 * calm celebration of finishing the plan the user set, with gentle next
 * steps: keep tracking, or revisit the plan.
 *
 * No clinical claims ("quit", "cured") — the copy is framed entirely
 * around the plan.
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextStyle, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

interface GoalReachedCardProps {
  /** Cumulative pouches avoided — the number worth celebrating. */
  totalPouchesAvoided?: number | null;
  /** Acknowledge and hide the celebration permanently. */
  onDismiss: () => void;
  style?: ViewStyle;
}

export function GoalReachedCard({ totalPouchesAvoided, onDismiss, style }: GoalReachedCardProps) {
  const { colors } = useDesignTokens();
  const router = useRouter();

  // One gentle success haptic when the celebration first appears — same
  // pattern as the breathing-exercise completion.
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  return (
    <Card variant="elevated" padding="lg" style={style}>
      <View style={styles.iconWrap}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
          <Icon name="trophy" size={32} color={colors.primary} weight="fill" />
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text.primary }]}>You reached your goal</Text>
      <Text style={[styles.body, { color: colors.text.secondary }]}>
        Your plan is at zero — you did the whole taper, one small step at a time.
        {totalPouchesAvoided && totalPouchesAvoided > 0
          ? ` Along the way you avoided ${totalPouchesAvoided} pouches compared to where you started.`
          : ''}
      </Text>
      <Button title="Keep going" onPress={onDismiss} variant="primary" style={styles.button} />
      <Pressable
        onPress={() => router.push('/(tabs)/settings/edit-plan')}
        accessibilityRole="button"
        accessibilityLabel="Revisit your plan"
        style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.secondaryLabel, { color: colors.text.tertiary }]}>
          Revisit your plan
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  } as ViewStyle,
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  title: {
    ...typography.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  } as TextStyle,
  body: {
    ...typography.body,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
  } as TextStyle,
  button: {
    width: '100%',
  } as ViewStyle,
  secondary: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    minHeight: 32,
  } as ViewStyle,
  secondaryLabel: {
    ...typography.sm,
  } as TextStyle,
});
