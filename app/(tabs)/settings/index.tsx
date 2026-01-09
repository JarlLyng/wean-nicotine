import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { spacing, colors, typography, borderRadius } from '@/lib/theme';
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
    <Screen variant="gradient" title="Settings">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Reset Taper Section */}
          <Card variant="elevated" style={styles.section} padding="lg">
            <View style={styles.sectionTitleRow}>
              <Icon name="arrow-clockwise" size={24} color={colors.textPrimary} weight="regular" />
              <Text style={styles.sectionTitle}>Taper Plan</Text>
            </View>
            <Text style={styles.sectionDescription}>
              If you've had a setback or want to start fresh, you can reset your taper plan.
            </Text>
            <Button
              title="Reset Taper Plan"
              onPress={() => router.push('/(tabs)/settings/reset-taper')}
              variant="secondary"
              style={[styles.resetButton, { borderColor: colors.semantic.error.main }]}
              textStyle={{ color: colors.semantic.error.main }}
            />
          </Card>

          {/* Notifications Section */}
          <Card variant="elevated" style={styles.section} padding="lg">
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <View style={styles.sectionTitleRow}>
                  <Icon 
                    name={dailyCheckInEnabled && hasPermission ? "bell" : "bell-slash"} 
                    size={24} 
                    color={colors.textPrimary} 
                    weight="regular" 
                  />
                  <Text style={styles.sectionTitle}>Daily Check-In Notification</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Receive a gentle reminder each day at 8 PM to log your progress
                </Text>
              </View>
              {!isLoadingNotifications && (
                <Switch
                  value={dailyCheckInEnabled && hasPermission}
                  onValueChange={handleToggleDailyCheckIn}
                  disabled={!hasPermission}
                  trackColor={{ false: colors.neutral[300], true: colors.accentStart }}
                  thumbColor={colors.surface}
                />
              )}
            </View>
            {!hasPermission && (
              <Button
                title="Enable Notifications"
                onPress={async () => {
                  const granted = await requestNotificationPermissions();
                  setHasPermission(granted);
                  if (!granted) {
                    Alert.alert(
                      'Permission Required',
                      'Please enable notifications in your device settings to use this feature.'
                    );
                  }
                }}
                variant="primary"
                style={styles.permissionButton}
              />
            )}
            {dailyCheckInEnabled && hasPermission && (
              <Text style={styles.notificationInfo}>Scheduled for 20:00 daily</Text>
            )}
          </Card>

          {/* Current Settings Info */}
          {settings && (
            <Card variant="elevated" style={styles.section} padding="lg">
              <View style={styles.sectionTitleRow}>
                <Icon name="gear" size={24} color={colors.textPrimary} weight="regular" />
                <Text style={styles.sectionTitle}>Current Settings</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="calendar" size={20} color={colors.textSecondary} weight="regular" />
                <Text style={styles.info}>Baseline: {settings.baselinePouchesPerDay} pouches/day</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="chart-line-up" size={20} color={colors.textSecondary} weight="regular" />
                <Text style={styles.info}>
                  Weekly Reduction: {settings.weeklyReductionPercent}%
                </Text>
              </View>
              {settings.pricePerCan && (
                <View style={styles.infoRow}>
                  <Icon name="currency-dollar" size={20} color={colors.textSecondary} weight="regular" />
                  <Text style={styles.info}>
                    Price per can: ${(settings.pricePerCan / 100).toFixed(2)}
                  </Text>
                </View>
              )}
            </Card>
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
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
    marginRight: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.xl,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  permissionButton: {
    marginTop: spacing.md,
  },
  notificationInfo: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  info: {
    ...typography.caption,
    marginBottom: spacing.xs,
    color: colors.textPrimary,
  },
  resetButton: {
    marginTop: spacing.sm,
  },
});
