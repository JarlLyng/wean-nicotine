import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeInDown, Easing } from 'react-native-reanimated';
import { spacing, borderRadius, shadows, animations } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

export type CardVariant = 'elevated' | 'flat' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
}

export function Card({ children, variant = 'flat', style, padding = 'md' }: CardProps) {
  const { colors } = useDesignTokens();
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

  // Memoize card style to avoid recalculating in Reanimated worklet context
  const cardStyle = useMemo(() => {
    // Ensure colors are defined with fallbacks - extract as strings to avoid undefined in Reanimated
    const surfaceDefault = (colors?.surface?.default) 
      ? String(colors.surface.default) 
      : (colors?.background?.app) 
        ? String(colors.background.app) 
        : '#FFFFFF';
    const surfaceRaised = (colors?.surface?.raised) 
      ? String(colors.surface.raised) 
      : surfaceDefault;
    const borderSubtle = (colors?.border?.subtle) 
      ? String(colors.border.subtle) 
      : (colors?.border?.default) 
        ? String(colors.border.default) 
        : 'rgba(0, 0, 0, 0.1)';

    // Ensure shadowColor is always a string for Reanimated compatibility
    const shadowColor = String(shadows.md.shadowColor || '#000000');
    const shadowStyle = {
      shadowColor,
      shadowOffset: shadows.md.shadowOffset,
      shadowOpacity: shadows.md.shadowOpacity,
      shadowRadius: shadows.md.shadowRadius,
      elevation: shadows.md.elevation,
    };

    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
      backgroundColor: surfaceDefault,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: surfaceRaised,
          ...shadowStyle,
        };
      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: surfaceDefault,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: borderSubtle,
        };
      default:
        return baseStyle;
    }
  }, [colors, variant, padding]);

  return (
    <Animated.View style={[cardStyle, animatedStyle, style]} entering={FadeInDown.duration(animations.normal)}>
      {children}
    </Animated.View>
  );
}
