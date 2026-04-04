import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { spacing, borderRadius } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import { saveReflection, getReflectionCount } from '@/lib/db-reflections';
import { captureError } from '@/lib/sentry';
import * as Haptics from 'expo-haptics';
import type { ReflectionCategory } from '@/lib/models';

interface Prompt {
  id: string;
  category: ReflectionCategory;
  prompt: string;
  followUp: string;
}

const REFLECTION_PROMPTS: Prompt[] = [
  {
    id: '1',
    category: 'triggers',
    prompt: 'What triggered my craving today?',
    followUp: 'Understanding triggers helps you prepare for them next time.',
  },
  {
    id: '2',
    category: 'triggers',
    prompt: 'How did I feel before using a pouch?',
    followUp: 'Noticing your emotional state can help you find alternative ways to cope.',
  },
  {
    id: '3',
    category: 'progress',
    prompt: 'What helped me resist a craving today?',
    followUp: 'Recognizing what works helps you use those strategies again.',
  },
  {
    id: '4',
    category: 'progress',
    prompt: 'What progress have I made this week?',
    followUp: 'Even small steps forward are worth celebrating.',
  },
  {
    id: '5',
    category: 'self-care',
    prompt: 'How can I be kinder to myself today?',
    followUp: 'Self-compassion makes the journey easier and more sustainable.',
  },
  {
    id: '6',
    category: 'self-care',
    prompt: 'What would I tell a friend in my situation?',
    followUp: 'Sometimes we need to extend ourselves the same kindness we give others.',
  },
  {
    id: '7',
    category: 'progress',
    prompt: 'What am I learning about myself through this process?',
    followUp: 'Every challenge is an opportunity to grow and understand yourself better.',
  },
];

const CATEGORIES: Array<{ key: ReflectionCategory | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'triggers', label: 'Triggers' },
  { key: 'progress', label: 'Progress' },
  { key: 'self-care', label: 'Self-care' },
];

export default function ReflectionScreen() {
  const { colors } = useDesignTokens();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ReflectionCategory | 'all'>('all');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [journalCount, setJournalCount] = useState(0);
  const s = useMemo(() => createStyles(colors), [colors]);

  useFocusEffect(
    useCallback(() => {
      getReflectionCount().then(setJournalCount).catch(captureError);
    }, []),
  );

  const filteredPrompts = selectedCategory === 'all'
    ? REFLECTION_PROMPTS
    : REFLECTION_PROMPTS.filter((p) => p.category === selectedCategory);

  const currentPrompt = filteredPrompts[currentPromptIndex % filteredPrompts.length];

  const handleReflect = () => {
    setShowFollowUp(true);
  };

  const handleSave = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await saveReflection(currentPrompt.id, currentPrompt.category, currentPrompt.prompt, note.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSaved(true);
      setJournalCount((c) => c + 1);
    } catch (e) {
      if (e instanceof Error) captureError(e);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    setShowFollowUp(false);
    setNote('');
    setSaved(false);
    setCurrentPromptIndex((prev) => (prev + 1) % filteredPrompts.length);
  };

  const handleCategoryChange = (key: ReflectionCategory | 'all') => {
    setSelectedCategory(key);
    setCurrentPromptIndex(0);
    setShowFollowUp(false);
    setNote('');
    setSaved(false);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}>
        <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={s.content}>
            <Text style={s.subtitle}>
              Take a moment to reflect. No right or wrong — just honest self-awareness.
            </Text>

            {/* Category filter */}
            <View style={s.pillRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[s.pill, selectedCategory === cat.key && s.pillActive]}
                  onPress={() => handleCategoryChange(cat.key)}>
                  <Text style={[s.pillText, selectedCategory === cat.key && s.pillTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Prompt card */}
            <Animated.View
              key={currentPrompt.id + selectedCategory}
              entering={FadeIn.duration(200)}
              style={s.promptContainer}>
              <Text style={s.categoryBadge}>{currentPrompt.category}</Text>
              <Text style={s.promptText}>{currentPrompt.prompt}</Text>
            </Animated.View>

            {/* Action area */}
            {!showFollowUp ? (
              <Button title="I've reflected on this" onPress={handleReflect} />
            ) : (
              <Animated.View entering={FadeInDown.duration(200)}>
                <Text style={s.followUpText}>{currentPrompt.followUp}</Text>

                {/* Journal input */}
                {!saved ? (
                  <>
                    <TextInput
                      style={s.textInput}
                      placeholder="Write a short note (optional)..."
                      placeholderTextColor={colors.text.tertiary}
                      value={note}
                      onChangeText={setNote}
                      multiline
                      textAlignVertical="top"
                    />
                    <View style={s.buttonRow}>
                      {note.trim().length > 0 && (
                        <Button
                          title="Save to Journal"
                          onPress={handleSave}
                          loading={saving}
                          style={s.flex}
                        />
                      )}
                    </View>
                  </>
                ) : (
                  <Animated.View entering={FadeIn.duration(200)} style={s.savedRow}>
                    <Icon name="check-circle" size={20} color={colors.success} />
                    <Text style={s.savedText}>Saved to journal</Text>
                  </Animated.View>
                )}

                <Button
                  title="Next Prompt"
                  variant={saved || !note.trim() ? 'primary' : 'secondary'}
                  onPress={handleNext}
                  style={s.nextButton}
                />
              </Animated.View>
            )}

            {/* Journal link */}
            {journalCount > 0 && (
              <TouchableOpacity
                style={s.journalLink}
                onPress={() => router.push('/(tabs)/tools/reflection-journal' as any)}>
                <Icon name="book-open" size={18} color={colors.primary} />
                <Text style={s.journalLinkText}>
                  View Journal ({journalCount} {journalCount === 1 ? 'entry' : 'entries'})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    content: {
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    subtitle: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      lineHeight: typography.lineHeights.normal,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    pillRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    pill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 9999,
      backgroundColor: colors.background.muted,
    },
    pillActive: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: typography.sizes.sm,
      fontWeight: '500' as const,
      color: colors.text.secondary,
    },
    pillTextActive: {
      color: colors.onPrimary,
    },
    promptContainer: {
      backgroundColor: colors.background.muted,
      borderRadius: borderRadius.md,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      minHeight: 140,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryBadge: {
      fontSize: typography.sizes.xs,
      fontWeight: '500' as const,
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    promptText: {
      fontSize: typography.sizes.xl,
      fontWeight: '500' as const,
      color: colors.text.primary,
      textAlign: 'center',
      lineHeight: typography.lineHeights.relaxed,
    },
    followUpText: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      lineHeight: typography.lineHeights.normal,
      textAlign: 'center',
      fontStyle: 'italic',
      marginBottom: spacing.md,
    },
    textInput: {
      backgroundColor: colors.background.muted,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      fontSize: typography.sizes.base,
      color: colors.text.primary,
      minHeight: 80,
      marginBottom: spacing.md,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    savedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    savedText: {
      fontSize: typography.sizes.base,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.success,
    },
    nextButton: {
      marginTop: spacing.sm,
    },
    journalLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.xl,
      paddingVertical: spacing.sm,
    },
    journalLinkText: {
      fontSize: typography.sizes.base,
      color: colors.primary,
      fontWeight: '500' as const,
    },
  });
