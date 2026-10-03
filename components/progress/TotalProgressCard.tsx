import { memo, useMemo } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { formatMoney, type CurrencyCode } from '@/lib/currency';
import { useDesignTokens } from '@/lib/design';
import type { TotalProgress } from '@/lib/progress';
import { spacing, typography } from '@/lib/theme';
import { createProgressCardStyles } from './progress-styles';

interface TotalProgressCardProps {
  total: TotalProgress;
  currency: CurrencyCode;
  style?: ViewStyle;
}

/** "All Time": pouches avoided, days, cravings resisted, money and average. */
export const TotalProgressCard = memo(function TotalProgressCard({
  total,
  currency,
  style,
}: TotalProgressCardProps) {
  const { colors } = useDesignTokens();
  const shared = useMemo(() => createProgressCardStyles(colors), [colors]);
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <Card variant="elevated" style={style} padding="lg">
      <Text style={shared.cardTitle}>All Time</Text>
      <View style={shared.statsGrid}>
        <View style={shared.statBox}>
          <Text style={s.statValueLarge}>{Number(total.totalPouchesAvoided ?? 0)}</Text>
          <Text style={shared.statLabel}>Pouches avoided</Text>
        </View>
        <View style={shared.statBox}>
          <Text style={s.statValueLarge}>{Number(total.daysSinceStart ?? 0)}</Text>
          <Text style={shared.statLabel}>Days</Text>
        </View>
        <View style={shared.statBox}>
          <Text style={s.statValueLarge}>{Number(total.totalCravingsResisted ?? 0)}</Text>
          <Text style={shared.statLabel}>Resisted</Text>
        </View>
      </View>

      {total.totalMoneySaved != null && total.totalMoneySaved > 0 && (
        <View style={shared.moneyRow}>
          <Text style={shared.moneyLabel}>Total saved</Text>
          <Text style={shared.moneyValue}>{formatMoney(total.totalMoneySaved, currency)}</Text>
        </View>
      )}

      <View style={s.averageRow}>
        <Text style={s.averageLabel}>Average daily usage</Text>
        <Text style={s.averageValue}>{(total.averageDailyUsage ?? 0).toFixed(1)} / day</Text>
      </View>
    </Card>
  );
});

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    statValueLarge: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700',
      color: colors.primary,
    } as TextStyle,

    // Average
    averageRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
    } as ViewStyle,
    averageLabel: {
      ...typography.sm,
      color: colors.text.secondary,
    } as TextStyle,
    averageValue: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text.primary,
    } as TextStyle,
  });
