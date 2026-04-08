import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextStyle, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import { resetAllData } from '@/lib/db';
import { deleteAllAnalytics } from '@/lib/analytics';
import { cancelAllNotifications } from '@/lib/notifications';
import { captureError, captureMessage } from '@/lib/sentry';

const DELETED_ITEMS = [
  { icon: 'gear' as const, label: 'Your settings' },
  { icon: 'chart-line-up' as const, label: 'Progress history & logs' },
  { icon: 'calendar' as const, label: 'Your taper plan' },
  { icon: 'bell' as const, label: 'Scheduled notifications' },
];

export default function ResetTaperScreen() {
  const router = useRouter();
  const { colors } = useDesignTokens();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [isStartingOver, setIsStartingOver] = useState(false);

  const handleStartOver = async () => {
    Alert.alert(
      'Are you sure?',
      'This permanently deletes all your data. You cannot undo this.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setIsStartingOver(true);
            try {
              await cancelAllNotifications();
              await resetAllData();
              await deleteAllAnalytics();

              const { getTaperSettings } = await import('@/lib/db-settings');
              const { getUserPlan } = await import('@/lib/db-user-plan');
              const verifySettings = await getTaperSettings();
              const verifyPlan = await getUserPlan();

              if (verifySettings || verifyPlan) {
                captureMessage('Reset: data still exists after deletion', 'warning');
                Alert.alert('Warning', 'Some data may not have been cleared. Please try again.');
                setIsStartingOver(false);
                return;
              }

              Alert.alert('Done', 'All data has been cleared.', [
                { text: 'OK', onPress: () => router.replace('/(onboarding)/welcome') },
              ]);
            } catch (error) {
              if (__DEV__) console.error('Error starting over:', error);
              if (error instanceof Error) captureError(error, { context: 'reset_taper_start_over' });
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            } finally {
              setIsStartingOver(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          {/* Warning icon */}
          <View style={s.warningHeader}>
            <View style={[s.warningIcon, { backgroundColor: colors.error + '14' }]}>
              <Icon name="trash" size={28} color={colors.error} weight="regular" />
            </View>
            <Text style={s.warningTitle}>Start Over</Text>
            <Text style={s.warningSubtitle}>
              This will permanently delete all your data and return you to onboarding.
            </Text>
          </View>

          {/* What gets deleted */}
          <Card variant="elevated" padding="lg" style={s.card}>
            <Text style={s.listTitle}>What will be deleted:</Text>
            {DELETED_ITEMS.map((item) => (
              <View key={item.label} style={s.listItem}>
                <Icon name={item.icon} size={18} color={colors.text.secondary} weight="regular" />
                <Text style={s.listText}>{item.label}</Text>
              </View>
            ))}
          </Card>

          {/* Spacer */}
          <View style={s.spacer} />

          {/* Actions */}
          <Button
            title={isStartingOver ? 'Deleting...' : 'Delete All Data'}
            onPress={handleStartOver}
            disabled={isStartingOver}
            loading={isStartingOver}
            variant="secondary"
            style={s.deleteButton}
            textStyle={{ color: colors.error }}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            disabled={isStartingOver}
          />
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
      paddingTop: spacing.xl,
      paddingHorizontal: 0,
      paddingBottom: spacing.lg,
    } as ViewStyle,

    // Warning header
    warningHeader: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    } as ViewStyle,
    warningIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    } as ViewStyle,
    warningTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: `${typography.weights.bold}` as const,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    } as TextStyle,
    warningSubtitle: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      textAlign: 'center' as const,
      lineHeight: typography.lineHeights.tight,
      paddingHorizontal: spacing.lg,
    } as TextStyle,

    // List
    card: {
      marginBottom: spacing.lg,
    } as ViewStyle,
    listTitle: {
      fontSize: typography.sizes.sm,
      fontWeight: `${typography.weights.semibold}` as const,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    } as TextStyle,
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
    } as ViewStyle,
    listText: {
      fontSize: typography.sizes.base,
      color: colors.text.primary,
    } as TextStyle,

    // Layout
    spacer: {
      flex: 1,
      minHeight: spacing.xxl,
    } as ViewStyle,
    deleteButton: {
      borderColor: colors.error,
      marginBottom: spacing.sm,
    } as ViewStyle,
  });
