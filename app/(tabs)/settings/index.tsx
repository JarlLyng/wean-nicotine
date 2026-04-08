import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setPreferredColorScheme } from '@/lib/color-scheme';
import { formatMoney } from '@/lib/currency';
import { getTaperSettings } from '@/lib/db-settings';
import { useDesignTokens } from '@/lib/design';
import { captureError } from '@/lib/sentry';
import type { TaperSettings } from '@/lib/models';
import Constants from 'expo-constants';
import {
  cancelDailyCheckIn,
  getAllScheduledNotifications,
  requestNotificationPermissions,
  scheduleDailyCheckIn,
} from '@/lib/notifications';
import { borderRadius, spacing } from '@/lib/theme';
import { typography } from '@/lib/design';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TextStyle, View, ViewStyle } from 'react-native';

export default function SettingsScreen() {
  const { colors } = useDesignTokens();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [settings, setSettings] = useState<TaperSettings | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [dailyCheckInEnabled, setDailyCheckInEnabled] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const lastLoadedRef = useRef(0);
  const s = useMemo(() => createStyles(colors), [colors]);

  const loadData = useCallback(async (force = false) => {
    if (!force && Date.now() - lastLoadedRef.current < 2000) return;
    try {
      const currentSettings = await getTaperSettings();
      setSettings(currentSettings);
      lastLoadedRef.current = Date.now();
    } catch (error) {
      if (__DEV__) console.error('Error loading data:', error);
      if (error instanceof Error) captureError(error, { context: 'settings_load_data' });
    }
  }, []);

  const loadNotificationStatus = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const { getPermissionsAsync } = await import('expo-notifications');
      const { status } = await getPermissionsAsync();
      setHasPermission(status === 'granted');
      const notifications = await getAllScheduledNotifications();
      const hasDailyCheckIn = notifications.some(
        (n) => n.content.data?.type === 'daily_checkin'
      );
      setDailyCheckInEnabled(hasDailyCheckIn);
    } catch (error) {
      if (__DEV__) console.error('Error loading notification status:', error);
      if (error instanceof Error) captureError(error, { context: 'settings_load_notification_status' });
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

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
        Alert.alert('Permission Required', 'Enable notifications in your device settings.');
        return;
      }
      setHasPermission(true);
    }
    try {
      if (enabled) {
        const id = await scheduleDailyCheckIn(20, 0);
        if (id) setDailyCheckInEnabled(true);
        else Alert.alert('Error', 'Failed to enable daily check-in');
      } else {
        await cancelDailyCheckIn();
        setDailyCheckInEnabled(false);
      }
    } catch (error) {
      if (__DEV__) console.error('Error toggling daily check-in:', error);
      if (error instanceof Error) captureError(error, { context: 'settings_toggle_checkin' });
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.content}>

          {/* ── Notifications ── */}
          <Card variant="elevated" style={s.card} padding="lg">
            <View style={s.row}>
              <View style={[s.iconWrap, { backgroundColor: colors.primary + '14' }]}>
                <Icon name="bell" size={20} color={colors.primary} weight="regular" />
              </View>
              <View style={s.rowText}>
                <Text style={s.rowTitle}>Daily Check-In</Text>
                <Text style={s.rowDescription}>Reminder at 20:00 to log progress</Text>
              </View>
              <Switch
                value={dailyCheckInEnabled && hasPermission}
                onValueChange={handleToggleDailyCheckIn}
                disabled={isLoadingNotifications}
                trackColor={{ false: colors.border.subtle, true: colors.primary }}
                thumbColor={colors.surface.default}
                accessibilityRole="switch"
                accessibilityLabel="Daily check-in notification"
              />
            </View>
            <Button
              title="More notification options"
              onPress={() => router.push('/(tabs)/settings/notifications')}
              variant="ghost"
              style={s.linkAction}
            />
          </Card>

          {/* ── Theme ── */}
          <Card variant="elevated" style={s.card} padding="lg">
            <View style={s.row}>
              <View style={[s.iconWrap, { backgroundColor: colors.text.tertiary + '18' }]}>
                <Icon name="gear" size={20} color={colors.text.secondary} weight="regular" />
              </View>
              <View style={s.rowText}>
                <Text style={s.rowTitle}>Light Mode</Text>
                <Text style={s.rowDescription}>Switch between dark and light theme</Text>
              </View>
              <Switch
                value={colorScheme === 'light'}
                onValueChange={(isLight) => setPreferredColorScheme(isLight ? 'light' : 'dark')}
                trackColor={{ false: colors.border.subtle, true: colors.primary }}
                thumbColor={colors.surface.default}
                accessibilityRole="switch"
                accessibilityLabel="Light mode"
              />
            </View>
          </Card>

          {/* ── Current Plan ── */}
          {settings && (
            <Card variant="elevated" style={s.card} padding="lg">
              <Text style={s.sectionTitle}>Your Plan</Text>
              <View style={s.planGrid}>
                <View style={s.planItem}>
                  <Text style={s.planValue}>{settings.baselinePouchesPerDay}</Text>
                  <Text style={s.planLabel}>Baseline / day</Text>
                </View>
                <View style={s.planItem}>
                  <Text style={s.planValue}>{settings.weeklyReductionPercent}%</Text>
                  <Text style={s.planLabel}>Weekly reduction</Text>
                </View>
                {settings.pricePerCan != null && settings.pricePerCan > 0 && (
                  <View style={s.planItem}>
                    <Text style={s.planValue}>
                      {formatMoney(settings.pricePerCan, settings.currency ?? 'DKK')}
                    </Text>
                    <Text style={s.planLabel}>Per can</Text>
                  </View>
                )}
              </View>

              {settings.triggers && settings.triggers.length > 0 && (
                <View style={s.triggersSection}>
                  <Text style={s.triggersLabel}>Triggers</Text>
                  <View style={s.triggersList}>
                    {settings.triggers.map((trigger, index) => (
                      <View key={index} style={s.triggerTag}>
                        <Text style={s.triggerText}>{trigger}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* ── Start Over ── */}
          <Card variant="elevated" style={s.card} padding="lg">
            <View style={s.row}>
              <View style={[s.iconWrap, { backgroundColor: colors.error + '14' }]}>
                <Icon name="arrow-clockwise" size={20} color={colors.error} weight="regular" />
              </View>
              <View style={s.rowText}>
                <Text style={s.rowTitle}>Start Over</Text>
                <Text style={s.rowDescription}>Delete all data and begin again</Text>
              </View>
            </View>
            <Button
              title="Start Over"
              onPress={() => router.push('/(tabs)/settings/reset-taper')}
              variant="secondary"
              style={s.startOverButton}
              textStyle={{ color: colors.error }}
            />
          </Card>

          {/* ── Links ── */}
          <View style={s.linksSection}>
            <Button
              title="Privacy Policy"
              onPress={() => Linking.openURL('https://taper.iamjarl.com/privacy/')}
              variant="ghost"
              style={s.linkButton}
            />
            <Button
              title="Support"
              onPress={() => Linking.openURL('https://taper.iamjarl.com/support')}
              variant="ghost"
              style={s.linkButton}
            />
          </View>

          {/* ── Version ── */}
          <Text style={s.version}>
            Wean Nicotine v{Constants.expoConfig?.version ?? '1.0.0'} (Build {Constants.expoConfig?.ios?.buildNumber ?? '?'})
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
    } as ViewStyle,

    // Cards
    card: {
      marginBottom: spacing.md,
    } as ViewStyle,

    // Row layout (icon + text + control)
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    } as ViewStyle,
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    rowText: {
      flex: 1,
    } as ViewStyle,
    rowTitle: {
      fontSize: typography.sizes.base,
      fontWeight: `${typography.weights.semibold}` as const,
      color: colors.text.primary,
      marginBottom: 1,
    } as TextStyle,
    rowDescription: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      lineHeight: typography.lineHeights.tight,
    } as TextStyle,

    // Section title
    sectionTitle: {
      fontSize: typography.sizes.base,
      fontWeight: `${typography.weights.semibold}` as const,
      color: colors.text.primary,
      marginBottom: spacing.md,
    } as TextStyle,

    // Plan grid
    planGrid: {
      flexDirection: 'row',
      gap: spacing.md,
    } as ViewStyle,
    planItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.background.muted,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
    } as ViewStyle,
    planValue: {
      fontSize: typography.sizes.lg,
      fontWeight: `${typography.weights.bold}` as const,
      color: colors.text.primary,
      marginBottom: 2,
    } as TextStyle,
    planLabel: {
      fontSize: typography.sizes.xs,
      color: colors.text.secondary,
      textAlign: 'center' as const,
    } as TextStyle,

    // Triggers
    triggersSection: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.subtle,
    } as ViewStyle,
    triggersLabel: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
      fontWeight: `${typography.weights.semibold}` as const,
    } as TextStyle,
    triggersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    } as ViewStyle,
    triggerTag: {
      backgroundColor: colors.background.muted,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    } as ViewStyle,
    triggerText: {
      fontSize: typography.sizes.xs,
      color: colors.text.primary,
    } as TextStyle,

    // Actions
    linkAction: {
      marginTop: spacing.md,
      paddingHorizontal: 0,
      justifyContent: 'flex-start',
    } as ViewStyle,
    startOverButton: {
      marginTop: spacing.md,
      borderColor: colors.error,
    } as ViewStyle,

    // Links
    linksSection: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.md,
      marginTop: spacing.md,
    } as ViewStyle,
    linkButton: {
      paddingHorizontal: 0,
    } as ViewStyle,

    // Version
    version: {
      fontSize: typography.sizes.xs,
      color: colors.text.tertiary,
      textAlign: 'center' as const,
      marginTop: spacing.xl,
      marginBottom: spacing.xxl,
    } as TextStyle,
  });
