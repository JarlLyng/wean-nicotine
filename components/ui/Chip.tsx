import { useDesignTokens } from '@/lib/design';
import { borderRadius, spacing, typography } from '@/lib/theme';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

export interface ChipProps {
  /** Label rendered in the chip. */
  label: string;
  /** Whether the chip is selected. Drives primary fill + onPrimary text color. */
  selected?: boolean;
  /** Press handler. If omitted, the chip is rendered as a non-interactive tag. */
  onPress?: () => void;
  /** Optional leading element (e.g. an Icon). */
  leading?: React.ReactNode;
  /** Visual variant. `filled` is the pill used for currency/triggers; `outline` is subtler. */
  variant?: 'filled' | 'outline';
  /** Accessibility role override. Defaults to `button` (or `radio`/`checkbox` if hinted by props). */
  accessibilityRole?: 'button' | 'radio' | 'checkbox';
  /** Accessibility hint surfaced to screen readers. */
  accessibilityHint?: string;
}

/**
 * Pill / chip primitive.
 *
 * Used for triggers, currency selection, segmented filters, and any other
 * "tap to toggle" affordance where the user picks from a small set. Meets the
 * 44pt touch target minimum out of the box.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  leading,
  variant = 'filled',
  accessibilityRole = 'button',
  accessibilityHint,
}: ChipProps) {
  const { colors } = useDesignTokens();
  const styles = createStyles(colors, variant);

  const content = (
    <View style={styles.row}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <Text
        style={[styles.label, selected && styles.labelSelected]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );

  if (!onPress) {
    return (
      <View style={[styles.chip, selected && styles.chipSelected]} accessibilityLabel={label}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      hitSlop={4}>
      {content}
    </Pressable>
  );
}

type Colors = ReturnType<typeof useDesignTokens>['colors'];

const createStyles = (colors: Colors, variant: 'filled' | 'outline') =>
  StyleSheet.create({
    chip: {
      minHeight: 44,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: colors.border.default,
      backgroundColor: variant === 'outline' ? 'transparent' : colors.background.card,
      justifyContent: 'center',
    } as ViewStyle,
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    } as ViewStyle,
    chipPressed: {
      opacity: 0.85,
    } as ViewStyle,
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    } as ViewStyle,
    leading: {
      marginRight: 2,
    } as ViewStyle,
    label: {
      ...typography.sm,
      color: colors.text.primary,
      fontWeight: '600',
    } as TextStyle,
    labelSelected: {
      color: colors.onPrimary,
    } as TextStyle,
  });
