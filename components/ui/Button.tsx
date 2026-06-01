import React from 'react';
import {
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
  StyleProp,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, shadows, animations } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useDesignTokens();
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      // Design system: spacing.md vertical, spacing.xl horizontal
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      // Design system: primary button radius = md (12)
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48, // WCAG touch target
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: isDisabled ? colors.border.subtle : colors.primary,
          ...shadows.sm,
        };
      case 'secondary':
        // Design system: bg=background.card, border=border.subtle, text=text.primary
        return {
          ...baseStyle,
          backgroundColor: colors.background.card,
          borderWidth: 2,
          borderColor: isDisabled ? colors.border.subtle : colors.border.default,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: typography.sizes.lg,
      lineHeight: typography.lineHeights.relaxed,
      fontWeight: `${typography.weights.semibold}`,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: isDisabled ? colors.text.tertiary : colors.onPrimary,
        };
      case 'secondary':
        // Design system: text.primary on secondary buttons
        return {
          ...baseStyle,
          color: isDisabled ? colors.text.tertiary : colors.text.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: isDisabled ? colors.text.tertiary : colors.primary,
        };
      default:
        return baseStyle;
    }
  };

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, {
        damping: 15,
        stiffness: 300,
      });
      opacity.value = withTiming(0.8, { duration: animations.fast });
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 300,
      });
      opacity.value = withTiming(1, { duration: animations.fast });
    }
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  // Focus ring (#36) was implemented with a `style` callback returning the
  // focused state, but `Animated.createAnimatedComponent(Pressable)` doesn't
  // forward style callbacks the same way plain Pressable does — passing a
  // function silently disables press handling on native, which made every
  // Button (including "Get Started" on the welcome screen) unresponsive in
  // build 18. Reverted to an array-style. Re-implement the focus ring with
  // an explicit `onFocus` / `onBlur` + local state if it's ever needed on
  // web; iOS doesn't have a keyboard-focus state for this anyway.
  return (
    <AnimatedPressable
      style={[getButtonStyle(), animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.onPrimary : colors.text.primary}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </AnimatedPressable>
  );
}
