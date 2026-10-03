import { memo, useMemo } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { formatMoney, type CurrencyCode } from '@/lib/currency';
import { useDesignTokens } from '@/lib/design';
import type { WeeklyProgress } from '@/lib/progress';
import { spacing, typography } from '@/lib/theme';
import { createProgressCardStyles } from './progress-styles';

export interface UsageTrend {
  arrow: string;
  label: string;
  isPositive: boolean;
}

/** Trend arrow + label comparing this vs. previous week */
export function getTrend(current: number, previous: number): UsageTrend | null {
  if (previous === 0) return null;
  const diff = current - previous;
  if (diff === 0) return null;
  // For "used" lower is better, but this is generic — caller decides meaning
  return {
    arrow: diff > 0 ? '↑' : '↓',
    label: `${Math.abs(diff)}`,
    isPositive: diff < 0, // less usage is positive
  };
}

interface WeeklyStatsCardProps {
  week: WeeklyProgress;
  /** Shown under the stats when present; the screen passes it for the current week only. */
  trend: UsageTrend | null;
  currency: CurrencyCode;
  style?: ViewStyle;
}

/** The selected week's avoided / days / resisted, its trend and money saved. */
export const WeeklyStatsCard = memo(function WeeklyStatsCard({
  week,
  trend,
  currency,
  style,
}: WeeklyStatsCardProps) {
  const { colors } = useDesignTokens();
  const shared = useMemo(() => createProgressCardStyles(colors), [colors]);
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <Card variant="elevated" style={style} padding="lg">
      <View style={shared.statsGrid}>
        <View style={shared.statBox}>
          <Icon name="minus" size={20} color={colors.primary} weight="regular" />
          <Text style={s.statValue}>{Number(week.pouchesAvoided ?? 0)}</Text>
          <Text style={shared.statLabel}>Avoided</Text>
        </View>
        <View style={shared.statBox}>
          <Icon name="check-circle" size={20} color={colors.success} weight="regular" />
          <Text style={s.statValue}>
            {Number(week.daysUnderLimit ?? 0)}/
            {Number(week.daysUnderLimit ?? 0) + Number(week.daysOverLimit ?? 0)}
          </Text>
          <Text style={shared.statLabel}>
            {Number(week.daysWithoutData ?? 0) > 0 ? 'Days logged' : 'Days on track'}
          </Text>
        </View>
        <View style={shared.statBox}>
          <Icon name="brain" size={20} color={colors.warning} weight="regular" />
          <Text style={s.statValue}>{Number(week.cravingsResisted ?? 0)}</Text>
          <Text style={shared.statLabel}>Resisted</Text>
        </View>
      </View>

      {/* Trend indicator */}
      {trend && (
        <View style={s.trendRow}>
          <Text style={[s.trendArrow, { color: trend.isPositive ? colors.success : colors.error }]}>
            {trend.arrow} {trend.label}
          </Text>
          <Text style={s.trendLabel}>
            {trend.isPositive ? 'fewer' : 'more'} pouches vs. last week
          </Text>
        </View>
      )}

      {/* Money saved */}
      {week.moneySaved != null && week.moneySaved > 0 && (
        <View style={shared.moneyRow}>
          <Text style={shared.moneyLabel}>Saved this week</Text>
          <Text style={shared.moneyValue}>{formatMoney(week.moneySaved, currency)}</Text>
        </View>
      )}
    </Card>
  );
});

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    statValue: {
      ...typography.xl,
      fontWeight: '700',
      color: colors.text.primary,
    } as TextStyle,

    // Trend
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
      gap: spacing.xs,
    } as ViewStyle,
    trendArrow: {
      ...typography.sm,
      fontWeight: '700',
    } as TextStyle,
    trendLabel: {
      ...typography.sm,
      color: colors.text.secondary,
    } as TextStyle,
  });
