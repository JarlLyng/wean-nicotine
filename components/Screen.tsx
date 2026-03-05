import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { GradientBackground } from '@/components/GradientBackground';

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'plain' | 'gradient';
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, title, variant = 'plain', style }: ScreenProps) {
  const { colors } = useDesignTokens();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isGradient = variant === 'gradient';

  // Build inner content once (web vs native)
  const inner =
    Platform.OS === 'web' ? (
      <>
        {title && (
          <Text style={styles.plainTitle} accessibilityRole="header">
            {title}
          </Text>
        )}
        <View style={styles.content}>{children}</View>
      </>
    ) : (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {title && (
          <Text style={styles.plainTitle} accessibilityRole="header">
            {title}
          </Text>
        )}
        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    );

  // Use conditional rendering instead of an inline Container component.
  // Defining a component inside render creates a new function reference each
  // render, which React treats as a different component type — unmounting and
  // remounting the entire subtree (resetting refs, replaying animations, etc.).
  if (isGradient) {
    return (
      <GradientBackground
        variant="subtle"
        style={[styles.container, styles.gradientContainer, style]}>
        {inner}
      </GradientBackground>
    );
  }

  return <View style={[styles.container, style]}>{inner}</View>;
}

// Styles are created inside component to access colors from hook
const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background.app,
    } as ViewStyle,
    gradientContainer: {
      // Let the gradient show through
      backgroundColor: 'transparent',
    } as ViewStyle,
    safeArea: {
      flex: 1,
    } as ViewStyle,
    plainTitle: {
      ...typography.title,
      color: colors.text.primary,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    } as TextStyle,
    content: {
      flex: 1,
      paddingHorizontal: spacing.md,
    } as ViewStyle,
  };

  return StyleSheet.create(styles);
};
