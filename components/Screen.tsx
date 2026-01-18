import React from 'react';
import { View, Text, StyleSheet, Platform, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { GradientBackground } from './GradientBackground';

interface ScreenProps {
  children: React.ReactNode;
  title?: string;
  variant?: 'plain' | 'gradient';
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, title, variant = 'plain', style }: ScreenProps) {
  const { colors } = useDesignTokens();
  const styles = createStyles(colors);
  
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

// Styles are created inside component to access colors from hook
const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
  const styles = {
    container: {
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
