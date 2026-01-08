import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { saveTaperSettings } from '@/lib/db-settings';
import { saveUserPlan } from '@/lib/db-user-plan';
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
      // Save taper settings
      const settings = generateDefaultTaperPlan(baseline, 5);
      const settingsId = await saveTaperSettings({
        ...settings,
        pricePerCan: price > 0 ? Math.round(price * 100) : undefined, // Convert to cents
      });

      // Calculate initial daily allowance
      const dailyAllowance = calculateDailyAllowance({
        id: settingsId,
        baselinePouchesPerDay: baseline,
        weeklyReductionPercent: 5,
        startDate: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Save user plan
      await saveUserPlan({
        settingsId,
        currentDailyAllowance: dailyAllowance,
        lastCalculatedDate: Date.now(),
      });

      // Navigate to home
      router.replace('/(home)');
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
    borderColor: '#0a7ea4',
    backgroundColor: '#0a7ea4',
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
    backgroundColor: '#0a7ea4',
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
