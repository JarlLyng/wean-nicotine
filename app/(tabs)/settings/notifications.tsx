import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert, Pressable, TextStyle, ViewStyle } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import { captureError } from '@/lib/sentry';
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
const PREF_TRIGGER_REMINDERS_TIME = 'triggerRemindersTime';

type ReminderTime = { hour: number; minute: number };

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatTime(t: ReminderTime) {
  return `${pad2(t.hour)}:${pad2(t.minute)}`;
}

export default function NotificationsScreen() {
  const { colors } = useDesignTokens();
  const s = useMemo(() => createStyles(colors), [colors]);
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

      const storedEnabled = (await getPreference(PREF_TRIGGER_REMINDERS_ENABLED)) === '1';
      const storedTimeRaw = await getPreference(PREF_TRIGGER_REMINDERS_TIME);
      let storedTime: ReminderTime | null = null;
      if (storedTimeRaw) {
        try {
          const parsed = JSON.parse(storedTimeRaw) as Partial<ReminderTime>;
          if (typeof parsed.hour === 'number' && typeof parsed.minute === 'number') {
            storedTime = { hour: parsed.hour, minute: parsed.minute };
          }
        } catch { /* ignore */ }
      }

      let scheduledTime: ReminderTime | null = null;
      if (triggerReminder && triggerReminder.trigger && typeof triggerReminder.trigger === 'object') {
        const t = triggerReminder.trigger as Record<string, unknown>;
        if (typeof t.hour === 'number' && typeof t.minute === 'number') {
          scheduledTime = { hour: t.hour, minute: t.minute };
        }
      }
      const effectiveTime = scheduledTime ?? storedTime ?? { hour: 20, minute: 0 };
      setTriggerReminderTime(effectiveTime);

      if (hasTriggerReminder && !storedEnabled) {
        await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '1');
      }

      if (storedEnabled && !hasTriggerReminder && status === 'granted') {
        const id = await scheduleTriggerReminders(triggers, effectiveTime.hour, effectiveTime.minute);
        if (id) {
          setTriggerRemindersEnabled(true);
          await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '1');
        } else {
          await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '0');
          setTriggerRemindersEnabled(false);
        }
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading notification status:', error);
      if (error instanceof Error) captureError(error, { context: 'notifications_load_status' });
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
                Alert.alert('Not available', 'Notifications require a development build (they do not work in Expo Go).');
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
        Alert.alert('Permission Required', 'Enable notifications in your device settings.');
        return;
      }
      setHasPermission(true);
    }
    try {
      if (enabled) {
        const id = await scheduleDailyCheckIn(checkInHour, 0);
        if (id) {
          setDailyCheckInEnabled(true);
        } else {
          Alert.alert('Error', 'Failed to enable daily check-in');
        }
      } else {
        await cancelDailyCheckIn();
        setDailyCheckInEnabled(false);
      }
    } catch (error) {
      if (__DEV__) console.error('Error toggling daily check-in:', error);
      if (error instanceof Error) captureError(error, { context: 'notifications_toggle_checkin' });
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleToggleTriggerReminders = async (enabled: boolean) => {
    if (!hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert('Permission Required', 'Enable notifications in your device settings.');
        return;
      }
      setHasPermission(true);
    }
    try {
      if (enabled) {
        const id = await scheduleTriggerReminders(selectedTriggers, triggerReminderTime.hour, triggerReminderTime.minute);
        if (id) {
          await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '1');
          await setPreference(PREF_TRIGGER_REMINDERS_TIME, JSON.stringify(triggerReminderTime));
          setTriggerRemindersEnabled(true);
        } else {
          await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '0');
          setTriggerRemindersEnabled(false);
          Alert.alert('Not available', 'Notifications require a development build.');
        }
      } else {
        await cancelTriggerReminders();
        await setPreference(PREF_TRIGGER_REMINDERS_ENABLED, '0');
        setTriggerRemindersEnabled(false);
      }
    } catch (error) {
      if (__DEV__) console.error('Error toggling trigger reminders:', error);
      if (error instanceof Error) captureError(error, { context: 'notifications_toggle_trigger_reminders' });
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={s.loadingContainer}>
          <Text style={s.loadingText}>Loading...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          {/* Daily Check-In */}
          <Card variant="elevated" padding="lg" style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.iconWrap, { backgroundColor: colors.primary + '14' }]}>
                <Icon name="bell" size={20} color={colors.primary} weight="regular" />
              </View>
              <View style={s.cardHeaderText}>
                <Text style={s.cardTitle}>Daily Check-In</Text>
                <Text style={s.cardDescription}>
                  A gentle reminder each evening to log your progress
                </Text>
              </View>
              <Switch
                value={dailyCheckInEnabled && hasPermission}
                onValueChange={handleToggleDailyCheckIn}
                trackColor={{ false: colors.border.subtle, true: colors.primary }}
                thumbColor={colors.surface.default}
                accessibilityRole="switch"
                accessibilityLabel="Daily check-in"
              />
            </View>
            {dailyCheckInEnabled && hasPermission && (
              <Text style={s.timeDetail}>Scheduled for {checkInHour}:00 daily</Text>
            )}
          </Card>

          {/* Trigger Reminders */}
          <Card variant="elevated" padding="lg" style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.iconWrap, { backgroundColor: colors.warning + '18' }]}>
                <Icon name="lightning" size={20} color={colors.warning} weight="regular" />
              </View>
              <View style={s.cardHeaderText}>
                <Text style={s.cardTitle}>Trigger Reminders</Text>
                <Text style={s.cardDescription}>
                  Daily reminder to help you handle cravings
                </Text>
              </View>
              <Switch
                value={triggerRemindersEnabled && hasPermission}
                onValueChange={handleToggleTriggerReminders}
                trackColor={{ false: colors.border.subtle, true: colors.primary }}
                thumbColor={colors.surface.default}
                accessibilityRole="switch"
                accessibilityLabel="Trigger reminders"
              />
            </View>

            <View style={s.timeRow}>
              <Text style={s.timeLabel}>Time</Text>
              <Pressable
                onPress={chooseTriggerReminderTime}
                accessibilityRole="button"
                accessibilityLabel="Change trigger reminder time"
                style={s.timeButton}>
                <Text style={s.timeValue}>{formatTime(triggerReminderTime)}</Text>
                <Text style={s.changeText}>Change</Text>
              </Pressable>
            </View>

            {selectedTriggers.length === 0 && (
              <Text style={s.noteText}>
                No triggers selected — reminders will use a general message.
              </Text>
            )}
          </Card>

          {/* Info */}
          <Text style={s.infoText}>
            Notifications are designed to be helpful, not annoying. You can turn them off anytime.
          </Text>
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
      paddingTop: spacing.lg,
      paddingHorizontal: 0,
      paddingBottom: spacing.lg,
    } as ViewStyle,
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    loadingText: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
    } as TextStyle,

    // Cards
    card: {
      marginBottom: spacing.md,
    } as ViewStyle,
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    } as ViewStyle,
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    } as ViewStyle,
    cardHeaderText: {
      flex: 1,
    } as ViewStyle,
    cardTitle: {
      fontSize: typography.sizes.base,
      fontWeight: `${typography.weights.semibold}` as const,
      color: colors.text.primary,
      marginBottom: 2,
    } as TextStyle,
    cardDescription: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      lineHeight: typography.lineHeights.tight,
    } as TextStyle,

    // Time
    timeDetail: {
      fontSize: typography.sizes.sm,
      color: colors.text.tertiary,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
    } as TextStyle,
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
    } as ViewStyle,
    timeLabel: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
    } as TextStyle,
    timeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    } as ViewStyle,
    timeValue: {
      fontSize: typography.sizes.sm,
      fontWeight: `${typography.weights.semibold}` as const,
      color: colors.text.primary,
    } as TextStyle,
    changeText: {
      fontSize: typography.sizes.sm,
      fontWeight: `${typography.weights.semibold}` as const,
      color: colors.primary,
    } as TextStyle,
    noteText: {
      marginTop: spacing.sm,
      fontSize: typography.sizes.xs,
      color: colors.text.tertiary,
      lineHeight: typography.lineHeights.sm,
    } as TextStyle,

    // Info
    infoText: {
      fontSize: typography.sizes.sm,
      color: colors.text.tertiary,
      lineHeight: typography.lineHeights.tight,
      textAlign: 'center' as const,
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
    } as TextStyle,
  });
