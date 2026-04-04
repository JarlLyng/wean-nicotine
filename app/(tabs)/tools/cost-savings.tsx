import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { spacing, borderRadius } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import { getTaperSettings } from '@/lib/db-settings';
import { calculateCostSavings, type CostSavingsData } from '@/lib/cost-savings';
import { formatMoney } from '@/lib/currency';
import { captureError } from '@/lib/sentry';

export default function CostSavingsScreen() {
  const { colors } = useDesignTokens();
  const [data, setData] = useState<CostSavingsData | null>(null);
  const [currency, setCurrency] = useState<string>('DKK');
  const [noPrice, setNoPrice] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const s = useMemo(() => createStyles(colors), [colors]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const settings = await getTaperSettings();
          if (!settings) return;
          if (!settings.pricePerCan) {
            setNoPrice(true);
            return;
          }
          setCurrency(settings.currency ?? 'DKK');
          setStartDate(new Date(settings.startDate));
          const result = await calculateCostSavings(settings);
          setData(result);
        } catch (e) {
          if (e instanceof Error) captureError(e);
        }
      })();
    }, []),
  );

  if (noPrice) {
    return (
      <Screen>
        <View style={s.emptyContainer}>
          <Icon name="piggy-bank" size={56} color={colors.text.tertiary} />
          <Text style={s.emptyTitle}>No price data</Text>
          <Text style={s.emptyText}>
            Add your pouch price in Settings to see how much money you're saving.
          </Text>
        </View>
      </Screen>
    );
  }

  if (!data) return <Screen><View /></Screen>;

  const fmt = (cents: number) => formatMoney(cents, currency as any);

  // Show last 6 weeks max
  const recentWeeks = data.weeklySavings.slice(-6);
  const recentMonths = data.monthlySavings.slice(-6);

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <Animated.View entering={FadeInDown.duration(300)}>
          <Card variant="elevated" padding="lg" style={s.heroCard}>
            <Icon name="piggy-bank" size={40} color={colors.primary} weight="duotone" />
            <Text style={s.heroAmount}>{fmt(data.totalSaved)}</Text>
            <Text style={s.heroSubtitle}>
              saved since {startDate ? `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}` : '—'}
            </Text>
          </Card>
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Per day</Text>
            <Text style={s.statValue}>{fmt(data.dailyRate)}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>Projected/month</Text>
            <Text style={s.statValue}>{fmt(data.projectedMonthlySaving)}</Text>
          </View>
        </Animated.View>

        {/* Weekly breakdown */}
        {recentWeeks.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <Text style={s.sectionTitle}>Weekly</Text>
            {recentWeeks.map((w, i) => (
              <View key={i} style={s.row}>
                <Text style={s.rowLabel}>Week of {w.weekLabel}</Text>
                <Text style={s.rowValue}>{fmt(w.saved)}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Monthly breakdown */}
        {recentMonths.length > 1 && (
          <Animated.View entering={FadeInDown.delay(300).duration(300)}>
            <Text style={[s.sectionTitle, { marginTop: spacing.lg }]}>Monthly</Text>
            {recentMonths.map((m, i) => (
              <View key={i} style={s.row}>
                <Text style={s.rowLabel}>{m.monthLabel}</Text>
                <Text style={s.rowValue}>{fmt(m.saved)}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        <View style={s.bottom} />
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    scrollContent: {
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    heroCard: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    heroAmount: {
      fontSize: 40,
      fontWeight: `${typography.weights.bold}`,
      color: colors.text.primary,
      marginTop: spacing.sm,
    },
    heroSubtitle: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.background.muted,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    statLabel: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    statValue: {
      fontSize: typography.sizes.lg,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.text.primary,
    },
    sectionTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border.subtle,
    },
    rowLabel: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
    },
    rowValue: {
      fontSize: typography.sizes.base,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.text.primary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyTitle: {
      fontSize: typography.sizes.lg,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.text.primary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    emptyText: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    bottom: {
      height: spacing.lg,
    },
  });
