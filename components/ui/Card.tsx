import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeInDown, Easing } from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows, animations } from '@/lib/theme';

export type CardVariant = 'elevated' | 'flat' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export function Card({ children, variant = 'flat', style, padding = 'md' }: CardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: animations.normal,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    translateY.value = withTiming(0, {
      duration: animations.normal,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
      backgroundColor: colors.surface,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...shadows.md,
        };
      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: colors.surface, // White surface for flat variant
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.neutral[200],
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View style={[getCardStyle(), animatedStyle, style]} entering={FadeInDown.duration(animations.normal)}>
      {children}
    </Animated.View>
  );
}
