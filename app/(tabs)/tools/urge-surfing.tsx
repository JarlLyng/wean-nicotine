import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

export default function UrgeSurfingScreen() {
  const { colors } = useDesignTokens();
  const urgeStyles = useMemo(() => createUrgeStyles(colors), [colors]);
  
  return (
    <Screen title="Urge Surfing">
      <ScrollView contentContainerStyle={urgeStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={urgeStyles.content}>
          <Text style={urgeStyles.subtitle}>
            A technique to help you ride out cravings without giving in
          </Text>

          <View style={urgeStyles.section}>
            <Text style={urgeStyles.heading}>What is Urge Surfing?</Text>
            <Text style={urgeStyles.text}>
              Urge surfing is a mindfulness technique where you observe your craving like a wave —
              noticing it rise, peak, and fall — without acting on it.
            </Text>
          </View>

          <View style={urgeStyles.section}>
            <Text style={urgeStyles.heading}>How to Practice</Text>
            <View style={urgeStyles.stepContainer}>
              <Text style={urgeStyles.stepNumber}>1</Text>
              <Text style={urgeStyles.stepText}>
                <Text style={urgeStyles.stepTitle}>Notice the urge.</Text> When a craving appears, don&apos;t
                fight it. Simply acknowledge it: &quot;I&apos;m having a craving right now.&quot;
              </Text>
            </View>

            <View style={urgeStyles.stepContainer}>
              <Text style={urgeStyles.stepNumber}>2</Text>
              <Text style={urgeStyles.stepText}>
                <Text style={urgeStyles.stepTitle}>Observe without judgment.</Text> Notice where you
                feel it in your body. Is it tension? Restlessness? Just observe, without judging
                yourself.
              </Text>
            </View>

            <View style={urgeStyles.stepContainer}>
              <Text style={urgeStyles.stepNumber}>3</Text>
              <Text style={urgeStyles.stepText}>
                <Text style={urgeStyles.stepTitle}>Ride the wave.</Text> Cravings are temporary. Like a
                wave, they build, peak, and then subside. Remind yourself: &quot;This will pass.&quot;
              </Text>
            </View>

            <View style={urgeStyles.stepContainer}>
              <Text style={urgeStyles.stepNumber}>4</Text>
              <Text style={urgeStyles.stepText}>
                <Text style={urgeStyles.stepTitle}>Breathe through it.</Text> Take slow, deep breaths.
                Focus on your breathing as the craving peaks and begins to fade.
              </Text>
            </View>

            <View style={urgeStyles.stepContainer}>
              <Text style={urgeStyles.stepNumber}>5</Text>
              <Text style={urgeStyles.stepText}>
                <Text style={urgeStyles.stepTitle}>Notice it passing.</Text> As the urge subsides,
                acknowledge that you rode it out. Each time you do this, it gets easier.
              </Text>
            </View>
          </View>

          <View style={urgeStyles.section}>
            <Text style={urgeStyles.heading}>Remember</Text>
            <Text style={urgeStyles.text}>
              Cravings typically peak within 5-15 minutes and then fade. You don&apos;t have to act on
              them. Each time you successfully ride out a craving, you&apos;re strengthening your ability
              to handle them.
            </Text>
          </View>

          <View style={urgeStyles.encouragementBox}>
            <Text style={urgeStyles.encouragementText}>
              You&apos;ve got this. Every wave passes, and you&apos;re learning to surf.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createUrgeStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
    // Screen-komponenten giver allerede horizontal padding
    paddingHorizontal: 0,
    paddingBottom: spacing.lg,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    width: 40,
    marginRight: spacing.md,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.primary,
  },
  stepTitle: {
    fontWeight: '600',
    color: colors.primary,
  },
  encouragementBox: {
    backgroundColor: colors.background.card,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  encouragementText: {
    fontSize: 16,
    // Avoid low-contrast semantic green as body text.
    color: colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
});
