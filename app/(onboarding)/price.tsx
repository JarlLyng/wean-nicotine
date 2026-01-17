import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, typography, borderRadius } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

export default function PriceScreen() {
  const { colors } = useDesignTokens();
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;
  
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const priceStyles = createPriceStyles(colors);

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


  return (
    <Screen variant="gradient" title="Price Per Can">
      <ScrollView contentContainerStyle={priceStyles.scrollContent}>
        <View style={priceStyles.content}>
          <Card variant="flat" style={priceStyles.card} padding="lg">
            <Text style={priceStyles.description}>
              If you&apos;d like to track money saved, enter the price you pay per can.
            </Text>
            <Text style={priceStyles.hint}>
              This is optional — you can add it later in settings if needed.
            </Text>

            <View style={priceStyles.inputContainer}>
              <TextInput
                style={priceStyles.input}
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  setError('');
                }}
                placeholder="e.g., 50.00"
                placeholderTextColor={colors.text.secondary}
                keyboardType="decimal-pad"
              />
              <Text style={priceStyles.inputLabel}>price per can</Text>
            </View>

            {error ? <Text style={priceStyles.error}>{error}</Text> : null}
          </Card>

          <Button
            title="Continue"
            onPress={handleNext}
            style={priceStyles.button}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const createPriceStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
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
});
