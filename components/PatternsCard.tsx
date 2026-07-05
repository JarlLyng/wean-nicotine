/**
 * PatternsCard — descriptive usage-pattern insight for the Progress tab (#221).
 *
 * Shows two breakdowns over the trailing window:
 *  - pouches by part of day (morning / afternoon / evening / night)
 *  - pouches by trigger tag (only when the user has tagged entries)
 *
 * Deliberately descriptive, never judgmental: horizontal bars in the primary
 * color, no red, no "worst time" framing. Hidden entirely below a minimum
 * data threshold — a half-empty insight reads as noise.
 */

import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Card } from '@/components/ui/Card';
import { spacing, typography, borderRadius } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import type { UsagePatterns } from '@/lib/progress';

/** Don't show the card until there's enough data to say something honest. */
export const PATTERNS_MIN_POUCHES = 10;

interface PatternsCardProps {
  patterns: UsagePatterns;
  /** Whether the user configured triggers at all — drives the tagging hint. */
  hasTriggersConfigured: boolean;
  style?: ViewStyle;
}

function BarRow({
  label,
  count,
  max,
  colors,
}: {
  label: string;
  count: number;
  max: number;
  colors: ReturnType<typeof useDesignTokens>['colors'];
}) {
  const s = rowStyles;
  const fraction = max > 0 ? count / max : 0;
  return (
    <View style={s.row} accessibilityLabel={`${label}: ${count} pouches`}>
      <Text style={[s.label, { color: colors.text.secondary }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={[s.track, { backgroundColor: colors.background.muted }]}>
        <View
          style={[
            s.fill,
            {
              backgroundColor: colors.primary,
              // Keep a sliver visible for non-zero counts so small numbers don't vanish
              width: count > 0 ? `${Math.max(4, fraction * 100)}%` : 0,
            },
          ]}
        />
      </View>
      <Text style={[s.count, { color: colors.text.primary }]}>{count}</Text>
    </View>
  );
}

export function PatternsCard({ patterns, hasTriggersConfigured, style }: PatternsCardProps) {
  const { colors } = useDesignTokens();

  if (patterns.totalPouches < PATTERNS_MIN_POUCHES) return null;

  const maxPart = Math.max(...patterns.partsOfDay.map((p) => p.count));
  const topTriggers = patterns.triggerCounts.slice(0, 5);
  const maxTrigger = topTriggers.length > 0 ? topTriggers[0].count : 0;

  return (
    <Card variant="elevated" padding="lg" style={style}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Patterns</Text>
      <Text style={[styles.subtitle, { color: colors.text.tertiary }]}>
        Last {patterns.windowDays} days · {patterns.totalPouches} pouches
      </Text>

      <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>Time of day</Text>
      <View style={styles.barGroup}>
        {patterns.partsOfDay.map((part) => (
          <BarRow
            key={part.key}
            label={part.label}
            count={part.count}
            max={maxPart}
            colors={colors}
          />
        ))}
      </View>

      {topTriggers.length > 0 ? (
        <>
          <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>Triggers</Text>
          <View style={styles.barGroup}>
            {topTriggers.map((t) => (
              <BarRow
                key={t.trigger}
                label={t.trigger}
                count={t.count}
                max={maxTrigger}
                colors={colors}
              />
            ))}
          </View>
          {patterns.taggedPouches < patterns.totalPouches && (
            <Text style={[styles.footnote, { color: colors.text.tertiary }]}>
              Based on the {patterns.taggedPouches} pouches you tagged.
            </Text>
          )}
        </>
      ) : hasTriggersConfigured ? (
        <Text style={[styles.footnote, { color: colors.text.tertiary }]}>
          Tag pouches on the Today screen to see which triggers show up most.
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.lg,
    fontWeight: '600',
  } as TextStyle,
  subtitle: {
    ...typography.xs,
    marginTop: 2,
    marginBottom: spacing.md,
  } as TextStyle,
  sectionLabel: {
    ...typography.sm,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  } as TextStyle,
  barGroup: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  } as ViewStyle,
  footnote: {
    ...typography.xs,
    marginTop: spacing.xs,
  } as TextStyle,
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  } as ViewStyle,
  label: {
    ...typography.sm,
    width: 110,
  } as TextStyle,
  track: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  } as ViewStyle,
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
  } as ViewStyle,
  count: {
    ...typography.sm,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'right',
  } as TextStyle,
});
