import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDesignTokens } from '@/lib/design';
import type { DailyBreakdown } from '@/lib/progress';
import { borderRadius, spacing } from '@/lib/theme';

interface WeekBarChartProps {
  data: DailyBreakdown[];
}

/** One bar per day: pouches used against that day's allowance line. */
export const WeekBarChart = memo(function WeekBarChart({ data }: WeekBarChartProps) {
  const { colors } = useDesignTokens();

  // Find max value for scaling (at least 1 to avoid division by zero)
  const maxVal = Math.max(1, ...data.map((d) => Math.max(d.used, d.allowance)));
  const BAR_HEIGHT = 120;

  return (
    <View style={barStyles.container}>
      {data.map((day, i) => {
        const usedHeight = (day.used / maxVal) * BAR_HEIGHT;
        const allowanceHeight = (day.allowance / maxVal) * BAR_HEIGHT;
        const overLimit = day.used > day.allowance && !day.isFuture;
        const underLimit = day.used <= day.allowance && day.used > 0;

        return (
          <Animated.View
            key={day.dayLabel}
            style={barStyles.column}
            entering={FadeInDown.delay(i * 60)
              .duration(300)
              .springify()}
          >
            {/* Value label */}
            <Text
              style={[
                barStyles.valueLabel,
                { color: day.isFuture ? colors.text.tertiary : colors.text.primary },
              ]}
            >
              {day.isFuture ? '–' : day.used}
            </Text>

            {/* Bar area */}
            <View style={[barStyles.barArea, { height: BAR_HEIGHT }]}>
              {/* Allowance line (dashed background) */}
              <View
                style={[
                  barStyles.allowanceLine,
                  {
                    bottom: allowanceHeight,
                    backgroundColor: colors.border.subtle,
                  },
                ]}
              />
              {/* Used bar */}
              <View
                style={[
                  barStyles.bar,
                  {
                    height: Math.max(day.isFuture ? 0 : 2, usedHeight),
                    backgroundColor: day.isFuture
                      ? colors.background.muted
                      : overLimit
                        ? colors.error
                        : underLimit
                          ? colors.primary
                          : colors.background.muted,
                    borderRadius: borderRadius.sm / 2,
                    opacity: day.isFuture ? 0.3 : 1,
                  },
                ]}
              />
            </View>

            {/* Day label */}
            <Text
              style={[
                barStyles.dayLabel,
                {
                  color: day.isToday ? colors.primary : colors.text.tertiary,
                  fontWeight: day.isToday ? '700' : '400',
                },
              ]}
            >
              {day.dayLabel}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
});

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: spacing.sm,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  barArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: '55%',
    minWidth: 12,
    maxWidth: 28,
  },
  allowanceLine: {
    position: 'absolute',
    left: '15%',
    right: '15%',
    height: 1.5,
  },
  dayLabel: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
});
