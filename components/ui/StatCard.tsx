import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { spacing, animations } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'highlight' | 'warning';
  style?: ViewStyle;
}

export function StatCard({ value, label, variant = 'default', style }: StatCardProps) {
  const { colors } = useDesignTokens();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 180,
    });
    opacity.value = withTiming(1, { duration: animations.normal });
  }, [value, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getValueColor = () => {
    switch (variant) {
      case 'highlight':
        return colors.primary;
      case 'warning':
        return colors.shared.warning;
      default:
        return colors.text.primary;
    }
  };

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel={`${value} ${label}`}
      accessibilityRole="text">
      <Animated.View style={animatedStyle}>
        <Text style={[styles.value, { color: getValueColor() }]}>{value}</Text>
      </Animated.View>
      <Text style={[styles.label, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    // Design system: use xxl (36px) — closest token to old 28px
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    fontWeight: `${typography.weights.bold}`,
  },
  label: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.tight,
    marginTop: spacing.xs,
  },
});
