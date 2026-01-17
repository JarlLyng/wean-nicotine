import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, typography, borderRadius } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

export default function BaselineScreen() {
  const { colors } = useDesignTokens();
  const router = useRouter();
  const [baseline, setBaseline] = useState('');
  const [error, setError] = useState('');
  const baselineStyles = createBaselineStyles(colors);

  const handleNext = () => {
    const value = parseInt(baseline, 10);
    
    if (!baseline || isNaN(value) || value < 1 || value > 100) {
      setError('Please enter a number between 1 and 100');
      return;
    }

    setError('');
    router.push({
      pathname: '/(onboarding)/price',
      params: { baseline: value.toString() },
    });
  };

  return (
    <Screen variant="gradient" title="Set Your Baseline">
      <ScrollView contentContainerStyle={baselineStyles.scrollContent}>
        <View style={baselineStyles.content}>
          <Card variant="flat" style={baselineStyles.card} padding="lg">
            <Text style={baselineStyles.description}>
              How many pouches do you typically use per day?
            </Text>
            <Text style={baselineStyles.hint}>
              Be honest — this helps us create a realistic plan for you.
            </Text>

            <View style={baselineStyles.inputContainer}>
              <TextInput
                style={baselineStyles.input}
                value={baseline}
                onChangeText={(text) => {
                  setBaseline(text);
                  setError('');
                }}
                placeholder="e.g., 10"
                placeholderTextColor={colors.text.secondary}
                keyboardType="number-pad"
                autoFocus
              />
              <Text style={baselineStyles.inputLabel}>pouches per day</Text>
            </View>

            {error ? <Text style={baselineStyles.error}>{error}</Text> : null}
          </Card>

          <Button
            title="Continue"
            onPress={handleNext}
            style={baselineStyles.button}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const createBaselineStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border.subtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    backgroundColor: colors.surface.default,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
} as const);
