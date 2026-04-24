import { useState, useMemo } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { spacing, borderRadius } from '@/lib/theme';
import { useDesignTokens, getColors, typography } from '@/lib/design';
import { captureError } from '@/lib/sentry';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { saveTaperSettings, getTaperSettings } from '@/lib/db-settings';
import { saveUserPlan, getUserPlan } from '@/lib/db-user-plan';
import { generateDefaultTaperPlan, calculateDailyAllowance } from '@/lib/taper-plan';
import type { CurrencyCode } from '@/lib/currency';

const TRIGGERS: { label: string; icon: 'brain' | 'heart' | 'wind' | 'waves' | 'gear' | 'star' | 'calendar' }[] = [
  { label: 'Stress', icon: 'brain' },
  { label: 'After meals', icon: 'calendar' },
  { label: 'With coffee', icon: 'heart' },
  { label: 'Social situations', icon: 'waves' },
  { label: 'Work breaks', icon: 'gear' },
  { label: 'Evening relaxation', icon: 'wind' },
  { label: 'Morning routine', icon: 'star' },
];

export default function TriggersScreen() {
  useDesignTokens();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;
  const pace = params.pace ? parseInt(params.pace as string, 10) : 5;
  const price = params.price ? parseFloat(params.price as string) : 0;
  const currency = (params.currency as CurrencyCode | undefined) ?? 'DKK';
  const devLog = (...args: unknown[]) => { if (__DEV__) console.log(...args); };
  const devWarn = (...args: unknown[]) => { if (__DEV__) console.warn(...args); };

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const s = useMemo(
    () => createStyles(getColors(colorScheme === 'dark' ? 'dark' : 'light')),
    [colorScheme]
  );

  const toggleTrigger = (trigger: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      if (Platform.OS === 'web') {
        devLog('Onboarding complete (web)');
        await new Promise(resolve => setTimeout(resolve, 200));
        router.replace('/(tabs)/home');
        return;
      }

      devLog('Onboarding complete: Resetting any existing data...');
      const { resetAllData } = await import('@/lib/db');
      const { deleteAllAnalytics } = await import('@/lib/analytics');
      await resetAllData();
      await deleteAllAnalytics();

      const checkSettings = await getTaperSettings();
      const checkPlan = await getUserPlan();
      if (checkSettings || checkPlan) {
        devWarn('Warning: Data not fully deleted before creating new', { checkSettings, checkPlan });
      }

      devLog('Onboarding complete: Saving new taper settings...', { baseline, pace, price, triggers: selectedTriggers });
      const settings = generateDefaultTaperPlan(baseline, pace);
      const settingsId = await saveTaperSettings({
        ...settings,
        pricePerCan: price > 0 ? Math.round(price * 100) : undefined,
        currency,
        triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
      }, true);

      const savedSettings = await getTaperSettings();
      if (!savedSettings) throw new Error('Failed to retrieve saved settings');

      const dailyAllowance = calculateDailyAllowance(savedSettings, new Date());
      await saveUserPlan({
        settingsId,
        currentDailyAllowance: dailyAllowance,
        lastCalculatedDate: Date.now(),
      }, true);

      const verifyPlan = await getUserPlan();
      const verifySettings = await getTaperSettings();
      if (!verifyPlan || !verifySettings) {
        throw new Error('Failed to verify saved data');
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      router.replace('/(tabs)/home');
    } catch (error) {
      if (__DEV__) console.error('Error completing onboarding:', error);
      if (error instanceof Error) captureError(error, { context: 'onboarding_complete', baseline, price, currency });
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={s.content}>
          {/* Question */}
          <View style={s.questionSection}>
            <Text style={s.question}>
              When do you usually reach for snus?
            </Text>
            <Text style={s.hint}>
              Optional — helps us personalise reminders for you.
            </Text>
          </View>

          {/* Trigger chips */}
          <View style={s.triggersGrid}>
            {TRIGGERS.map((trigger) => {
              const isSelected = selectedTriggers.includes(trigger.label);
              return (
                <TouchableOpacity
                  key={trigger.label}
                  style={[s.triggerChip, isSelected && s.triggerChipSelected]}
                  onPress={() => toggleTrigger(trigger.label)}
                  disabled={isSaving}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={trigger.label}
                  accessibilityState={{ selected: isSelected }}>
                  <Icon
                    name={trigger.icon}
                    size={18}
                    color={isSelected ? String(s.triggerTextSelected.color) : String(s.triggerText.color)}
                    weight={isSelected ? 'fill' : 'regular'}
                  />
                  <Text style={[s.triggerText, isSelected && s.triggerTextSelected]}>
                    {trigger.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selection count */}
          {selectedTriggers.length > 0 && (
            <Text style={s.selectionCount}>
              {selectedTriggers.length} selected
            </Text>
          )}

          {/* Spacer */}
          <View style={s.spacer} />

          <Button
            title={isSaving ? 'Setting up...' : 'Complete Setup'}
            onPress={handleComplete}
            disabled={isSaving}
            loading={isSaving}
            style={s.button}
          />
          {selectedTriggers.length === 0 && (
            <TouchableOpacity onPress={handleComplete} disabled={isSaving} style={s.skipButton}>
              <Text style={s.skipText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
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

    // Triggers
    triggersGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    } as ViewStyle,
    triggerChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderRadius: borderRadius.full,
      borderWidth: 1.5,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.default,
    } as ViewStyle,
    triggerChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    } as ViewStyle,
    triggerText: {
      fontSize: typography.sizes.sm,
      fontWeight: `${typography.weights.regular}` as const,
      color: colors.text.primary,
    } as TextStyle,
    triggerTextSelected: {
      color: colors.onPrimary,
      fontWeight: `${typography.weights.semibold}` as const,
    } as TextStyle,
    selectionCount: {
      fontSize: typography.sizes.xs,
      color: colors.text.tertiary,
      marginBottom: spacing.md,
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
