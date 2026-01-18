import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDesignTokens } from '@/lib/design';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'subtle';
  style?: StyleProp<ViewStyle>;
}

export function GradientBackground({ children, variant = 'primary', style }: GradientBackgroundProps) {
  const { colors } = useDesignTokens();
  
  const getGradientColors = (): [string, string, string] => {
    switch (variant) {
      case 'primary':
        return [
          colors.primary,
          colors.primary,
          colors.background.app,
        ];
      case 'subtle':
        return [
          colors.background.app,
          colors.background.muted,
          colors.background.app,
        ];
      default:
        return [
          colors.primary,
          colors.primary,
          colors.background.app,
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
