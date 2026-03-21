import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { spacing, borderRadius } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const REFLECTION_PROMPTS = [
  {
    id: '1',
    prompt: 'What triggered my craving today?',
    followUp: 'Understanding triggers helps you prepare for them next time.',
  },
  {
    id: '2',
    prompt: 'How did I feel before using a pouch?',
    followUp: 'Noticing your emotional state can help you find alternative ways to cope.',
  },
  {
    id: '3',
    prompt: 'What helped me resist a craving today?',
    followUp: 'Recognizing what works helps you use those strategies again.',
  },
  {
    id: '4',
    prompt: 'What progress have I made this week?',
    followUp: 'Even small steps forward are worth celebrating.',
  },
  {
    id: '5',
    prompt: 'How can I be kinder to myself today?',
    followUp: 'Self-compassion makes the journey easier and more sustainable.',
  },
  {
    id: '6',
    prompt: 'What would I tell a friend in my situation?',
    followUp: 'Sometimes we need to extend ourselves the same kindness we give others.',
  },
  {
    id: '7',
    prompt: 'What am I learning about myself through this process?',
    followUp: 'Every challenge is an opportunity to grow and understand yourself better.',
  },
];

export default function ReflectionScreen() {
  const { colors } = useDesignTokens();
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const reflectionStyles = useMemo(() => createReflectionStyles(colors), [colors]);

  const currentPrompt = REFLECTION_PROMPTS[currentPromptIndex];

  const handleNext = () => {
    setShowFollowUp(false);
    setCurrentPromptIndex((prev) => (prev + 1) % REFLECTION_PROMPTS.length);
  };

  const handleShowFollowUp = () => {
    setShowFollowUp(true);
  };

  const buttonLabel = showFollowUp ? 'Next Prompt' : "I've reflected on this";
  const buttonOnPress = showFollowUp ? handleNext : handleShowFollowUp;
  const buttonStyle = showFollowUp ? reflectionStyles.nextButton : reflectionStyles.button;
  const buttonTextStyle = showFollowUp ? reflectionStyles.nextButtonText : reflectionStyles.buttonText;

  return (
    <Screen>
      <ScrollView contentContainerStyle={reflectionStyles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={reflectionStyles.content}>
          <Text style={reflectionStyles.subtitle}>
            Take a moment to reflect. There&apos;s no right or wrong answer — just honest
            self-awareness.
          </Text>

          <View style={reflectionStyles.promptContainer}>
            <Text style={reflectionStyles.promptText}>{currentPrompt.prompt}</Text>
          </View>

          <TouchableOpacity
            style={buttonStyle}
            onPress={buttonOnPress}
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}
            accessibilityHint={showFollowUp ? 'Shows the next reflection prompt.' : 'Shows a follow-up message.'}>
            <Animated.Text
              // Force remount of label so FadeOut/FadeIn runs on swap
              key={buttonLabel}
              entering={FadeIn.duration(160)}
              exiting={FadeOut.duration(160)}
              style={buttonTextStyle}>
              {buttonLabel}
            </Animated.Text>
          </TouchableOpacity>

          {showFollowUp && (
            <View style={reflectionStyles.followUpContainer}>
              <Text style={reflectionStyles.followUpText}>{currentPrompt.followUp}</Text>
            </View>
          )}

          <View style={reflectionStyles.infoBox}>
            <Text style={reflectionStyles.infoText}>
              These prompts are here to help you understand your patterns and progress. There&apos;s no
              pressure to answer perfectly — just be honest with yourself.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createReflectionStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
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
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.normal,
    textAlign: 'center',
  },
  promptContainer: {
    backgroundColor: colors.background.muted,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    minHeight: 150,
    justifyContent: 'center',
  },
  promptText: {
    fontSize: typography.sizes.xl,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: `${typography.weights.semibold}`,
  },
  followUpContainer: {
    marginBottom: spacing.md,
  },
  followUpText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.normal,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.onPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: `${typography.weights.semibold}`,
  },
  infoBox: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.tight,
    textAlign: 'center',
  },
});
