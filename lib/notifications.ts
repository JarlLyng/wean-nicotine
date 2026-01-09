/**
 * Notification management for Taper
 * 
 * NOTE: Notifications require a development build and do not work in Expo Go.
 * To test notifications, create a development build:
 * - iOS: npx expo run:ios
 * - Android: npx expo run:android
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { DailyTriggerInput } from 'expo-notifications';

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
export async function scheduleDailyCheckIn(hour: number = 20, minute: number = 0): Promise<string | null> {
  try {
    // Cancel existing daily check-in
    await cancelDailyCheckIn();

    const notificationId = await Notifications.scheduleNotificationAsync({
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
    console.error('Error scheduling daily check-in:', error);
    return null;
  }
}

/**
 * Cancel daily check-in notification
 */
export async function cancelDailyCheckIn(): Promise<void> {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const dailyCheckIns = allNotifications.filter(
      (n) => n.content.data?.type === 'daily_checkin'
    );

    for (const notification of dailyCheckIns) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling daily check-in:', error);
  }
}

/**
 * Schedule trigger-based reminder
 */
export async function scheduleTriggerReminder(
  trigger: string,
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reminder',
        body: `Remember your plan. You've got this!`,
        sound: true,
        data: { type: 'trigger_reminder', trigger },
      },
      trigger: {
        type: 'daily' as const,
        hour,
        minute,
      } as DailyTriggerInput,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling trigger reminder:', error);
    return null;
  }
}

/**
 * Cancel all trigger reminders
 */
export async function cancelTriggerReminders(): Promise<void> {
  try {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const triggerReminders = allNotifications.filter(
      (n) => n.content.data?.type === 'trigger_reminder'
    );

    for (const notification of triggerReminders) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling trigger reminders:', error);
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}
