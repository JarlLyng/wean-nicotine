import React, { useEffect } from 'react';
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

  // Ensure colors are defined with fallbacks - extract as strings to avoid undefined in Reanimated
  // Direct access with explicit fallbacks for Reanimated compatibility
  const surfaceDefault = (colors && colors.surface && colors.surface.default) 
    ? String(colors.surface.default) 
    : (colors && colors.background && colors.background.app) 
      ? String(colors.background.app) 
      : '#FFFFFF';
  const surfaceRaised = (colors && colors.surface && colors.surface.raised) 
    ? String(colors.surface.raised) 
    : surfaceDefault;
  const borderSubtle = (colors && colors.border && colors.border.subtle) 
    ? String(colors.border.subtle) 
    : (colors && colors.border && colors.border.default) 
      ? String(colors.border.default) 
      : 'rgba(0, 0, 0, 0.1)';
  
  // Use the string values directly
  const backgroundColorDefault = surfaceDefault;
  const backgroundColorRaised = surfaceRaised;
  const borderColorSubtle = borderSubtle;

  // Ensure shadowColor is always a string for Reanimated compatibility
  const shadowStyle = {
    ...shadows.md,
    shadowColor: String(shadows.md.shadowColor || '#000000'),
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
      backgroundColor: backgroundColorDefault,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: backgroundColorRaised,
          ...shadowStyle,
        };
      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: backgroundColorDefault,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: borderColorSubtle,
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
