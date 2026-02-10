import { View, Text, StyleSheet, ScrollView, Switch, Alert, ViewStyle, TextStyle } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { spacing, typography, borderRadius } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setPreferredColorScheme } from '@/lib/color-scheme';
import { getTaperSettings } from '@/lib/db-settings';
import type { TaperSettings } from '@/lib/models';
import { formatMoney } from '@/lib/currency';
import {
  requestNotificationPermissions,
  scheduleDailyCheckIn,
  cancelDailyCheckIn,
  getAllScheduledNotifications,
} from '@/lib/notifications';

export default function SettingsScreen() {
  const { colors } = useDesignTokens();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [settings, setSettings] = useState<TaperSettings | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [dailyCheckInEnabled, setDailyCheckInEnabled] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const styles = createStyles(colors);

  const loadData = useCallback(async () => {
    try {
      const currentSettings = await getTaperSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  const loadNotificationStatus = useCallback(async () => {
    setIsLoadingNotifications(true);
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
      setIsLoadingNotifications(false);
    }
  }, []);

  // Refresh when returning to Settings tab (tabs are often not unmounted)
  useFocusEffect(
    useCallback(() => {
      loadData();
      loadNotificationStatus();
      return () => {};
    }, [loadData, loadNotificationStatus])
  );

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
    <Screen title="Settings">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Notifications Section */}
          <Card variant="elevated" style={styles.section} padding="lg">
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Daily Check-In Notification</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Receive a gentle reminder each day at 8 PM to log your progress
                </Text>
              </View>
              <Switch
                value={dailyCheckInEnabled && hasPermission}
                onValueChange={handleToggleDailyCheckIn}
                disabled={isLoadingNotifications}
                trackColor={{ false: colors.border.subtle, true: colors.primary }}
                thumbColor={colors.surface.default}
                accessibilityRole="switch"
                accessibilityLabel="Daily check-in notification"
                accessibilityHint="Turns the daily reminder on or off."
              />
            </View>
            {dailyCheckInEnabled && hasPermission && (
              <Text style={styles.notificationInfo}>Scheduled for 20:00 daily</Text>
            )}
            <Button
              title="Notification options"
              onPress={() => router.push('/(tabs)/settings/notifications')}
              variant="ghost"
              style={{ marginTop: spacing.sm }}
            />
          </Card>

          {/* Theme Info */}
          <Card variant="elevated" style={styles.section} padding="lg">
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Theme</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Default is Dark mode. Turn on Light mode if you prefer a brighter look.
                </Text>
              </View>
              <Switch
                value={colorScheme === 'light'}
                onValueChange={(isLight) => {
                  setPreferredColorScheme(isLight ? 'light' : 'dark');
                }}
                trackColor={{ false: colors.border.subtle, true: colors.primary }}
                thumbColor={colors.surface.default}
                accessibilityRole="switch"
                accessibilityLabel="Light mode"
                accessibilityHint="Turns light mode on or off."
              />
            </View>
          </Card>

          {/* Current Settings Info */}
          {settings && (
            <Card variant="elevated" style={styles.section} padding="lg">
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Current Settings</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="calendar" size={20} color={colors.text.secondary} weight="regular" />
                <Text style={styles.info}>Baseline: {settings.baselinePouchesPerDay} pouches/day</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="chart-line-up" size={20} color={colors.text.secondary} weight="regular" />
                <Text style={styles.info}>
                  Weekly Reduction: {settings.weeklyReductionPercent}%
                </Text>
              </View>
              {settings.pricePerCan && (
                <View style={styles.infoRow}>
                  <Icon name="coins" size={20} color={colors.text.secondary} weight="regular" />
                  <Text style={styles.info}>
                    Price per can: {formatMoney(settings.pricePerCan, settings.currency ?? 'DKK')}
                  </Text>
                </View>
              )}
              {settings.triggers && settings.triggers.length > 0 && (
                <View style={styles.triggersContainer}>
                  <Text style={styles.triggersLabel}>Selected Triggers:</Text>
                  <View style={styles.triggersList}>
                    {settings.triggers.map((trigger, index) => (
                      <View key={index} style={styles.triggerTag}>
                        <Text style={styles.triggerText}>{trigger}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* Start Over Section */}
          <Card variant="elevated" style={styles.section} padding="lg">
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Start Over</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Delete all your data and return to onboarding.
            </Text>
            <Button
              title="Start Over"
              onPress={() => router.push('/(tabs)/settings/reset-taper')}
              variant="secondary"
              style={{ ...styles.resetButton, borderColor: colors.error }}
              textStyle={{ color: colors.error }}
            />
          </Card>
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
    } as ViewStyle,
    section: {
      marginBottom: spacing.md,
    } as ViewStyle,
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    } as ViewStyle,
    sectionHeaderText: {
      flex: 1,
      marginRight: spacing.md,
    } as ViewStyle,
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    } as ViewStyle,
    sectionTitle: {
      ...typography.xl,
      fontWeight: '600' as const,
      lineHeight: 28,
      color: colors.text.primary,
    } as TextStyle,
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    } as ViewStyle,
    sectionDescription: {
      ...typography.caption,
      color: colors.text.secondary,
      lineHeight: 20,
    } as TextStyle,
    notificationInfo: {
      ...typography.caption,
      color: colors.text.secondary,
      marginTop: spacing.md,
      fontStyle: 'italic',
    } as TextStyle,
    info: {
      ...typography.caption,
      marginBottom: spacing.xs,
      color: colors.text.primary,
    } as TextStyle,
    resetButton: {
      marginTop: spacing.sm,
    } as ViewStyle,
    triggersContainer: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
    } as ViewStyle,
    triggersLabel: {
      ...typography.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
      fontWeight: '600' as const,
    } as TextStyle,
    triggersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    } as ViewStyle,
    triggerTag: {
      backgroundColor: colors.background.card,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    } as ViewStyle,
    triggerText: {
      ...typography.xs,
      // Match preview: chip text should be black in light mode (and readable in dark mode)
      color: colors.text.primary,
      fontWeight: '500' as const,
    } as TextStyle,
  };

  return StyleSheet.create(styles);
};
