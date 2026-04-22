import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import { createLogEntry } from '@/lib/db-log-entries';
import { captureError } from '@/lib/sentry';
import * as Haptics from 'expo-haptics';

const STEPS = [
  {
    title: 'Notice the urge',
    instruction: "Don't fight it. Simply acknowledge: \"I'm having a craving right now.\"",
    guidance: 'Where do you feel it? Jaw? Chest? Hands? Just notice.',
  },
  {
    title: 'Observe without judgment',
    instruction: 'Notice the physical sensations. Is it tension? Restlessness? Tingling?',
    guidance: 'You are the observer, not the craving. Just watch it.',
  },
  {
    title: 'Ride the wave',
    instruction: 'Like a wave, cravings build, peak, and subside. This will pass.',
    guidance: 'You don\'t have to do anything. Just let it move through you.',
  },
  {
    title: 'Breathe through it',
    instruction: 'Take slow, deep breaths. Focus on each exhale as the craving peaks.',
    guidance: 'In through the nose… out through the mouth… slowly.',
  },
  {
    title: 'Notice it passing',
    instruction: 'The intensity is fading. You rode it out. Each time it gets easier.',
    guidance: 'You just proved to yourself that you can handle this.',
  },
];

const SESSION_DURATION = 5 * 60; // 5 minutes in seconds
const STEP_DURATION = SESSION_DURATION / STEPS.length; // 60s per step

export default function UrgeSurfingScreen() {
  const { colors } = useDesignTokens();
  const [mode, setMode] = useState<'info' | 'session' | 'complete'>('info');
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [logged, setLogged] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressWidth = useSharedValue(0);
  const s = useMemo(() => createStyles(colors), [colors]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const handleStart = () => {
    setMode('session');
    setCurrentStep(0);
    setElapsed(0);
    setLogged(false);
    progressWidth.value = 0;

    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        progressWidth.value = withTiming(next / SESSION_DURATION, { duration: 900 });

        // Auto-advance step
        const step = Math.min(Math.floor(next / STEP_DURATION), STEPS.length - 1);
        setCurrentStep((curr) => {
          if (step !== curr) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          }
          return step;
        });

        if (next >= SESSION_DURATION) {
          clearTimer();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          setMode('complete');
        }
        return next;
      });
    }, 1000);
  };

  const handleStop = () => {
    clearTimer();
    if (elapsed >= 60) {
      // Lasted at least 1 minute — offer to log
      setMode('complete');
    } else {
      setMode('info');
    }
  };

  const handleLogResisted = async () => {
    try {
      await createLogEntry('craving_resisted');
      setLogged(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      if (e instanceof Error) captureError(e);
    }
  };

  const handleDone = () => {
    setMode('info');
    setElapsed(0);
    setCurrentStep(0);
    progressWidth.value = 0;
  };

  const animatedBar = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const minutesElapsed = Math.floor(elapsed / 60);
  const secondsElapsed = elapsed % 60;

  // ── Session mode ─────────────────────────────────────────────────
  if (mode === 'session') {
    const step = STEPS[currentStep];
    return (
      <Screen>
        <View style={s.sessionContainer}>
          {/* Progress bar */}
          <View style={s.progressBar}>
            <Animated.View style={[s.progressFill, animatedBar]} />
          </View>

          {/* Timer */}
          <Text style={s.timer}>
            {minutesElapsed}:{String(secondsElapsed).padStart(2, '0')}
          </Text>

          {/* Step indicator */}
          <Text style={s.stepIndicator}>Step {currentStep + 1} of {STEPS.length}</Text>

          {/* Current step */}
          <Animated.View key={currentStep} entering={FadeIn.duration(400)} style={s.stepCard}>
            <Text style={s.stepTitle}>{step.title}</Text>
            <Text style={s.stepInstruction}>{step.instruction}</Text>
            <Text style={s.stepGuidance}>{step.guidance}</Text>
          </Animated.View>

          <View style={s.sessionButtonArea}>
            <Button title="Stop" variant="secondary" onPress={handleStop} />
          </View>
        </View>
      </Screen>
    );
  }

  // ── Complete mode ────────────────────────────────────────────────
  if (mode === 'complete') {
    return (
      <Screen>
        <View style={s.completeContainer}>
          <Animated.View entering={FadeInDown.duration(400)} style={s.completeContent}>
            <Icon name="check-circle" size={56} color={colors.success} />
            <Text style={s.completeTitle}>
              The craving passed
            </Text>
            <Text style={s.completeSubtitle}>
              after {minutesElapsed} minute{minutesElapsed !== 1 ? 's' : ''}
              {secondsElapsed > 0 ? ` ${secondsElapsed}s` : ''}
            </Text>

            {!logged ? (
              <Button
                title="Log as Resisted Craving"
                onPress={handleLogResisted}
                style={s.logButton}
              />
            ) : (
              <Animated.View entering={FadeIn.duration(200)} style={s.loggedRow}>
                <Icon name="check-circle" size={20} color={colors.success} />
                <Text style={s.loggedText}>Logged!</Text>
              </Animated.View>
            )}

            <Button title="Done" variant="ghost" onPress={handleDone} style={s.doneButton} />
          </Animated.View>
        </View>
      </Screen>
    );
  }

  // ── Info mode (default) ──────────────────────────────────────────
  return (
    <Screen>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          <Button title="Start Guided Session (5 min)" onPress={handleStart} />

          <View style={s.sectionSpacer} />

          <Text style={s.heading}>What is Urge Surfing?</Text>
          <Text style={s.text}>
            Urge surfing is a mindfulness technique where you observe your craving like a wave
            — noticing it rise, peak, and fall — without acting on it.
          </Text>

          <Text style={s.heading}>How to Practice</Text>
          {STEPS.map((step, i) => (
            <View key={i} style={s.infoStep}>
              <Text style={s.infoStepNumber}>{i + 1}</Text>
              <View style={s.infoStepContent}>
                <Text style={s.infoStepTitle}>{step.title}</Text>
                <Text style={s.infoStepText}>{step.instruction}</Text>
              </View>
            </View>
          ))}

          <Card variant="flat" padding="md" style={s.infoBox}>
            <Text style={s.infoText}>
              Cravings typically peak within 5–15 minutes and then fade. Each time you ride one
              out, you get stronger.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    // ── Info mode ───────────────────────────────────────────────
    scrollContent: { flexGrow: 1 },
    content: {
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    sectionSpacer: { height: spacing.xl },
    heading: {
      fontSize: typography.sizes.xl,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    text: {
      fontSize: typography.sizes.base,
      lineHeight: typography.lineHeights.normal,
      color: colors.text.primary,
      marginBottom: spacing.xl,
    },
    infoStep: {
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    infoStepNumber: {
      fontSize: typography.sizes.xl,
      fontWeight: `${typography.weights.bold}`,
      color: colors.primary,
      width: 32,
    },
    infoStepContent: { flex: 1 },
    infoStepTitle: {
      fontSize: typography.sizes.base,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.primary,
      marginBottom: 2,
    },
    infoStepText: {
      fontSize: typography.sizes.base,
      lineHeight: typography.lineHeights.normal,
      color: colors.text.primary,
    },
    infoBox: {
      backgroundColor: colors.background.muted,
      marginTop: spacing.lg,
    },
    infoText: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: typography.lineHeights.tight,
    },

    // ── Session mode ────────────────────────────────────────────
    sessionContainer: {
      flex: 1,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.background.muted,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: spacing.xl,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    timer: {
      fontSize: 48,
      fontWeight: `${typography.weights.bold}`,
      color: colors.text.primary,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
    stepIndicator: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
    },
    stepCard: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.md,
    },
    stepTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    stepInstruction: {
      fontSize: typography.sizes.lg,
      lineHeight: typography.lineHeights.relaxed,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    stepGuidance: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    sessionButtonArea: {
      paddingTop: spacing.md,
    },

    // ── Complete mode ───────────────────────────────────────────
    completeContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    completeContent: {
      alignItems: 'center',
    },
    completeTitle: {
      fontSize: typography.sizes.xl,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.text.primary,
      marginTop: spacing.md,
    },
    completeSubtitle: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      marginBottom: spacing.xl,
    },
    logButton: {
      marginBottom: spacing.sm,
      alignSelf: 'stretch',
    },
    loggedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    loggedText: {
      fontSize: typography.sizes.lg,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.success,
    },
    doneButton: {
      alignSelf: 'stretch',
    },
  });
