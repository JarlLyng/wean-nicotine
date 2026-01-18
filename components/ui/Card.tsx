import React, { useEffect, useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { spacing, borderRadius, shadows, animations } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

export type CardVariant = 'elevated' | 'flat' | 'outlined';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
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
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Memoize card style to avoid recalculating in Reanimated worklet context
  const cardStyle = useMemo(() => {
    // Ensure colors object exists and has required properties
    if (!colors || !colors.surface || !colors.background || !colors.border) {
      // Return safe fallback style if colors are not ready
      return {
        borderRadius: borderRadius.lg,
        padding: spacing[padding],
        backgroundColor: '#FFFFFF',
      };
    }

    // Ensure colors are defined with fallbacks - extract as strings to avoid undefined in Reanimated
    // Validate that color values are strings and not undefined/null
    const getColorString = (value: string | undefined | null, fallback: string): string => {
      if (!value || typeof value !== 'string') {
        return fallback;
      }
      return value;
    };

    // Cards should always use surface.default (white in light mode, black in dark mode)
    // Never fall back to background.app as that might be different
    const surfaceDefault = getColorString(colors.surface?.default, '#FFFFFF');
    const borderSubtle = getColorString(
      colors.border?.subtle,
      getColorString(colors.border?.default, 'rgba(0, 0, 0, 0.1)')
    );

    // Ensure shadowColor is always a string for Reanimated compatibility
    const shadowColor = String(shadows.md.shadowColor || '#000000');
    const shadowStyle = {
      shadowColor,
      shadowOffset: shadows.md.shadowOffset,
      shadowOpacity: shadows.md.shadowOpacity,
      shadowRadius: shadows.md.shadowRadius,
      elevation: shadows.md.elevation,
    };

    // Ensure padding value is defined
    const paddingValue = spacing[padding] ?? spacing.md;

    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: paddingValue,
      backgroundColor: surfaceDefault,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          // Design-system: cards should be solid (not translucent) on top of gradient
          backgroundColor: surfaceDefault,
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
    <Animated.View style={[cardStyle, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
