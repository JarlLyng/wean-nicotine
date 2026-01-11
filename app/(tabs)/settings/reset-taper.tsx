import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { getTaperSettings, saveTaperSettings, deleteTaperSettings } from '@/lib/db-settings';
import { saveUserPlan, deleteUserPlan } from '@/lib/db-user-plan';
import { calculateDailyAllowance } from '@/lib/taper-plan';

export default function ResetTaperScreen() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [isStartingOver, setIsStartingOver] = useState(false);

  const handleReset = async () => {
    Alert.alert(
      'Reset Taper Plan',
      'This will reset your taper plan to start fresh from today. Your progress history will be preserved. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              const currentSettings = await getTaperSettings();
              if (!currentSettings) {
                Alert.alert('Error', 'No settings found');
                return;
              }

              // Reset taper plan with same baseline but new start date
              // Preserve triggers when resetting (they're not part of the taper plan)
              const newSettings = {
                baselinePouchesPerDay: currentSettings.baselinePouchesPerDay,
                pricePerCan: currentSettings.pricePerCan,
                weeklyReductionPercent: currentSettings.weeklyReductionPercent,
                startDate: Date.now(),
                triggers: currentSettings.triggers, // Preserve triggers
              };

              const settingsId = await saveTaperSettings(newSettings);

              // Calculate new daily allowance
              const dailyAllowance = calculateDailyAllowance(
                {
                  ...newSettings,
                  id: settingsId,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                },
                new Date()
              );

              // Save new plan
              await saveUserPlan({
                settingsId,
                currentDailyAllowance: dailyAllowance,
                lastCalculatedDate: Date.now(),
              });

              Alert.alert('Success', 'Your taper plan has been reset. Starting fresh from today.', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error('Error resetting taper:', error);
              Alert.alert('Error', 'Failed to reset taper plan. Please try again.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleStartOver = async () => {
    Alert.alert(
      'Start Over',
      'This will delete all your settings and progress, and take you back to onboarding. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Over',
          style: 'destructive',
          onPress: async () => {
            setIsStartingOver(true);
            try {
              // Delete all settings, plans, and log entries
              console.log('Starting over: Deleting taper settings...');
              await deleteTaperSettings();
              console.log('Starting over: Deleting user plan...');
              await deleteUserPlan();
              console.log('Starting over: Deleting all log entries...');
              const { deleteAllLogEntries } = await import('@/lib/db-log-entries');
              await deleteAllLogEntries();
              
              // Verify deletion
              const { getTaperSettings } = await import('@/lib/db-settings');
              const { getUserPlan } = await import('@/lib/db-user-plan');
              const verifySettings = await getTaperSettings();
              const verifyPlan = await getUserPlan();
              
              if (verifySettings || verifyPlan) {
                console.error('ERROR: Data still exists after deletion!', { verifySettings, verifyPlan });
                Alert.alert('Warning', 'Some data may not have been cleared. Please try again.');
                setIsStartingOver(false);
                return;
              }
              
              console.log('Starting over: Data successfully deleted');

              Alert.alert('Success', 'All data has been cleared. Returning to onboarding.', [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace('/(onboarding)/welcome');
                  },
                },
              ]);
            } catch (error) {
              console.error('Error starting over:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
              setIsStartingOver(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Reset Taper Plan</Text>
          <Text style={styles.subtitle}>
            If you&apos;ve had a setback or want to start fresh, you can reset your taper plan.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What happens when you reset:</Text>
            <Text style={styles.infoText}>
              • Your taper plan starts fresh from today{'\n'}
              • Your baseline and reduction rate stay the same{'\n'}
              • All your progress history is preserved{'\n'}
              • You can continue tracking from this new starting point
            </Text>
          </View>

          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>
              Remember: setbacks are normal and part of the journey. Resetting isn&apos;t failure —
              it&apos;s giving yourself a fresh start.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, isResetting && styles.resetButtonDisabled]}
            onPress={handleReset}
            disabled={isResetting || isStartingOver}>
            <Text style={styles.resetButtonText}>
              {isResetting ? 'Resetting...' : 'Reset Taper Plan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.startOverButton, (isResetting || isStartingOver) && styles.startOverButtonDisabled]}
            onPress={handleStartOver}
            disabled={isResetting || isStartingOver}>
            <Text style={styles.startOverButtonText}>
              {isStartingOver ? 'Starting Over...' : 'Start Over (Go to Onboarding)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
            disabled={isResetting || isStartingOver}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  encouragementBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  encouragementText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#d32f2f',
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  startOverButton: {
    backgroundColor: '#ff6b6b',
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  startOverButtonDisabled: {
    opacity: 0.6,
  },
  startOverButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
