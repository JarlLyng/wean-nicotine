import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/lib/theme';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'subtle';
  style?: ViewStyle;
}

export function GradientBackground({ children, variant = 'primary', style }: GradientBackgroundProps) {
  const getGradientColors = (): [string, string, string] => {
    switch (variant) {
      case 'primary':
        // Vertical gradient: accentStart → accentMid → accentEnd
        return [colors.accentStart, colors.accentMid, colors.accentEnd];
      case 'subtle':
        // Low-contrast fade with opacity (using rgba format)
        // Convert hex to rgba with reduced opacity
        return [
          'rgba(14, 165, 164, 0.2)', // accentStart at 20% opacity
          'rgba(52, 211, 153, 0.1)', // accentMid at 10% opacity
          'rgba(110, 231, 183, 0.05)', // accentEnd at 5% opacity
        ];
      default:
        return [colors.accentStart, colors.accentMid, colors.accentEnd];
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
