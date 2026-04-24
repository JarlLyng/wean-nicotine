/**
 * Edit Plan screen
 *
 * Lets users adjust their taper plan after onboarding without losing
 * historical logs. Saving resets startDate to today so the new plan
 * starts fresh from the user's current baseline.
 *
 * For "I want to throw everything away and restart", use Start Over
 * instead (separate flow that wipes all data).
 */

import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useDesignTokens } from '@/lib/design';
import { captureError } from '@/lib/sentry';
import { getTaperSettings, saveTaperSettings } from '@/lib/db-settings';
import { saveUserPlan } from '@/lib/db-user-plan';
import { calculateDailyAllowance } from '@/lib/taper-plan';
import { spacing, borderRadius, typography, fontWeights } from '@/lib/theme';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

const REDUCTION_PRESETS = [
  { value: 3, label: '3%', description: 'Gentle' },
  { value: 5, label: '5%', description: 'Default' },
  { value: 7, label: '7%', description: 'Moderate' },
  { value: 10, label: '10%', description: 'Faster' },
  { value: 15, label: '15%', description: 'Aggressive' },
];

export default function EditPlanScreen() {
  const { colors } = useDesignTokens();
  const router = useRouter();
  const s = useMemo(() => createStyles(colors), [colors]);

  const [baseline, setBaseline] = useState('');
  const [reductionPercent, setReductionPercent] = useState(5);
  const [pricePerCan, setPricePerCan] = useState('');
  const [currency, setCurrency] = useState<'DKK' | 'SEK' | 'NOK' | 'EUR' | 'USD'>('DKK');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getTaperSettings();
        if (settings) {
          setBaseline(String(settings.baselinePouchesPerDay));
          setReductionPercent(settings.weeklyReductionPercent);
          if (settings.pricePerCan != null) {
            // Convert minor units back to whole units (e.g. 5000 cents → "50")
            setPricePerCan(String(Math.round(settings.pricePerCan / 100)));
          }
          if (settings.currency) setCurrency(settings.currency);
        }
      } catch (err) {
        if (err instanceof Error) captureError(err, { context: 'edit_plan_load' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    const baselineNum = parseInt(baseline, 10);
    if (!baseline || isNaN(baselineNum) || baselineNum < 1 || baselineNum > 100) {
      setError('Baseline must be a number between 1 and 100');
      return;
    }

    let priceCents: number | undefined;
    if (pricePerCan.trim()) {
      const priceNum = parseFloat(pricePerCan);
      if (isNaN(priceNum) || priceNum < 0) {
        setError('Price must be a valid positive number');
        return;
      }
      priceCents = Math.round(priceNum * 100);
    }

    setError('');
    setIsSaving(true);

    try {
      const existing = await getTaperSettings();
      // Reset startDate to today so the new plan starts fresh from the current baseline.
      // Historical logs are preserved, but the taper math restarts.
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await saveTaperSettings({
        baselinePouchesPerDay: baselineNum,
        weeklyReductionPercent: reductionPercent,
        startDate: today.getTime(),
        pricePerCan: priceCents,
        currency,
        triggers: existing?.triggers,
      });

      // Recalculate the user plan so the Today screen reflects the new baseline immediately
      const updated = await getTaperSettings();
      if (updated) {
        const allowance = calculateDailyAllowance(updated, today);
        await saveUserPlan(
          {
            settingsId: updated.id,
            currentDailyAllowance: allowance,
            lastCalculatedDate: Date.now(),
          },
          true,
        );
      }

      router.back();
    } catch (err) {
      if (err instanceof Error) captureError(err, { context: 'edit_plan_save' });
      Alert.alert('Could not save', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={s.content} />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={s.content}>
            <Text style={s.intro}>
              Change your plan without losing past logs. The new plan starts today.
            </Text>

            {/* Baseline */}
            <Card variant="elevated" style={s.card} padding="lg">
              <Text style={s.cardTitle}>Daily baseline</Text>
              <Text style={s.cardHint}>How many pouches you use per day right now.</Text>
              <TextInput
                style={s.input}
                value={baseline}
                onChangeText={(t) => {
                  setBaseline(t);
                  setError('');
                }}
                placeholder="0"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={3}
                accessibilityLabel="Daily baseline pouches"
              />
              <Text style={s.inputUnit}>pouches per day</Text>
            </Card>

            {/* Weekly reduction */}
            <Card variant="elevated" style={s.card} padding="lg">
              <Text style={s.cardTitle}>Weekly reduction</Text>
              <Text style={s.cardHint}>
                How much to lower your allowance each week. Default is 5% — gentle enough that your body adjusts without severe withdrawal.
              </Text>
              <View style={s.presetRow}>
                {REDUCTION_PRESETS.map((preset) => {
                  const isSelected = preset.value === reductionPercent;
                  return (
                    <Pressable
                      key={preset.value}
                      onPress={() => setReductionPercent(preset.value)}
                      style={[s.preset, isSelected && s.presetSelected]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`${preset.label} weekly reduction — ${preset.description}`}
                    >
                      <Text style={[s.presetLabel, isSelected && s.presetLabelSelected]}>
                        {preset.label}
                      </Text>
                      <Text style={[s.presetDescription, isSelected && s.presetDescriptionSelected]}>
                        {preset.description}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            {/* Optional price */}
            <Card variant="elevated" style={s.card} padding="lg">
              <Text style={s.cardTitle}>Price per can (optional)</Text>
              <Text style={s.cardHint}>
                Wean Nicotine calculates how much money you save over time. Leave blank to skip.
              </Text>
              <View style={s.priceRow}>
                <TextInput
                  style={s.input}
                  value={pricePerCan}
                  onChangeText={(t) => {
                    setPricePerCan(t);
                    setError('');
                  }}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  accessibilityLabel="Price per can"
                />
                <View style={s.currencyRow}>
                  {(['DKK', 'SEK', 'NOK', 'EUR', 'USD'] as const).map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setCurrency(c)}
                      style={[s.currency, currency === c && s.currencySelected]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: currency === c }}
                    >
                      <Text style={[s.currencyLabel, currency === c && s.currencyLabelSelected]}>{c}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </Card>

            {error ? <Text style={s.error}>{error}</Text> : null}

            <View style={s.actions}>
              <Button
                title="Save plan"
                onPress={handleSave}
                disabled={isSaving}
                loading={isSaving}
                variant="primary"
              />
              <Button title="Cancel" onPress={() => router.back()} variant="ghost" />
            </View>
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
      flex: 1,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      gap: spacing.md,
    } as ViewStyle,
    intro: {
      ...typography.body,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    } as TextStyle,
    card: {
      gap: spacing.md,
    } as ViewStyle,
    cardTitle: {
      ...typography.lg,
      fontWeight: '700',
      color: colors.text.primary,
    } as TextStyle,
    cardHint: {
      ...typography.caption,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    } as TextStyle,
    input: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: fontWeights.bold,
      color: colors.text.primary,
      textAlign: 'center',
      width: '100%',
      paddingVertical: spacing.md,
      borderBottomWidth: 2,
      borderBottomColor: colors.border.subtle,
      backgroundColor: 'transparent',
    } as TextStyle,
    inputUnit: {
      ...typography.caption,
      color: colors.text.tertiary,
      marginTop: spacing.xs,
      textAlign: 'center',
    } as TextStyle,
    presetRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    } as ViewStyle,
    preset: {
      flex: 1,
      minWidth: 72,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      backgroundColor: colors.background.card,
      alignItems: 'center',
    } as ViewStyle,
    presetSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '14',
    } as ViewStyle,
    presetLabel: {
      ...typography.body,
      fontWeight: '700',
      color: colors.text.primary,
    } as TextStyle,
    presetLabelSelected: {
      color: colors.primary,
    } as TextStyle,
    presetDescription: {
      ...typography.caption,
      color: colors.text.tertiary,
      marginTop: 2,
    } as TextStyle,
    presetDescriptionSelected: {
      color: colors.primary,
    } as TextStyle,
    priceRow: {
      gap: spacing.md,
    } as ViewStyle,
    currencyRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    } as ViewStyle,
    currency: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    } as ViewStyle,
    currencySelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '14',
    } as ViewStyle,
    currencyLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.text.secondary,
    } as TextStyle,
    currencyLabelSelected: {
      color: colors.primary,
    } as TextStyle,
    error: {
      ...typography.caption,
      color: colors.error,
      marginTop: spacing.sm,
    } as TextStyle,
    actions: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    } as ViewStyle,
  });
