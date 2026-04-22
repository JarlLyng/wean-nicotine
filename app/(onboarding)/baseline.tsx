import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { useDesignTokens, getColors, typography } from '@/lib/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { spacing } from '@/lib/theme';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';

export default function BaselineScreen() {
  const { colors } = useDesignTokens();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [baseline, setBaseline] = useState('');
  const [error, setError] = useState('');
  const s = useMemo(
    () => createStyles(getColors(colorScheme === 'dark' ? 'dark' : 'light')),
    [colorScheme]
  );

  const handleNext = () => {
    const value = parseInt(baseline, 10);

    if (!baseline || isNaN(value) || value < 1 || value > 100) {
      setError('Enter a number between 1 and 100');
      return;
    }

    setError('');
    router.push({
      pathname: '/(onboarding)/price',
      params: { baseline: value.toString() },
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={s.content}>
            {/* Question */}
            <View style={s.questionSection}>
              <Text style={s.question}>
                How many pouches do you use per day?
              </Text>
              <Text style={s.hint}>
                Be honest — this is your starting point, not a target.
              </Text>
            </View>

            {/* Input */}
            <View style={s.inputSection}>
              <TextInput
                style={s.input}
                value={baseline}
                onChangeText={(text) => {
                  setBaseline(text);
                  setError('');
                }}
                placeholder="0"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                autoFocus
                maxLength={3}
                accessibilityLabel="Pouches per day"
                accessibilityHint="Enter how many pouches you typically use per day."
              />
              <Text style={s.inputLabel}>pouches per day</Text>
              {error ? <Text style={s.error}>{error}</Text> : null}
            </View>

            {/* Spacer pushes button to bottom */}
            <View style={s.spacer} />

            <Button
              title="Continue"
              onPress={handleNext}
              style={s.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    } as ViewStyle,
    scrollContent: {
      flexGrow: 1,
    } as ViewStyle,
    content: {
      flex: 1,
      paddingTop: spacing.xl,
      paddingHorizontal: 0,
      paddingBottom: spacing.lg,
    } as ViewStyle,

    // Question
    questionSection: {
      marginBottom: spacing.xxxl,
    } as ViewStyle,
    question: {
      fontSize: typography.sizes.xl,
      lineHeight: 30,
      fontWeight: `${typography.weights.bold}` as const,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    } as TextStyle,
    hint: {
      fontSize: typography.sizes.sm,
      lineHeight: typography.lineHeights.tight,
      color: colors.text.secondary,
    } as TextStyle,

    // Input
    inputSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    } as ViewStyle,
    input: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: `${typography.weights.bold}` as const,
      color: colors.text.primary,
      textAlign: 'center' as const,
      width: '100%',
      paddingVertical: spacing.lg,
      borderBottomWidth: 2,
      borderBottomColor: colors.border.subtle,
    } as TextStyle,
    inputLabel: {
      fontSize: typography.sizes.sm,
      lineHeight: typography.lineHeights.tight,
      color: colors.text.secondary,
      marginTop: spacing.sm,
    } as TextStyle,
    error: {
      fontSize: typography.sizes.sm,
      lineHeight: typography.lineHeights.tight,
      color: colors.error,
      marginTop: spacing.sm,
    } as TextStyle,

    // Layout
    spacer: {
      flex: 1,
      minHeight: spacing.xl,
    } as ViewStyle,
    button: {
      marginTop: spacing.md,
    } as ViewStyle,
  });
