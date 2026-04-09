import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { useDesignTokens, getColors, typography } from '@/lib/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { borderRadius, spacing } from '@/lib/theme';
import type { CurrencyCode } from '@/lib/currency';
import { CURRENCY_OPTIONS } from '@/lib/currency';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

export default function PriceScreen() {
  const { colors } = useDesignTokens();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;

  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('DKK');
  const [error, setError] = useState('');
  const s = useMemo(
    () => createStyles(getColors(colorScheme === 'dark' ? 'dark' : 'light')),
    [colorScheme]
  );

  const handleNext = () => {
    const normalizedPrice = price.replace(',', '.');
    if (price && price.trim() !== '') {
      const value = parseFloat(normalizedPrice);
      if (isNaN(value) || value < 0) {
        setError('Enter a valid price');
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
                What do you pay per can?
              </Text>
              <Text style={s.hint}>
                Optional — lets us show how much money you save.
              </Text>
            </View>

            {/* Currency pills */}
            <View style={s.currencyRow}>
              {CURRENCY_OPTIONS.map((option) => {
                const isSelected = currency === option.code;
                return (
                  <TouchableOpacity
                    key={option.code}
                    style={[s.currencyPill, isSelected && s.currencyPillSelected]}
                    onPress={() => {
                      if (Platform.OS === 'ios') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      }
                      setCurrency(option.code);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${option.label}`}
                    accessibilityState={{ selected: isSelected }}>
                    <Text style={[s.currencyText, isSelected && s.currencyTextSelected]}>
                      {option.code}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Input */}
            <View style={s.inputSection}>
              <TextInput
                style={s.input}
                value={price}
                onChangeText={(text) => {
                  setPrice(text);
                  setError('');
                }}
                placeholder="0"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                accessibilityLabel={`Price per can (${currency})`}
                accessibilityHint="Optional. Leave blank to skip money tracking."
              />
              <Text style={s.inputLabel}>{currency} per can</Text>
              {error ? <Text style={s.error}>{error}</Text> : null}
            </View>

            {/* Spacer */}
            <View style={s.spacer} />

            <Button
              title="Continue"
              onPress={handleNext}
              style={s.button}
            />
            <TouchableOpacity onPress={handleNext} style={s.skipButton}>
              <Text style={s.skipText}>
              {"Skip — I don't want to track money"}
            </Text>
            </TouchableOpacity>
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
      marginBottom: spacing.xxl,
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

    // Currency
    currencyRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xxl,
    } as ViewStyle,
    currencyPill: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.default,
    } as ViewStyle,
    currencyPillSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    } as ViewStyle,
    currencyText: {
      fontSize: typography.sizes.sm,
      fontWeight: `${typography.weights.semibold}` as const,
      color: colors.text.primary,
    } as TextStyle,
    currencyTextSelected: {
      color: colors.onPrimary,
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
      marginBottom: spacing.sm,
    } as ViewStyle,
    skipButton: {
      paddingVertical: spacing.sm,
      alignItems: 'center',
    } as ViewStyle,
    skipText: {
      fontSize: typography.sizes.sm,
      color: colors.text.tertiary,
    } as TextStyle,
  });
