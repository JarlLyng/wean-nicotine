import { useState, useMemo } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { spacing, typography, borderRadius } from '@/lib/theme';
import { useDesignTokens, getColors } from '@/lib/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { saveTaperSettings, getTaperSettings } from '@/lib/db-settings';
import { saveUserPlan, getUserPlan } from '@/lib/db-user-plan';
import { generateDefaultTaperPlan, calculateDailyAllowance } from '@/lib/taper-plan';
import type { CurrencyCode } from '@/lib/currency';

const TRIGGERS = [
  'Stress',
  'After meals',
  'With coffee',
  'Social situations',
  'Work breaks',
  'Evening relaxation',
  'Morning routine',
];

export default function TriggersScreen() {
  useDesignTokens(); // ensure tokens are loaded
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;
  const price = params.price ? parseFloat(params.price as string) : 0;
  const currency = (params.currency as CurrencyCode | undefined) ?? 'DKK';
  const devLog = (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  };
  const devWarn = (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  };

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const triggersStyles = useMemo(
    () => createTriggersStyles(getColors(colorScheme === 'dark' ? 'dark' : 'light')),
    [colorScheme]
  );

  const toggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // On web, just navigate to home (database doesn't work on web)
      if (Platform.OS === 'web') {
        devLog('Onboarding complete (web): Navigating to home (database not available on web)');
        await new Promise(resolve => setTimeout(resolve, 200));
        router.replace('/(tabs)/home');
        return;
      }

      // Ensure we start fresh (atomic reset; handles "Start Over" → re-do onboarding)
      devLog('Onboarding complete: Resetting any existing data...');
      const { resetAllData } = await import('@/lib/db');
      const { deleteAllAnalytics } = await import('@/lib/analytics');
      await resetAllData();
      await deleteAllAnalytics();

      const checkSettings = await getTaperSettings();
      const checkPlan = await getUserPlan();
      if (checkSettings || checkPlan) {
        devWarn('Warning: Data not fully deleted before creating new', { checkSettings, checkPlan });
      } else {
        devLog('Onboarding complete: Data successfully reset');
      }

      // Save taper settings (force create new since we just deleted)
      devLog('Onboarding complete: Saving new taper settings...', { baseline, price, triggers: selectedTriggers });
      const settings = generateDefaultTaperPlan(baseline, 5);
      const settingsId = await saveTaperSettings({
        ...settings,
        pricePerCan: price > 0 ? Math.round(price * 100) : undefined, // Convert to cents
        currency,
        triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined, // Save selected triggers
      }, true); // forceCreate = true to ensure we create new instead of updating
      devLog('Onboarding complete: Settings saved with ID:', settingsId);

      // Calculate initial daily allowance using the saved settings
      const savedSettings = await getTaperSettings();
      if (!savedSettings) {
        throw new Error('Failed to retrieve saved settings');
      }
      devLog('Onboarding complete: Retrieved saved settings:', savedSettings);

      const dailyAllowance = calculateDailyAllowance(savedSettings, new Date());
      devLog('Onboarding complete: Calculated daily allowance:', dailyAllowance);

      // Save user plan (force create new since we just deleted)
      devLog('Onboarding complete: Saving user plan...');
      await saveUserPlan({
        settingsId,
        currentDailyAllowance: dailyAllowance,
        lastCalculatedDate: Date.now(),
      }, true); // forceCreate = true to ensure we create new instead of updating

      // Verify data was saved correctly before navigating
      const verifyPlan = await getUserPlan();
      const verifySettings = await getTaperSettings();
      
      devLog('Onboarding complete: Verifying saved data...', { 
        verifyPlan: verifyPlan ? {
          id: verifyPlan.id,
          settingsId: verifyPlan.settingsId,
          currentDailyAllowance: verifyPlan.currentDailyAllowance,
          lastCalculatedDate: new Date(verifyPlan.lastCalculatedDate).toISOString(),
        } : null,
        verifySettings: verifySettings ? {
          id: verifySettings.id,
          baseline: verifySettings.baselinePouchesPerDay,
          startDate: new Date(verifySettings.startDate).toISOString(),
          updatedAt: new Date(verifySettings.updatedAt).toISOString(),
        } : null,
      });
      
      if (!verifyPlan || !verifySettings) {
        if (__DEV__) console.error('ERROR: Failed to verify saved data!', { verifyPlan, verifySettings });
        throw new Error('Failed to verify saved data');
      }
      
      // Calculate what the allowance should be
      const expectedAllowance = calculateDailyAllowance(verifySettings, new Date());
      devLog('Onboarding complete: Expected daily allowance:', expectedAllowance);
      devLog('Onboarding complete: Saved daily allowance:', verifyPlan.currentDailyAllowance);
      devLog('Onboarding complete: Settings updatedAt:', new Date(verifySettings.updatedAt).toISOString());
      devLog('Onboarding complete: Data verified successfully. Navigating to home...');

      // Small delay to ensure database writes are complete
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate directly to home - this replaces onboarding stack with tabs
      router.replace('/(tabs)/home');
    } catch (error) {
      if (__DEV__) console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen title="Common Triggers">
      <ScrollView
        contentContainerStyle={triggersStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none">
        <View style={triggersStyles.content}>
          <View style={triggersStyles.cardWrapper}>
            <Card variant="flat" style={triggersStyles.card} padding="lg">
            <Text style={triggersStyles.description}>
              Select situations where you typically use snus. This helps us understand your patterns.
            </Text>
            <Text style={triggersStyles.hint}>
              This is optional — you can skip this step if you want.
            </Text>

            <View style={triggersStyles.triggersContainer}>
              {TRIGGERS.map((trigger) => (
                <TouchableOpacity
                  key={trigger}
                  style={[
                    triggersStyles.triggerButton,
                    selectedTriggers.includes(trigger) && triggersStyles.triggerButtonSelected,
                  ]}
                  onPress={() => toggleTrigger(trigger)}
                  accessibilityRole="button"
                  accessibilityLabel={trigger}
                  accessibilityHint="Toggles this trigger on or off."
                  accessibilityState={{ selected: selectedTriggers.includes(trigger) }}>
                  <Text
                    style={[
                      triggersStyles.triggerText,
                      selectedTriggers.includes(trigger) && triggersStyles.triggerTextSelected,
                    ]}>
                    {trigger}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
          </View>

          <Button
            title={isSaving ? 'Setting up...' : 'Complete Setup'}
            onPress={handleComplete}
            disabled={isSaving}
            loading={isSaving}
            style={triggersStyles.button}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const createTriggersStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
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
    cardWrapper: {
      marginBottom: spacing.lg,
    } as ViewStyle,
    card: {
      marginBottom: 0,
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
    triggersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    } as ViewStyle,
    triggerButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.full,
      borderWidth: 2,
      borderColor: colors.border.subtle,
      backgroundColor: colors.surface.default,
    } as ViewStyle,
    triggerButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    } as ViewStyle,
    triggerText: {
      ...typography.body,
      color: colors.text.primary,
    } as TextStyle,
    triggerTextSelected: {
      color: colors.onPrimary,
      fontWeight: '600' as const,
    } as TextStyle,
    button: {
      marginTop: spacing.md,
    } as ViewStyle,
  };
  return StyleSheet.create(styles);
};
