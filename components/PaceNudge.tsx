/**
 * PaceNudge — gentle "your pace may be too aggressive" suggestion (#222).
 *
 * Shown on Home only when the user has been consistently over their
 * allowance (see assessPace in lib/progress.ts) and hasn't dismissed the
 * nudge recently. Framed as information about pace fit, never as failure:
 * neutral styling, no red, easy to dismiss, snoozed for days after a
 * dismissal so it never nags.
 */

import { View, Text, StyleSheet, Pressable, TextStyle, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

interface PaceNudgeProps {
  onDismiss: () => void;
  style?: ViewStyle;
}

export function PaceNudge({ onDismiss, style }: PaceNudgeProps) {
  const { colors } = useDesignTokens();
  const router = useRouter();

  return (
    <Card variant="elevated" padding="lg" style={style}>
      <View style={styles.headerRow}>
        <Icon name="wind" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text.primary }]}>Going over most days?</Text>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss pace suggestion"
          hitSlop={12}
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.6 }]}
        >
          <Icon name="x" size={16} color={colors.text.tertiary} />
        </Pressable>
      </View>
      <Text style={[styles.body, { color: colors.text.secondary }]}>
        A slower pace is completely fine — the plan that works is the one you can keep on a hard
        day. You can ease the weekly reduction anytime.
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/settings/edit-plan')}
        accessibilityRole="button"
        accessibilityLabel="Adjust your pace"
        style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
      >
        <Text style={[styles.actionLabel, { color: colors.primary }]}>Adjust pace</Text>
        <Icon name="arrow-right" size={16} color={colors.primary} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  } as ViewStyle,
  title: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  } as TextStyle,
  dismiss: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  body: {
    ...typography.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  } as TextStyle,
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    minHeight: 32,
  } as ViewStyle,
  actionLabel: {
    ...typography.sm,
    fontWeight: '700',
  } as TextStyle,
});
