import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing, colors } from '@/lib/theme';
import { getTaperSettings } from '@/lib/db-settings';
import type { TaperSettings } from '@/lib/models';
import {
  requestNotificationPermissions,
  scheduleDailyCheckIn,
  cancelDailyCheckIn,
  getAllScheduledNotifications,
} from '@/lib/notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<TaperSettings | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [dailyCheckInEnabled, setDailyCheckInEnabled] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  const loadData = async () => {
    try {
      const currentSettings = await getTaperSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadNotificationStatus = async () => {
    try {
      const permission = await requestNotificationPermissions();
      setHasPermission(permission);

      const notifications = await getAllScheduledNotifications();
      const hasDailyCheckIn = notifications.some(
        (n) => n.content.data?.type === 'daily_checkin'
      );
      setDailyCheckInEnabled(hasDailyCheckIn);
    } catch (error) {
      console.error('Error loading notification status:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadData();
    loadNotificationStatus();
  }, []);

  const handleToggleDailyCheckIn = async (enabled: boolean) => {
    if (!hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Notifications are needed to send daily check-ins. Please enable them in your device settings.'
        );
        return;
      }
      setHasPermission(true);
    }

    try {
      if (enabled) {
        const id = await scheduleDailyCheckIn(20, 0); // Default to 8 PM
        if (id) {
          setDailyCheckInEnabled(true);
          Alert.alert('Success', 'Daily check-in notification enabled');
        } else {
          Alert.alert('Error', 'Failed to enable daily check-in');
        }
      } else {
        await cancelDailyCheckIn();
        setDailyCheckInEnabled(false);
        Alert.alert('Success', 'Daily check-in notification disabled');
      }
    } catch (error) {
      console.error('Error toggling daily check-in:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>

          {/* Reset Taper Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Taper Plan</Text>
            <Text style={styles.sectionDescription}>
              If you've had a setback or want to start fresh, you can reset your taper plan.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => router.push('/(tabs)/settings/reset-taper')}>
              <Text style={styles.resetButtonText}>Reset Taper Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Daily Check-In Notification</Text>
                <Text style={styles.sectionDescription}>
                  Receive a gentle reminder each day at 8 PM to log your progress
                </Text>
              </View>
              {!isLoadingNotifications && (
                <Switch
                  value={dailyCheckInEnabled && hasPermission}
                  onValueChange={handleToggleDailyCheckIn}
                  disabled={!hasPermission}
                />
              )}
            </View>
            {!hasPermission && (
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={async () => {
                  const granted = await requestNotificationPermissions();
                  setHasPermission(granted);
                  if (!granted) {
                    Alert.alert(
                      'Permission Required',
                      'Please enable notifications in your device settings to use this feature.'
                    );
                  }
                }}>
                <Text style={styles.permissionButtonText}>Enable Notifications</Text>
              </TouchableOpacity>
            )}
            {dailyCheckInEnabled && hasPermission && (
              <Text style={styles.notificationInfo}>Scheduled for 20:00 daily</Text>
            )}
          </View>

          {/* Current Settings Info */}
          {settings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Settings</Text>
              <Text style={styles.info}>Baseline: {settings.baselinePouchesPerDay} pouches/day</Text>
              <Text style={styles.info}>
                Weekly Reduction: {settings.weeklyReductionPercent}%
              </Text>
              {settings.pricePerCan && (
                <Text style={styles.info}>
                  Price per can: ${(settings.pricePerCan / 100).toFixed(2)}
                </Text>
              )}
            </View>
          )}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionHeaderText: {
    flex: 1,
    marginRight: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: colors.accentStart,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  permissionButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  notificationInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  info: {
    fontSize: 14,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  resetButton: {
    backgroundColor: colors.semantic.error.main,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resetButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  settingsButton: {
    backgroundColor: colors.accentStart,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  settingsButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
