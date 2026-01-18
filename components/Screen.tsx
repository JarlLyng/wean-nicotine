import React from 'react';
import { View, Text, StyleSheet, Platform, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

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
    return (
      <View style={[styles.container, style]}>
        {title && (
          <Text style={styles.plainTitle} accessibilityRole="header">
            {title}
          </Text>
        )}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  // Native platforms use SafeAreaView
  return (
    <View style={[styles.container, style]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {title && (
          <Text style={styles.plainTitle} accessibilityRole="header">
            {title}
          </Text>
        )}
        <View style={styles.content}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

// Styles are created inside component to access colors from hook
const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background.app,
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
