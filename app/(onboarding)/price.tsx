import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDesignTokens } from '@/lib/design';
import { borderRadius, spacing, typography } from '@/lib/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';

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

const createPriceStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
  const styles = {
    scrollContent: {
      flexGrow: 1,
    } as ViewStyle,
    content: {
      flex: 1,
      padding: spacing.md,
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
      color: colors.error,
      marginBottom: spacing.sm,
      textAlign: 'center' as const,
    } as TextStyle,
    button: {
      marginTop: spacing.md,
    } as ViewStyle,
  };
  return StyleSheet.create(styles);
};
