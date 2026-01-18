import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, TextStyle, ViewStyle } from 'react-native';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import {
  requestNotificationPermissions,
  scheduleDailyCheckIn,
  cancelDailyCheckIn,
  getAllScheduledNotifications,
} from '@/lib/notifications';

export default function NotificationsScreen() {
  const { colors } = useDesignTokens();
  const styles = createStyles(colors);
  const [hasPermission, setHasPermission] = useState(false);
  const [dailyCheckInEnabled, setDailyCheckInEnabled] = useState(false);
  const [checkInHour] = useState(20);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotificationStatus();
  }, []);

  const loadNotificationStatus = async () => {
    try {
      // Only check permission status, don't request it
      const { getPermissionsAsync } = await import('expo-notifications');
      const { status } = await getPermissionsAsync();
      setHasPermission(status === 'granted');

      const notifications = await getAllScheduledNotifications();
      const hasDailyCheckIn = notifications.some(
        (n) => n.content.data?.type === 'daily_checkin'
      );
      setDailyCheckInEnabled(hasDailyCheckIn);
    } catch (error) {
      console.error('Error loading notification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        const id = await scheduleDailyCheckIn(checkInHour, 0);
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

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            Choose when and how you&apos;d like to receive gentle reminders and check-ins.
          </Text>

          {/* Daily Check-In */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Daily Check-In</Text>
                <Text style={styles.sectionDescription}>
                  Receive a gentle reminder each day to log your progress
                </Text>
              </View>
              <Switch
                value={dailyCheckInEnabled && hasPermission}
                onValueChange={handleToggleDailyCheckIn}
                trackColor={{ false: colors.border.subtle, true: colors.primary }}
                thumbColor={colors.surface.default}
              />
            </View>

            {dailyCheckInEnabled && hasPermission && (
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>Scheduled for {checkInHour}:00 daily</Text>
              </View>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Notifications are designed to be helpful, not annoying. You can turn them off anytime.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
  const styles = {
    scrollContent: {
      flexGrow: 1,
    } as ViewStyle,
    content: {
      flex: 1,
      padding: spacing.md,
    } as ViewStyle,
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    title: {
      fontSize: 32,
      fontWeight: '700' as const,
      marginBottom: spacing.sm,
      color: colors.text.primary,
    } as TextStyle,
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: spacing.xl,
      lineHeight: 24,
    } as TextStyle,
    section: {
      backgroundColor: colors.background.muted,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    } as ViewStyle,
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    } as ViewStyle,
    sectionHeaderText: {
      flex: 1,
      marginRight: spacing.md,
    } as ViewStyle,
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    } as TextStyle,
    sectionDescription: {
      fontSize: 14,
      color: colors.text.secondary,
      lineHeight: 20,
    } as TextStyle,
    timeInfo: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
    } as ViewStyle,
    timeText: {
      fontSize: 14,
      color: colors.text.secondary,
    } as TextStyle,
    infoBox: {
      backgroundColor: colors.background.card,
      borderRadius: 8,
      padding: spacing.md,
      marginTop: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border.subtle,
      borderLeftWidth: 2,
      borderLeftColor: colors.shared.success,
    } as ViewStyle,
    infoText: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
      textAlign: 'center' as const,
    } as TextStyle,
  };

  return StyleSheet.create(styles);
};
