import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { colors, typography, spacing, animations } from '@/lib/theme';

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'highlight' | 'warning';
  style?: ViewStyle;
}

export function StatCard({ value, label, variant = 'default', style }: StatCardProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in when value changes
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 200,
    });
    opacity.value = withTiming(1, { duration: animations.normal });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getValueColor = () => {
    switch (variant) {
      case 'highlight':
        return colors.accent.primary;
      case 'warning':
        return colors.semantic.warning.main;
      default:
        return colors.text.primary;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={animatedStyle}>
        <Text style={[styles.value, { color: getValueColor() }]}>{value}</Text>
      </Animated.View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography['3xl'],
    fontWeight: '700',
  },
  label: {
    ...typography.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
