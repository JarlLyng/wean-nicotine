/**
 * Toast — a transient notification with an optional action (e.g. "Undo").
 *
 * Appears from the bottom, stays for `durationMs` (default 5000ms), then fades out.
 * Tapping the action button triggers `onActionPress` and dismisses the toast.
 * Tapping the body (outside the action) dismisses without triggering the action.
 *
 * Designed to be mounted conditionally — parent controls visibility via `visible`
 * and handles cleanup in `onDismiss`.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { spacing, borderRadius, shadows } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';

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
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(20, { duration: 180 });
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
            backgroundColor: colors.text.primary,
            shadowColor: colors.text.primary,
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
              color: colors.background.card,
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
    bottom: spacing.xl,
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
