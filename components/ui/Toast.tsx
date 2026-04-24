/**
 * Toast — a transient notification with an optional action (e.g. "Undo").
 *
 * Appears from the top, stays for `durationMs` (default 5000ms), then fades out.
 * Tapping the action button triggers `onActionPress` and dismisses the toast.
 *
 * Uses a fixed dark surface + white text in both light and dark mode so
 * contrast is guaranteed regardless of theme — the classic iOS snackbar
 * pattern. The action label reuses `colors.primary`, which renders well on
 * dark in both modes (purple in light, yellow-green in dark).
 *
 * Parent controls visibility via `visible` and handles cleanup in `onDismiss`.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle , Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { spacing, borderRadius, shadows } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';

// Fixed surface colors so contrast is predictable regardless of theme
const TOAST_SURFACE = '#1C1C1E';
const TOAST_TEXT = '#FFFFFF';

interface ToastProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onDismiss: () => void;
  durationMs?: number;
  style?: ViewStyle;
}

export function Toast({
  visible,
  message,
  actionLabel,
  onActionPress,
  onDismiss,
  durationMs = 5000,
  style,
}: ToastProps) {
  const { colors } = useDesignTokens();
  const opacity = useSharedValue(0);
  // Start above the final position and slide down on show
  const translateY = useSharedValue(-24);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(-24, { duration: 180 });
      return;
    }

    opacity.value = withTiming(1, { duration: 220 });
    translateY.value = withTiming(0, { duration: 220 });

    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [visible, durationMs, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const handleAction = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onActionPress?.();
    onDismiss();
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, animatedStyle, style]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: TOAST_SURFACE,
            shadowColor: '#000000',
          },
          shadows.md,
        ]}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <Text
          style={[
            styles.message,
            {
              color: TOAST_TEXT,
              fontSize: typography.sizes.base,
              lineHeight: typography.lineHeights.normal,
            },
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>

        {actionLabel && onActionPress && (
          <Pressable
            onPress={handleAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            hitSlop={8}
            style={({ pressed }) => [
              styles.action,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.actionLabel,
                {
                  color: colors.primary,
                  fontSize: typography.sizes.base,
                  lineHeight: typography.lineHeights.normal,
                },
              ]}
            >
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.md,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    maxWidth: 420,
    width: '100%',
    minHeight: 48,
  },
  message: {
    flex: 1,
    fontWeight: '500',
  },
  action: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontWeight: '700',
  },
});
