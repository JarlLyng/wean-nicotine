import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { spacing, borderRadius } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import * as Haptics from 'expo-haptics';

const BREATHING_CYCLES = [
  { phase: 'Breathe In', duration: 4000, instruction: 'Slowly breathe in through your nose' },
  { phase: 'Hold', duration: 2000, instruction: 'Hold your breath gently' },
  { phase: 'Breathe Out', duration: 6000, instruction: 'Slowly breathe out through your mouth' },
  { phase: 'Pause', duration: 2000, instruction: 'Take a moment' },
];

export default function BreathingExercise() {
  const { colors } = useDesignTokens();
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(BREATHING_CYCLES[0].duration);
  const scaleAnim = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseHandledRef = useRef(false);
  const breathingStyles = useMemo(() => createBreathingStyles(colors), [colors]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startBreathingCycle = useCallback((cycleIndex: number) => {
    clearTimer();
    phaseHandledRef.current = false;
    const cycle = BREATHING_CYCLES[cycleIndex];
    setTimeRemaining(cycle.duration);

    // Animate scale based on phase using Reanimated (runs on UI thread)
    if (cycle.phase === 'Breathe In') {
      scaleAnim.value = withTiming(1.2, {
        duration: cycle.duration,
        easing: Easing.inOut(Easing.ease),
      });
    } else if (cycle.phase === 'Breathe Out') {
      scaleAnim.value = withTiming(1, {
        duration: cycle.duration,
        easing: Easing.inOut(Easing.ease),
      });
    }

    // Haptic feedback
    if (cycle.phase === 'Breathe In' || cycle.phase === 'Breathe Out') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 100;
      const remaining = Math.max(0, cycle.duration - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && !phaseHandledRef.current) {
        phaseHandledRef.current = true;
        clearTimer();
        const nextCycle = (cycleIndex + 1) % BREATHING_CYCLES.length;
        setCurrentCycle(nextCycle);
      }
    }, 100);
  }, [scaleAnim, clearTimer]);

  useEffect(() => {
    if (isRunning) {
      startBreathingCycle(currentCycle);
    }
    return clearTimer;
  }, [isRunning, currentCycle, startBreathingCycle, clearTimer]);

  const handleStart = () => {
    setCurrentCycle(0);
    setIsRunning(true);
  };

  const handleStop = () => {
    clearTimer();
    setIsRunning(false);
    setCurrentCycle(0);
    setTimeRemaining(BREATHING_CYCLES[0].duration);
    scaleAnim.value = withTiming(1, { duration: 200 });
  };

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const currentPhase = BREATHING_CYCLES[currentCycle];
  const secondsRemaining = Math.ceil(timeRemaining / 1000);

  return (
    <Screen>
      <View style={breathingStyles.container}>
        <Text style={breathingStyles.subtitle}>
          Take a moment to center yourself. This exercise can help reduce cravings.
        </Text>

        <View style={breathingStyles.exerciseContainer}>
          <Animated.View
            style={[
              breathingStyles.circle,
              animatedCircleStyle,
            ]}>
            <Text style={breathingStyles.phaseText}>{currentPhase.phase}</Text>
            {isRunning && (
              <Text style={breathingStyles.timerText}>{secondsRemaining}s</Text>
            )}
          </Animated.View>

          <Text style={breathingStyles.instruction}>{currentPhase.instruction}</Text>

          {!isRunning && (
            <TouchableOpacity
              style={breathingStyles.startButton}
              onPress={handleStart}
              accessibilityRole="button"
              accessibilityLabel="Start breathing exercise"
              accessibilityHint="Starts a guided breathing cycle.">
              <Text style={breathingStyles.startButtonText}>Start</Text>
            </TouchableOpacity>
          )}

          {isRunning && (
            <TouchableOpacity
              style={breathingStyles.stopButton}
              onPress={handleStop}
              accessibilityRole="button"
              accessibilityLabel="Stop breathing exercise"
              accessibilityHint="Stops the exercise.">
              <Text style={breathingStyles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={breathingStyles.infoBox}>
          <Text style={breathingStyles.infoText}>
            Complete a few cycles. You can stop anytime. This is a tool to help you pause and
            refocus.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const createBreathingStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
    paddingHorizontal: 0,
    paddingBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.normal,
    textAlign: 'center',
  },
  exerciseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    paddingTop: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  phaseText: {
    fontSize: typography.sizes.xl,
    fontWeight: `${typography.weights.semibold}`,
    color: colors.onPrimary,
    marginBottom: spacing.sm,
  },
  timerText: {
    fontSize: typography.sizes.lg,
    color: colors.onPrimary,
    opacity: 0.9,
  },
  instruction: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
  },
  startButtonText: {
    color: colors.onPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: `${typography.weights.semibold}`,
  },
  stopButton: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  stopButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: `${typography.weights.semibold}`,
  },
  infoBox: {
    backgroundColor: colors.background.muted,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeights.tight,
    textAlign: 'center',
  },
});
