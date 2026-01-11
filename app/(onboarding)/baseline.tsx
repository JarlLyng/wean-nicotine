import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, colors, typography, borderRadius } from '@/lib/theme';

export default function BaselineScreen() {
  const router = useRouter();
  const [baseline, setBaseline] = useState('');
  const [error, setError] = useState('');

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Card variant="flat" style={styles.card} padding="lg">
            <Text style={styles.description}>
              How many pouches do you typically use per day?
            </Text>
            <Text style={styles.hint}>
              Be honest — this helps us create a realistic plan for you.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
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
              <Text style={styles.inputLabel}>pouches per day</Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Card>

          <Button
            title="Continue"
            onPress={handleNext}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography['2xl'],
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.semantic.error.main,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
});
