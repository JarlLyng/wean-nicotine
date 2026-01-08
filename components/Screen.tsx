import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
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
  if (variant === 'gradient') {
    return (
      <View style={styles.container}>
        {/* Gradient header area */}
        <SafeAreaView edges={['top']} style={styles.gradientHeader}>
          <GradientBackground variant="primary" style={styles.gradientContainer}>
            {title && (
              <Text style={styles.gradientTitle} accessibilityRole="header">
                {title}
              </Text>
            )}
          </GradientBackground>
        </SafeAreaView>
        
        {/* Content area on surface background */}
        <SafeAreaView edges={['bottom']} style={styles.contentContainer}>
          <View style={[styles.content, style]}>
            {children}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Plain variant (default)
  return (
    <SafeAreaView style={[styles.container, styles.plainContainer, style]} edges={['top', 'bottom']}>
      {title && (
        <Text style={styles.plainTitle} accessibilityRole="header">
          {title}
        </Text>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  plainContainer: {
    backgroundColor: colors.surface,
  },
  gradientHeader: {
    flexShrink: 0,
  },
  gradientContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  gradientTitle: {
    ...typography.title,
    color: '#FFFFFF', // White text on gradient
  },
  plainTitle: {
    ...typography.title,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
