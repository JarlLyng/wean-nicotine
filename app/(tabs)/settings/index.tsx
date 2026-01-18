import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, ViewStyle, TextStyle } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { spacing, typography, borderRadius } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTaperSettings } from '@/lib/db-settings';
import type { TaperSettings } from '@/lib/models';
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
              <Icon name="arrow-clockwise" size={24} color={colors.text.primary} weight="regular" />
              <Text style={styles.sectionTitle}>Taper Plan</Text>
            </View>
            <Text style={styles.sectionDescription}>
              If you&apos;ve had a setback or want to start fresh, you can reset your taper plan.
            </Text>
            <Button
              title="Reset Taper Plan"
              onPress={() => router.push('/(tabs)/settings/reset-taper')}
              variant="secondary"
              style={{ ...styles.resetButton, borderColor: colors.error }}
              textStyle={{ color: colors.error }}
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
                    color={colors.text.primary} 
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
                  trackColor={{ false: colors.border.subtle, true: colors.primary }}
                  thumbColor={colors.surface.default}
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

          {/* Theme Info */}
          <Card variant="elevated" style={styles.section} padding="lg">
            <View style={styles.sectionTitleRow}>
              <Icon name="gear" size={24} color={colors.text.primary} weight="regular" />
              <Text style={styles.sectionTitle}>Theme</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="check-circle" size={20} color={colors.text.secondary} weight="regular" />
              <Text style={styles.info}>
                Mode: {colorScheme === 'dark' ? 'Dark' : 'Light'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="check-circle" size={20} color={colors.surface.default} weight="regular" />
              <Text style={styles.info}>
                Card background: {colors.surface.default}
              </Text>
            </View>
          </Card>

          {/* Current Settings Info */}
          {settings && (
            <Card variant="elevated" style={styles.section} padding="lg">
              <View style={styles.sectionTitleRow}>
                <Icon name="gear" size={24} color={colors.text.primary} weight="regular" />
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
                  <Icon name="currency-dollar" size={20} color={colors.text.secondary} weight="regular" />
                  <Text style={styles.info}>
                    Price per can: ${(settings.pricePerCan / 100).toFixed(2)}
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
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => {
  // Guard against any unexpected undefined values
  const primary = colors?.primary ?? '#00FF7B';
  const primary20 = `${primary}20`; // 8-digit hex alpha
  const primary40 = `${primary}40`;

  const styles = {
    scrollContent: {
      flexGrow: 1,
    } as ViewStyle,
    content: {
      flex: 1,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.md,
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
    permissionButton: {
      marginTop: spacing.md,
    } as ViewStyle,
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
      backgroundColor: primary20,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: primary40,
    } as ViewStyle,
    triggerText: {
      ...typography.xs,
      color: primary,
      fontWeight: '500' as const,
    } as TextStyle,
  };

  return StyleSheet.create(styles);
};
