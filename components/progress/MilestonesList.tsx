import { memo, useMemo } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useDesignTokens } from '@/lib/design';
import type { Milestone } from '@/lib/progress';
import { animations, spacing, typography } from '@/lib/theme';
import { createProgressCardStyles } from './progress-styles';

/**
 * Icon + color for a milestone type.
 *
 * Pulls accent colors from the IAMJARL palette so dark mode auto-flips and we
 * avoid shipping hardcoded near-duplicate hex (#FF9500, #FFD700, etc) that
 * ignored the theme.
 */
type MilestoneIconName = 'medal' | 'trophy' | 'lightning' | 'coins' | 'brain' | 'star';
function milestoneIcon(
  type: Milestone['type'],
  colors: ReturnType<typeof useDesignTokens>['colors'],
): { name: MilestoneIconName; color: string } {
  switch (type) {
    case 'first_day_under_limit':
      return { name: 'medal', color: colors.warning };
    case 'week_under_limit':
      return { name: 'trophy', color: colors.primary };
    case 'pouches_avoided':
      return { name: 'lightning', color: colors.warning };
    case 'money_saved':
      return { name: 'coins', color: colors.success };
    case 'cravings_resisted':
      return { name: 'brain', color: colors.primary };
    default:
      return { name: 'star', color: colors.primary };
  }
}

interface MilestonesListProps {
  milestones: Milestone[];
  style?: ViewStyle;
}

/** The milestones reached so far, newest last. Renders nothing when there are none. */
export const MilestonesList = memo(function MilestonesList({
  milestones,
  style,
}: MilestonesListProps) {
  const { colors } = useDesignTokens();
  const shared = useMemo(() => createProgressCardStyles(colors), [colors]);
  const s = useMemo(() => createStyles(colors), [colors]);

  if (milestones.length === 0) return null;

  return (
    <Card variant="elevated" style={style} padding="lg">
      <Text style={shared.cardTitle}>Milestones</Text>
      {milestones.map((milestone, index) => {
        const badge = milestoneIcon(milestone.type, colors);
        return (
          <Animated.View
            key={milestone.id}
            style={[s.milestoneItem, index === milestones.length - 1 && s.milestoneItemLast]}
            entering={FadeInRight.delay(index * 80)
              .duration(animations.normal)
              .springify()}
          >
            <View style={[s.milestoneIconWrap, { backgroundColor: badge.color + '18' }]}>
              <Icon name={badge.name} size={22} color={badge.color} weight="fill" />
            </View>
            <View style={s.milestoneContent}>
              <Text style={s.milestoneTitle}>{milestone.title}</Text>
              <Text style={s.milestoneDate}>
                {new Date(milestone.achievedAt).toLocaleDateString()}
              </Text>
            </View>
          </Animated.View>
        );
      })}
    </Card>
  );
});

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    milestoneItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.subtle,
      gap: spacing.md,
    } as ViewStyle,
    milestoneItemLast: {
      borderBottomWidth: 0,
    } as ViewStyle,
    milestoneIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    milestoneContent: {
      flex: 1,
    } as ViewStyle,
    milestoneTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text.primary,
    } as TextStyle,
    milestoneDate: {
      ...typography.xs,
      color: colors.text.tertiary,
      marginTop: 2,
    } as TextStyle,
  });
