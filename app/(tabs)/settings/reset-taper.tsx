import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { deleteTaperSettings } from '@/lib/db-settings';
import { deleteUserPlan } from '@/lib/db-user-plan';
import { deleteAllPreferences } from '@/lib/db-preferences';
import { cancelAllNotifications } from '@/lib/notifications';

export default function ResetTaperScreen() {
  const router = useRouter();
  const { colors } = useDesignTokens();
  const styles = createStyles(colors);
  const [isStartingOver, setIsStartingOver] = useState(false);
  const devLog = (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  };

  const handleStartOver = async () => {
    Alert.alert(
      'Start Over',
      'This will delete ALL your data and take you back to onboarding. Are you sure?',
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
              // Cancel scheduled notifications (daily check-in, trigger reminders, etc.)
              devLog('Starting over: Canceling notifications...');
              await cancelAllNotifications();

              // Delete all settings, plans, and log entries
              devLog('Starting over: Deleting taper settings...');
              await deleteTaperSettings();
              devLog('Starting over: Deleting user plan...');
              await deleteUserPlan();
              devLog('Starting over: Deleting all log entries...');
              const { deleteAllLogEntries } = await import('@/lib/db-log-entries');
              await deleteAllLogEntries();
              devLog('Starting over: Deleting app preferences...');
              await deleteAllPreferences();
              
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
              
              devLog('Starting over: Data successfully deleted');

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Start Over</Text>
          <Text style={styles.subtitle}>
            This will permanently delete all your data and take you back to onboarding.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>What happens when you start over:</Text>
            <Text style={styles.infoText}>
              • Your taper settings are deleted{'\n'}
              • Your progress history (logs) is deleted{'\n'}
              • Your plan + allowance are deleted{'\n'}
              • Scheduled notifications are canceled{'\n'}
              • You&apos;ll return to onboarding
            </Text>
          </View>

          <View style={styles.encouragementBox}>
            <Text style={styles.encouragementText}>
              This is a full reset. If you&apos;re sure, tap Start Over below.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.startOverButton, isStartingOver && styles.startOverButtonDisabled]}
            onPress={handleStartOver}
            disabled={isStartingOver}
            accessibilityRole="button"
            accessibilityLabel="Start Over"
            accessibilityHint="Deletes all data and returns to onboarding."
            accessibilityState={{ disabled: isStartingOver }}>
            <Text style={styles.startOverButtonText}>
              {isStartingOver ? 'Starting Over...' : 'Start Over (Go to Onboarding)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
            disabled={isStartingOver}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Go back to settings."
            accessibilityState={{ disabled: isStartingOver }}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      padding: spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: spacing.sm,
      color: colors.text.primary,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: spacing.xl,
      lineHeight: 24,
    },
    infoBox: {
      backgroundColor: colors.background.muted,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    infoTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    infoText: {
      fontSize: 16,
      color: colors.text.secondary,
      lineHeight: 24,
    },
    encouragementBox: {
      backgroundColor: colors.background.muted,
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.xl,
    },
    encouragementText: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
      textAlign: 'center',
    },
    startOverButton: {
      backgroundColor: colors.shared.warning,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    startOverButtonDisabled: {
      opacity: 0.6,
    },
    startOverButtonText: {
      color: colors.onWarning,
      fontSize: 18,
      fontWeight: '600',
    },
    cancelButton: {
      padding: spacing.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.text.secondary,
      fontSize: 16,
    },
  });
