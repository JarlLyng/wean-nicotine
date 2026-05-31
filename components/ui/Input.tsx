import { useDesignTokens } from '@/lib/design';
import { spacing, borderRadius, typography } from '@/lib/theme';
import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /** Optional label rendered above the input. */
  label?: string;
  /** Optional helper text below the input (or error message when `error` is set). */
  hint?: string;
  /** Validation error. Overrides hint visually and announces to screen readers. */
  error?: string;
  /** Optional suffix label rendered to the right of the input value (e.g. "pouches per day"). */
  suffix?: string;
  /** Visual variant. `display` is the large centered hero input used in onboarding. */
  variant?: 'default' | 'display';
  /** Override container style (margins / spacing). */
  containerStyle?: ViewStyle;
}

/**
 * Single-line text input primitive.
 *
 * - Renders a 2px focus border (IAMJARL) using `colors.primary`.
 * - Switches border to `colors.error` when `error` is set.
 * - Supports a `display` variant for the hero number input used in baseline / price.
 * - `accessibilityLabel` falls back to `label` for screen readers.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    hint,
    error,
    suffix,
    variant = 'default',
    containerStyle,
    onFocus,
    onBlur,
    accessibilityLabel,
    ...rest
  },
  ref,
) {
  const { colors } = useDesignTokens();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
      ? colors.primary
      : colors.border.subtle;

  const styles = createStyles(colors, variant);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        {...rest}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={error ? { ...(rest.accessibilityState ?? {}), busy: false } : rest.accessibilityState}
        placeholderTextColor={colors.text.tertiary}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, { borderColor }]}
      />
      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

type Colors = ReturnType<typeof useDesignTokens>['colors'];

const createStyles = (colors: Colors, variant: 'default' | 'display') =>
  StyleSheet.create({
    container: {
      gap: spacing.xs,
    } as ViewStyle,
    label: {
      ...typography.sm,
      color: colors.text.secondary,
    } as TextStyle,
    input:
      variant === 'display'
        ? ({
            fontSize: 48,
            lineHeight: 56,
            fontWeight: '700',
            color: colors.text.primary,
            textAlign: 'center',
            width: '100%',
            paddingVertical: spacing.md,
            borderBottomWidth: 2,
          } as TextStyle)
        : ({
            ...typography.base,
            color: colors.text.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.md,
            borderWidth: 2,
            backgroundColor: colors.background.card,
          } as TextStyle),
    suffix: {
      ...typography.sm,
      color: colors.text.secondary,
      textAlign: variant === 'display' ? 'center' : 'left',
      marginTop: variant === 'display' ? spacing.xs : 0,
    } as TextStyle,
    hint: {
      ...typography.sm,
      color: colors.text.secondary,
    } as TextStyle,
    error: {
      ...typography.sm,
      color: colors.error,
    } as TextStyle,
  });
