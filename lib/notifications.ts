/**
 * Notification management for Wean Nicotine
 *
 * NOTE: Notifications require a development build and do not work in Expo Go.
 * To test notifications, create a development build:
 * - iOS: npx expo run:ios
 * - Android: npx expo run:android
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { DailyTriggerInput } from 'expo-notifications';
import { captureError } from './sentry';
import { DEFAULT_CHECK_IN_HOUR } from './constants';

/**
 * Stable notification identifiers (#96). Scheduling with the same identifier
 * REPLACES the existing request (UNUserNotificationCenter semantics), which
 * closes the snapshot-then-cancel race window structurally: two concurrent
 * schedules can never leave duplicates, because both write the same slot.
 * Pre-stable-id installs scheduled with random UUIDs — the cancel helpers
 * still sweep those legacy requests by their `data.type` marker.
 */
const DAILY_CHECKIN_ID = 'daily-checkin';
const TRIGGER_REMINDER_ID = 'trigger-reminder';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0a7ea4',
    });
  }

  return finalStatus === 'granted';
}

/**
 * Schedule daily check-in notification
 */
export async function scheduleDailyCheckIn(
  hour: number = DEFAULT_CHECK_IN_HOUR,
  minute: number = 0,
): Promise<string | null> {
  try {
    // Sweep any legacy (random-id) check-ins from pre-stable-id installs.
    // The stable identifier below makes this unnecessary for new schedules —
    // same id replaces atomically.
    await cancelDailyCheckIn();

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: DAILY_CHECKIN_ID,
      content: {
        title: 'Daily Check-In',
        body: 'How are you doing today? Take a moment to log your progress.',
        sound: true,
        data: { type: 'daily_checkin' },
      },
      trigger: {
        type: 'daily' as const,
        hour,
        minute,
      } as DailyTriggerInput,
    });

    return notificationId;
  } catch (error) {
    if (__DEV__) console.error('Error scheduling daily check-in:', error);
    if (error instanceof Error) {
      captureError(error, { context: 'schedule_daily_checkin' });
    }
    return null;
  }
}

/**
 * Cancel daily check-in notification
 */
export async function cancelDailyCheckIn(): Promise<void> {
  try {
    // Direct, race-free cancel of the stable-id request…
    await Notifications.cancelScheduledNotificationAsync(DAILY_CHECKIN_ID);

    // …plus a sweep for legacy random-id requests from older installs.
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const dailyCheckIns = allNotifications.filter((n) => n.content.data?.type === 'daily_checkin');

    for (const notification of dailyCheckIns) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    if (__DEV__) console.error('Error canceling daily check-in:', error);
    if (error instanceof Error) {
      captureError(error, { context: 'cancel_daily_checkin' });
    }
  }
}

/**
 * Schedule a single trigger reminders notification (MVP).
 *
 * We only schedule ONE reminder per day to avoid spam.
 * If the user has selected triggers during onboarding, we reference one as an example.
 */
export async function scheduleTriggerReminders(
  triggers: string[] | undefined,
  hour: number = DEFAULT_CHECK_IN_HOUR,
  minute: number = 0,
): Promise<string | null> {
  try {
    // Sweep legacy (random-id) reminders from pre-stable-id installs. The
    // stable identifier below replaces atomically for new schedules.
    await cancelTriggerReminders();

    const exampleTrigger = triggers && triggers.length > 0 ? triggers[0] : null;
    const body = exampleTrigger
      ? `If you feel a trigger like "${exampleTrigger}", try a tool instead. You've got this!`
      : `Remember your plan. You've got this!`;

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: TRIGGER_REMINDER_ID,
      content: {
        title: 'Trigger Reminder',
        body,
        sound: true,
        data: { type: 'trigger_reminder', triggers: triggers ?? [] },
      },
      trigger: {
        type: 'daily' as const,
        hour,
        minute,
      } as DailyTriggerInput,
    });

    return notificationId;
  } catch (error) {
    if (__DEV__) console.error('Error scheduling trigger reminders:', error);
    if (error instanceof Error) {
      captureError(error, { context: 'schedule_trigger_reminders' });
    }
    return null;
  }
}

/**
 * Cancel all trigger reminders
 */
export async function cancelTriggerReminders(): Promise<void> {
  try {
    // Direct, race-free cancel of the stable-id request…
    await Notifications.cancelScheduledNotificationAsync(TRIGGER_REMINDER_ID);

    // …plus a sweep for legacy random-id requests from older installs.
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const triggerReminders = allNotifications.filter(
      (n) => n.content.data?.type === 'trigger_reminder',
    );

    for (const notification of triggerReminders) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    if (__DEV__) console.error('Error canceling trigger reminders:', error);
    if (error instanceof Error) {
      captureError(error, { context: 'cancel_trigger_reminders' });
    }
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    if (__DEV__) console.error('Error canceling all notifications:', error);
    if (error instanceof Error) {
      captureError(error, { context: 'cancel_all_notifications' });
    }
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    if (__DEV__) console.error('Error getting scheduled notifications:', error);
    if (error instanceof Error) {
      captureError(error, { context: 'get_all_scheduled_notifications' });
    }
    return [];
  }
}
