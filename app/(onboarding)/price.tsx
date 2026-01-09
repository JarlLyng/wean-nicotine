import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, colors, typography, borderRadius } from '@/lib/theme';

export default function PriceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;
  
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (price && price.trim() !== '') {
      const value = parseFloat(price);
      if (isNaN(value) || value < 0) {
        setError('Please enter a valid price');
        return;
      }
    }

    setError('');
    router.push({
      pathname: '/(onboarding)/triggers',
      params: {
        baseline: baseline.toString(),
        price: price || '0',
      },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/(onboarding)/triggers',
      params: {
        baseline: baseline.toString(),
        price: '0',
      },
    });
  };

  return (
    <Screen variant="gradient" title="Price Per Can">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Card variant="flat" style={styles.card} padding="lg">
            <Text style={styles.description}>
              If you'd like to track money saved, enter the price you pay per can.
            </Text>
            <Text style={styles.hint}>
              You can skip this and add it later in settings.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  setError('');
                }}
                placeholder="e.g., 50.00"
                placeholderTextColor={colors.text.secondary}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputLabel}>price per can</Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </Card>

          <Button
            title="Continue"
            onPress={handleNext}
            style={styles.button}
          />

          <Button
            title="Skip"
            onPress={handleSkip}
            variant="ghost"
            style={styles.skipButton}
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
  skipButton: {
    marginTop: spacing.sm,
  },
});
