import { memo, useMemo } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { useDesignTokens } from '@/lib/design';
import type { DailyBreakdown } from '@/lib/progress';
import { spacing, typography } from '@/lib/theme';
import { createProgressCardStyles } from './progress-styles';
import { WeekBarChart } from './WeekBarChart';

interface DailyUsageCardProps {
  data: DailyBreakdown[];
  style?: ViewStyle;
}

/** "Daily Usage": the week's bar chart under its title and legend. */
export const DailyUsageCard = memo(function DailyUsageCard({ data, style }: DailyUsageCardProps) {
  const { colors } = useDesignTokens();
  const shared = useMemo(() => createProgressCardStyles(colors), [colors]);
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <Card variant="elevated" style={style} padding="lg">
      <View style={s.chartHeader}>
        <Text style={shared.cardTitle}>Daily Usage</Text>
        <View style={s.legendRow}>
          <View style={[s.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={s.legendText}>Under limit</Text>
          <View style={[s.legendDot, { backgroundColor: colors.error }]} />
          <Text style={s.legendText}>Over</Text>
          <View style={[s.legendDot, { backgroundColor: colors.border.default }]} />
          <Text style={s.legendText}>No data</Text>
          <View style={[s.legendDot, { backgroundColor: colors.border.subtle }]} />
          <Text style={s.legendText}>Upcoming</Text>
        </View>
      </View>
      <WeekBarChart data={data} />
    </Card>
  );
});

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    // Chart header — title stacked above the legend. A single row can't fit
    // "Daily Usage" + a 4-item legend on a phone, so they collided (#254).
    chartHeader: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: spacing.sm,
      marginBottom: spacing.md,
    } as ViewStyle,
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      rowGap: spacing.xs,
      gap: spacing.xs,
    } as ViewStyle,
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    } as ViewStyle,
    legendText: {
      ...typography.xs,
      color: colors.text.tertiary,
      marginRight: spacing.sm,
    } as TextStyle,
  });
