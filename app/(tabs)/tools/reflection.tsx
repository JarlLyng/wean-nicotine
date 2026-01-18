import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

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
  const reflectionStyles = createReflectionStyles(colors);

  const currentPrompt = REFLECTION_PROMPTS[currentPromptIndex];

  const handleNext = () => {
    setShowFollowUp(false);
    setCurrentPromptIndex((prev) => (prev + 1) % REFLECTION_PROMPTS.length);
  };

  const handleShowFollowUp = () => {
    setShowFollowUp(true);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={reflectionStyles.scrollContent}>
        <View style={reflectionStyles.content}>
          <Text style={reflectionStyles.title}>Reflection</Text>
          <Text style={reflectionStyles.subtitle}>
            Take a moment to reflect. There&apos;s no right or wrong answer — just honest
            self-awareness.
          </Text>

          <View style={reflectionStyles.promptContainer}>
            <Text style={reflectionStyles.promptText}>{currentPrompt.prompt}</Text>
          </View>

          {!showFollowUp ? (
            <TouchableOpacity style={reflectionStyles.button} onPress={handleShowFollowUp}>
              <Text style={reflectionStyles.buttonText}>I&apos;ve reflected on this</Text>
            </TouchableOpacity>
          ) : (
            <View style={reflectionStyles.followUpContainer}>
              <Text style={reflectionStyles.followUpText}>{currentPrompt.followUp}</Text>
              <TouchableOpacity style={reflectionStyles.nextButton} onPress={handleNext}>
                <Text style={reflectionStyles.nextButtonText}>Next Prompt</Text>
              </TouchableOpacity>
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
    padding: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  promptContainer: {
    backgroundColor: colors.background.muted,
    borderRadius: 12,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    minHeight: 150,
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  followUpContainer: {
    marginBottom: spacing.md,
  },
  followUpText: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nextButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.background.card,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderLeftWidth: 2,
    borderLeftColor: colors.success,
  },
  infoText: {
    fontSize: 14,
    color: colors.success,
    lineHeight: 20,
    textAlign: 'center',
  },
});
