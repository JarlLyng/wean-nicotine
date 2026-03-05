import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Pressable, TextStyle, ViewStyle } from 'react-native';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { getTaperSettings } from '@/lib/db-settings';
import { getPreference, setPreference } from '@/lib/db-preferences';
import {
  requestNotificationPermissions,
  scheduleDailyCheckIn,
  cancelDailyCheckIn,
  getAllScheduledNotifications,
  scheduleTriggerReminders,
  cancelTriggerReminders,
} from '@/lib/notifications';

const PREF_TRIGGER_REMINDERS_ENABLED = 'triggerRemindersEnabled';
const PREF_TRIGGER_REMINDERS_TIME = 'triggerRemindersTime'; // JSON: { hour: number, minute: number }

type ReminderTime = { hour: number; minute: number };

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(t: ReminderTime) {
  return `${pad2(t.hour)}:${pad2(t.minute)}`;
}

export default function NotificationsScreen() {
  const { colors } = useDesignTokens();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hasPermission, setHasPermission] = useState(false);
  const [dailyCheckInEnabled, setDailyCheckInEnabled] = useState(false);
  const [checkInHour] = useState(20);
  const [triggerRemindersEnabled, setTriggerRemindersEnabled] = useState(false);
  const [triggerReminderTime, setTriggerReminderTime] = useState<ReminderTime>({ hour: 20, minute: 0 });
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
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

      const settings = await getTaperSettings();
      const triggers = settings?.triggers ?? [];
      setSelectedTriggers(triggers);

      const notifications = await getAllScheduledNotifications();
      const hasDailyCheckIn = notifications.some(
        (n) => n.content.data?.type === 'daily_checkin'
      );
      setDailyCheckInEnabled(hasDailyCheckIn);

      const triggerReminder = notifications.find(
        (n) => n.content.data?.type === 'trigger_reminder'
      );
      const hasTriggerReminder = Boolean(triggerReminder);
      setTriggerRemindersEnabled(hasTriggerReminder);

      // Hydrate persisted config (fallback for UI + rescheduling)
      const storedEnabled = (await getPreference(PREF_TRIGGER_REMINDERS_ENABLED)) === '1';
      const storedTimeRaw = await getPreference(PREF_TRIGGER_REMINDERS_TIME);
      let storedTime: ReminderTime | null = null;
      if (storedTimeRaw) {
        try {
          const parsed = JSON.parse(storedTimeRaw) as Partial<ReminderTime>;
          if (typeof parsed.hour === 'number' && typeof parsed.minute === 'number') {
            storedTime = { hour: parsed.hour, minute: parsed.minute };
          }
        } catch {
          // ignore
        }
      }

      // Prefer scheduled time if available, otherwise use stored time, otherwise default.
      let scheduledTime: ReminderTime | null = null;
      if (triggerReminder && triggerReminder.trigger && typeof triggerReminder.trigger === 'object') {
        const t = triggerReminder.trigger as Record<string, unknown>;
        if (typeof t.hour === 'number' && typeof t.minute === 'number') {
          scheduledTime = { hour: t.hour, minute: t.minute };
        }
      }
      const effectiveTime = scheduledTime ?? storedTime ?? { hour: 20, minute: 0 };
      setTriggerReminderTime(effectiveTime);

      // Keep preference in sync with scheduled state
      if (hasTriggerReminder && !storedEnabled) {
        await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '1');
      }

      // If user wanted reminders on but nothing is scheduled, try to restore (native only)
      if (storedEnabled && !hasTriggerReminder && status === 'granted') {
        const id = await scheduleTriggerReminders(triggers, effectiveTime.hour, effectiveTime.minute);
        if (id) {
          setTriggerRemindersEnabled(true);
          await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '1');
        } else {
          // Fail gracefully (e.g., Expo Go). Keep UI consistent.
          await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '0');
          setTriggerRemindersEnabled(false);
        }
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading notification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chooseTriggerReminderTime = async () => {
    const options: ReminderTime[] = [
      { hour: 18, minute: 0 },
      { hour: 20, minute: 0 },
      { hour: 22, minute: 0 },
    ];

    Alert.alert(
      'Trigger reminder time',
      'Choose a time for your daily trigger reminder.',
      [
        ...options.map((t) => ({
          text: formatTime(t),
          onPress: async () => {
            setTriggerReminderTime(t);
            await setPreference(PREF_TRIGGER_REMINDERS_TIME, JSON.stringify(t));

            if (triggerRemindersEnabled && hasPermission) {
              const id = await scheduleTriggerReminders(selectedTriggers, t.hour, t.minute);
              if (!id) {
                Alert.alert(
                  'Not available',
                  'Notifications require a development build (they do not work in Expo Go).'
                );
              }
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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
      if (__DEV__) console.error('Error toggling daily check-in:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleToggleTriggerReminders = async (enabled: boolean) => {
    if (!hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Notifications are needed to send reminders. Please enable them in your device settings.'
        );
        return;
      }
      setHasPermission(true);
    }

    try {
      if (enabled) {
        const id = await scheduleTriggerReminders(
          selectedTriggers,
          triggerReminderTime.hour,
          triggerReminderTime.minute
        );
        if (id) {
          await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '1');
          await setPreference(PREF_TRIGGER_REMINDERS_TIME, JSON.stringify(triggerReminderTime));
          setTriggerRemindersEnabled(true);
          Alert.alert('Success', 'Trigger reminders enabled');
        } else {
          await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '0');
          setTriggerRemindersEnabled(false);
          Alert.alert(
            'Not available',
            'Notifications require a development build (they do not work in Expo Go).'
          );
        }
      } else {
        await cancelTriggerReminders();
        await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '0');
        setTriggerRemindersEnabled(false);
        Alert.alert('Success', 'Trigger reminders disabled');
      }
    } catch (error) {
      if (__DEV__) console.error('Error toggling trigger reminders:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  if (isLoading) {
    return (
      <Screen title="Notifications">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen title="Notifications">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Manage your daily check-in reminder.
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
                accessibilityRole="switch"
                accessibilityLabel="Daily check-in"
                accessibilityHint="Turns the daily reminder on or off."
              />
            </View>

            {dailyCheckInEnabled && hasPermission && (
              <View style={styles.timeInfo}>
                <Text style={styles.timeText}>Scheduled for {checkInHour}:00 daily</Text>
              </View>
            )}
          </View>

          {/* Trigger Reminders */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Trigger Reminders</Text>
                <Text style={styles.sectionDescription}>
                  Get one daily reminder to help you handle cravings (uses your selected triggers when available).
                </Text>
              </View>
              <Switch
                value={triggerRemindersEnabled && hasPermission}
                onValueChange={handleToggleTriggerReminders}
                trackColor={{ false: colors.border.subtle, true: colors.primary }}
                thumbColor={colors.surface.default}
                accessibilityRole="switch"
                accessibilityLabel="Trigger reminders"
                accessibilityHint="Turns the trigger reminder on or off."
              />
            </View>

            <View style={styles.timeInfo}>
              <Pressable
                onPress={chooseTriggerReminderTime}
                accessibilityRole="button"
                accessibilityLabel="Change trigger reminder time"
                accessibilityHint="Choose a time for the daily trigger reminder."
                style={styles.timeRow}>
                <Text style={styles.timeText}>Time: {formatTime(triggerReminderTime)}</Text>
                <Text style={styles.changeTimeText}>Change</Text>
              </Pressable>

              {selectedTriggers.length === 0 && (
                <Text style={styles.noteText}>
                  You don&apos;t have any triggers selected. Reminders will use a general message.
                </Text>
              )}
            </View>
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
      paddingTop: spacing.lg,
      // Screen-komponenten giver allerede horizontal padding
      paddingHorizontal: 0,
      paddingBottom: spacing.lg,
    } as ViewStyle,
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    loadingText: {
      fontSize: 14,
      color: colors.text.secondary,
    } as TextStyle,
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: spacing.xl,
      lineHeight: 24,
      textAlign: 'center' as const,
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
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    } as ViewStyle,
    timeText: {
      fontSize: 14,
      color: colors.text.secondary,
    } as TextStyle,
    changeTimeText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.primary,
    } as TextStyle,
    noteText: {
      marginTop: spacing.sm,
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    } as TextStyle,
    infoBox: {
      backgroundColor: colors.background.card,
      borderRadius: 8,
      padding: spacing.md,
      marginTop: spacing.lg,
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
