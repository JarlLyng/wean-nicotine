import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import type { useDesignTokens } from '@/lib/design';
import { spacing, typography } from '@/lib/theme';

/**
 * A day above its plan: the accent at 40%, the same bar as any other day and
 * never the error colour. Going over is met with calm (#398); the bar already
 * shows it by reaching past the allowance line.
 */
export const abovePlanColor = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  `${colors.primary}66`;

/** Styles shared by the Progress cards: titles, the stat grid and money rows. */
export const createProgressCardStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    cardTitle: {
      ...typography.lg,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    } as TextStyle,

    // Stats grid
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    } as ViewStyle,
    statBox: {
      alignItems: 'center',
      flex: 1,
      gap: spacing.xs,
    } as ViewStyle,
    statLabel: {
      ...typography.xs,
      color: colors.text.secondary,
      textAlign: 'center',
    } as TextStyle,

    // Money
    moneyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
    } as ViewStyle,
    moneyLabel: {
      ...typography.body,
      color: colors.text.secondary,
    } as TextStyle,
    moneyValue: {
      ...typography.xl,
      fontWeight: '700',
      color: colors.primary,
    } as TextStyle,
  });
