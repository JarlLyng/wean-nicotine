import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '@/lib/theme';

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'highlight' | 'warning';
  style?: ViewStyle;
}

export function StatCard({ value, label, variant = 'default', style }: StatCardProps) {
  const getValueColor = () => {
    switch (variant) {
      case 'highlight':
        return colors.accent.primary;
      case 'warning':
        return colors.semantic.warning.main;
      default:
        return colors.text.primary;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.value, { color: getValueColor() }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    ...typography['3xl'],
    fontWeight: '700',
  },
  label: {
    ...typography.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
