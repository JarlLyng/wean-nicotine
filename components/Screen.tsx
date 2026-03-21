import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { spacing } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

interface ScreenProps {
  children: React.ReactNode;
  /** @deprecated Title is now handled by native headers in _layout.tsx */
  title?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Screen content wrapper.
 * Provides consistent horizontal padding and background color.
 * Title/header is handled natively by Expo Router layouts.
 */
export function Screen({ children, style }: ScreenProps) {
  const { colors } = useDesignTokens();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.app }, style]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
});
