import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDesignTokens } from '@/lib/design';
import { borderRadius, spacing, typography } from '@/lib/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';

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
    <Screen title="Set Your Baseline">
      <ScrollView contentContainerStyle={baselineStyles.scrollContent} showsVerticalScrollIndicator={false}>
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
                accessibilityLabel="Baseline pouches per day"
                accessibilityHint="Enter how many pouches you typically use per day."
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
  const styles = {
    scrollContent: {
      flexGrow: 1,
    } as ViewStyle,
    content: {
      flex: 1,
      paddingTop: spacing.lg,
      // Screen-komponenten giver allerede horizontal padding
      paddingHorizontal: 0,
      paddingBottom: spacing.lg,
    } as ViewStyle,
    card: {
      marginBottom: spacing.lg,
    } as ViewStyle,
    description: {
      ...typography.xl,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: spacing.sm,
      textAlign: 'center' as const,
    } as TextStyle,
    hint: {
      ...typography.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xl,
      textAlign: 'center' as const,
    } as TextStyle,
    inputContainer: {
      marginBottom: spacing.md,
    } as ViewStyle,
    input: {
      borderWidth: 2,
      borderColor: colors.border.subtle,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...typography['2xl'],
      fontWeight: '600' as const,
      color: colors.text.primary,
      textAlign: 'center' as const,
      marginBottom: spacing.xs,
      backgroundColor: colors.surface.default,
    } as TextStyle,
    inputLabel: {
      ...typography.caption,
      color: colors.text.secondary,
      textAlign: 'center' as const,
    } as TextStyle,
    error: {
      ...typography.caption,
      color: colors.shared.error,
      marginBottom: spacing.sm,
      textAlign: 'center' as const,
    } as TextStyle,
    button: {
      marginTop: spacing.md,
    } as ViewStyle,
  };
  return StyleSheet.create(styles);
};
