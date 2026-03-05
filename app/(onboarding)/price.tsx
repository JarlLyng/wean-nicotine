import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDesignTokens, getColors } from '@/lib/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { borderRadius, spacing, typography } from '@/lib/theme';
import type { CurrencyCode } from '@/lib/currency';
import { CURRENCY_OPTIONS } from '@/lib/currency';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

export default function PriceScreen() {
  const { colors } = useDesignTokens();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;
  
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('DKK');
  const [error, setError] = useState('');
  const priceStyles = useMemo(
    () => createPriceStyles(getColors(colorScheme === 'dark' ? 'dark' : 'light')),
    [colorScheme]
  );

  const handleNext = () => {
    const normalizedPrice = price.replace(',', '.');
    if (price && price.trim() !== '') {
      const value = parseFloat(normalizedPrice);
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
        price: normalizedPrice || '0',
        currency,
      },
    });
  };


  return (
    <Screen title="Price Per Can">
      <ScrollView
        contentContainerStyle={priceStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View style={priceStyles.content}>
          <Card variant="flat" style={priceStyles.card} padding="lg">
            <Text style={priceStyles.description}>
              If you&apos;d like to track money saved, enter the price you pay per can.
            </Text>
            <Text style={priceStyles.hint}>
              This is optional — leave it blank if you don&apos;t want to track money saved.
            </Text>

            <View style={priceStyles.currencyContainer}>
              <Text style={priceStyles.currencyLabel}>Currency</Text>
              <View style={priceStyles.currencyGrid}>
                {CURRENCY_OPTIONS.map((option) => {
                  const isSelected = currency === option.code;
                  return (
                    <TouchableOpacity
                      key={option.code}
                      style={[
                        priceStyles.currencyPill,
                        isSelected && priceStyles.currencyPillSelected,
                      ]}
                      onPress={() => setCurrency(option.code)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${option.label}`}>
                      <Text
                        style={[
                          priceStyles.currencyPillText,
                          isSelected && priceStyles.currencyPillTextSelected,
                        ]}>
                        {option.code}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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
                blurOnSubmit
                returnKeyType="done"
                onSubmitEditing={handleNext}
                accessibilityLabel={`Price per can (${currency})`}
                accessibilityHint="Optional. Leave blank if you don't want to track money saved."
              />
              <Text style={priceStyles.inputLabel}>price per can ({currency})</Text>
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
    currencyContainer: {
      marginBottom: spacing.lg,
    } as ViewStyle,
    currencyLabel: {
      ...typography.caption,
      color: colors.text.secondary,
      textAlign: 'center' as const,
      marginBottom: spacing.sm,
      fontWeight: '600' as const,
    } as TextStyle,
    currencyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.xs,
    } as ViewStyle,
    currencyPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 2,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.default,
      minWidth: 64,
      alignItems: 'center',
    } as ViewStyle,
    currencyPillSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    } as ViewStyle,
    currencyPillText: {
      ...typography.body,
      color: colors.text.primary,
      fontWeight: '600' as const,
    } as TextStyle,
    currencyPillTextSelected: {
      color: colors.onPrimary,
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
