import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesignTokens } from '@/lib/design';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'subtle';
  style?: StyleProp<ViewStyle>;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function GradientBackground({ children, variant = 'primary', style }: GradientBackgroundProps) {
  const { colors } = useDesignTokens();
  
  const getGradientColors = (): [string, string, string] => {
    switch (variant) {
      case 'primary':
        // Use IAMJARL primary color with slight opacity variation for visual interest
        return [
          colors.primary,
          hexToRgba(colors.primary, 0.8),
          hexToRgba(colors.primary, 0.6),
        ];
      case 'subtle':
        // Subtle background using primary color with low opacity
        return [
          hexToRgba(colors.primary, 0.05),
          hexToRgba(colors.primary, 0.03),
          hexToRgba(colors.primary, 0.01),
        ];
      default:
        return [
          colors.primary,
          hexToRgba(colors.primary, 0.8),
          hexToRgba(colors.primary, 0.6),
        ];
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.gradient, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
