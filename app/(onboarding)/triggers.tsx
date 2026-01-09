import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing, colors } from '@/lib/theme';
import { saveTaperSettings, getTaperSettings } from '@/lib/db-settings';
import { saveUserPlan, getUserPlan } from '@/lib/db-user-plan';
import { generateDefaultTaperPlan, calculateDailyAllowance } from '@/lib/taper-plan';

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
  const router = useRouter();
  const params = useLocalSearchParams();
  const baseline = params.baseline ? parseInt(params.baseline as string, 10) : 10;
  const price = params.price ? parseFloat(params.price as string) : 0;

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
      // Ensure we start fresh - delete any existing settings first
      // This handles the case where user did "Start Over" and is re-doing onboarding
      console.log('Onboarding complete: Deleting any existing data...');
      const { deleteTaperSettings } = await import('@/lib/db-settings');
      const { deleteUserPlan } = await import('@/lib/db-user-plan');
      
      // Delete in sequence to ensure clean state
      await deleteTaperSettings();
      await deleteUserPlan();
      
      // Verify deletion
      const checkSettings = await getTaperSettings();
      const checkPlan = await getUserPlan();
      if (checkSettings || checkPlan) {
        console.warn('Warning: Data not fully deleted before creating new', { checkSettings, checkPlan });
      } else {
        console.log('Onboarding complete: Data successfully deleted');
      }

      // Save taper settings (force create new since we just deleted)
      console.log('Onboarding complete: Saving new taper settings...', { baseline, price });
      const settings = generateDefaultTaperPlan(baseline, 5);
      const settingsId = await saveTaperSettings({
        ...settings,
        pricePerCan: price > 0 ? Math.round(price * 100) : undefined, // Convert to cents
      }, true); // forceCreate = true to ensure we create new instead of updating
      console.log('Onboarding complete: Settings saved with ID:', settingsId);

      // Calculate initial daily allowance using the saved settings
      const savedSettings = await getTaperSettings();
      if (!savedSettings) {
        throw new Error('Failed to retrieve saved settings');
      }
      console.log('Onboarding complete: Retrieved saved settings:', savedSettings);

      const dailyAllowance = calculateDailyAllowance(savedSettings, new Date());
      console.log('Onboarding complete: Calculated daily allowance:', dailyAllowance);

      // Save user plan (force create new since we just deleted)
      console.log('Onboarding complete: Saving user plan...');
      await saveUserPlan({
        settingsId,
        currentDailyAllowance: dailyAllowance,
        lastCalculatedDate: Date.now(),
      }, true); // forceCreate = true to ensure we create new instead of updating

      // Verify data was saved correctly before navigating
      const verifyPlan = await getUserPlan();
      const verifySettings = await getTaperSettings();
      
      console.log('Onboarding complete: Verifying saved data...', { verifyPlan, verifySettings });
      
      if (!verifyPlan || !verifySettings) {
        console.error('ERROR: Failed to verify saved data!', { verifyPlan, verifySettings });
        throw new Error('Failed to verify saved data');
      }
      
      console.log('Onboarding complete: Data verified successfully. Navigating to home...');

      // Small delay to ensure database writes are complete
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate to home - use replace to ensure clean navigation
      // Use push instead of replace to ensure focus event fires
      router.push('/(tabs)/home');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Something went wrong. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Common Triggers (Optional)</Text>
          <Text style={styles.description}>
            Select situations where you typically use snus. This helps us understand your patterns.
          </Text>
          <Text style={styles.hint}>
            You can skip this and add triggers later.
          </Text>

          <View style={styles.triggersContainer}>
            {TRIGGERS.map((trigger) => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.triggerButton,
                  selectedTriggers.includes(trigger) && styles.triggerButtonSelected,
                ]}
                onPress={() => toggleTrigger(trigger)}>
                <Text
                  style={[
                    styles.triggerText,
                    selectedTriggers.includes(trigger) && styles.triggerTextSelected,
                  ]}>
                  {trigger}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, isSaving && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={isSaving}>
            <Text style={styles.buttonText}>
              {isSaving ? 'Setting up...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 18,
    color: '#333',
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xl,
  },
  triggersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  triggerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  triggerButtonSelected: {
    borderColor: colors.accentStart,
    backgroundColor: colors.accentStart,
  },
  triggerText: {
    fontSize: 16,
    color: '#333',
  },
  triggerTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.accentStart,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
});
