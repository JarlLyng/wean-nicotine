import { useState, useMemo, useRef, useEffect } from 'react';
import { Animated, Easing, Platform, Pressable, View, Text, StyleSheet, ScrollView, Alert, TextStyle, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
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

// Hold-to-confirm duration. Long enough that an accidental tap-and-hold
// won't trigger; short enough that an intentional user doesn't lose patience.
const HOLD_MS = 2000;

export default function ResetTaperScreen() {
  const router = useRouter();
  const { colors } = useDesignTokens();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [isStartingOver, setIsStartingOver] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  // Drives the visual fill inside the delete button.
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      holdAnimationRef.current?.stop();
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const performReset = async () => {
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

      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
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
  };

  const cancelHold = () => {
    holdAnimationRef.current?.stop();
    holdAnimationRef.current = null;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    Animated.timing(holdProgress, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
    setIsHolding(false);
  };

  const startHold = () => {
    if (isStartingOver) return;
    setIsHolding(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    holdProgress.setValue(0);
    holdAnimationRef.current = Animated.timing(holdProgress, {
      toValue: 1,
      duration: HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    holdAnimationRef.current.start();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      holdAnimationRef.current = null;
      setIsHolding(false);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
      void performReset();
    }, HOLD_MS);
  };

  const fillWidth = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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

          {/* Hold-to-confirm destructive action.
              A single tap won't fire the reset — the user has to hold for
              ~2 seconds, watching a primary-coloured fill sweep across the
              button. Releasing early cancels the action cleanly. */}
          <Pressable
            onPressIn={startHold}
            onPressOut={cancelHold}
            disabled={isStartingOver}
            accessibilityRole="button"
            accessibilityLabel="Hold to delete all data"
            accessibilityHint="Press and hold for two seconds to confirm and permanently delete all data."
            style={[s.holdButton, isHolding && s.holdButtonActive]}
          >
            <Animated.View
              style={[s.holdFill, { width: fillWidth, backgroundColor: colors.error + '22' }]}
              pointerEvents="none"
            />
            <Text style={s.holdButtonText}>
              {isStartingOver
                ? 'Deleting…'
                : isHolding
                  ? 'Keep holding to confirm…'
                  : 'Hold to delete all data'}
            </Text>
          </Pressable>
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
    holdButton: {
      position: 'relative',
      overflow: 'hidden',
      minHeight: 52,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.error,
      backgroundColor: colors.background.app,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    } as ViewStyle,
    holdButtonActive: {
      borderColor: colors.error,
    } as ViewStyle,
    holdFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
    } as ViewStyle,
    holdButtonText: {
      fontSize: typography.sizes.base,
      fontWeight: `${typography.weights.semibold}` as const,
      color: colors.error,
    } as TextStyle,
  });
