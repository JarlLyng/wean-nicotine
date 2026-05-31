import { useDesignTokens } from '@/lib/design';
import { spacing } from '@/lib/theme';
import { StyleSheet, View } from 'react-native';

interface OnboardingProgressProps {
  /** 1-indexed current step. */
  current: number;
  /** Total number of steps. */
  total: number;
}

/**
 * Visual onboarding progress indicator.
 *
 * Renders one dot per step. The current step's dot is wider and filled with
 * `colors.primary`; completed and upcoming steps render as small dots in
 * `colors.border.default` / `colors.border.subtle` respectively.
 *
 * Placed just below the screen header in each onboarding screen so users can
 * see at a glance how far through the flow they are.
 */
export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  const { colors } = useDesignTokens();

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${current} of ${total}`}
      accessibilityValue={{ min: 1, max: total, now: current }}>
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isCurrent = step === current;
        const isCompleted = step < current;
        const backgroundColor = isCurrent || isCompleted ? colors.primary : colors.border.subtle;
        return (
          <View
            key={step}
            style={[
              styles.dot,
              isCurrent && styles.dotCurrent,
              { backgroundColor },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotCurrent: {
    width: 24,
  },
});
