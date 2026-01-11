import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, colors, typography } from '@/lib/theme';
import { GradientBackground } from './GradientBackground';

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'plain' | 'gradient';
  style?: ViewStyle;
}

export function Screen({ children, title, variant = 'plain', style }: ScreenProps) {
  // On web, use simpler structure to reduce DOM nesting
  if (Platform.OS === 'web') {
    if (variant === 'gradient') {
      return (
        <GradientBackground variant="subtle" style={[styles.container, style]}>
          <View style={styles.content}>
            {children}
          </View>
        </GradientBackground>
      );
    }

    // Plain variant for web
    return (
      <GradientBackground variant="subtle" style={[styles.container, style]}>
        {title && (
          <Text style={styles.plainTitle} accessibilityRole="header">
            {title}
          </Text>
        )}
        <View style={styles.content}>
          {children}
        </View>
      </GradientBackground>
    );
  }

  // Native platforms use SafeAreaView
  if (variant === 'gradient') {
    return (
      <GradientBackground variant="subtle" style={[styles.container, style]}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.content}>
            {children}
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  // Plain variant (default)
  return (
    <GradientBackground variant="subtle" style={[styles.container, style]}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {title && (
          <Text style={styles.plainTitle} accessibilityRole="header">
            {title}
          </Text>
        )}
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  plainTitle: {
    ...typography.title,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
