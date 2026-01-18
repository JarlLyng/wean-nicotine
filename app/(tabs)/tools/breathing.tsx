import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Screen } from '@/components/Screen';
import { spacing } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathingStyles = createBreathingStyles(colors);

  const startBreathingCycle = useCallback(() => {
    const cycle = BREATHING_CYCLES[currentCycle];
    setTimeRemaining(cycle.duration);

    // Animate scale based on phase
    if (cycle.phase === 'Breathe In') {
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: cycle.duration,
        useNativeDriver: true,
      }).start();
    } else if (cycle.phase === 'Breathe Out') {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: cycle.duration,
        useNativeDriver: true,
      }).start();
    }

    // Haptic feedback
    if (cycle.phase === 'Breathe In' || cycle.phase === 'Breathe Out') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 100;
      const remaining = Math.max(0, cycle.duration - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        // Move to next cycle
        const nextCycle = (currentCycle + 1) % BREATHING_CYCLES.length;
        setCurrentCycle(nextCycle);
      }
    }, 100);
  }, [currentCycle, scaleAnim]);

  useEffect(() => {
    if (isRunning) {
      startBreathingCycle();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      scaleAnim.setValue(1);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, currentCycle, startBreathingCycle, scaleAnim]);

  const handleStart = () => {
    setIsRunning(true);
    setCurrentCycle(0);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentCycle(0);
    setTimeRemaining(BREATHING_CYCLES[0].duration);
  };

  const currentPhase = BREATHING_CYCLES[currentCycle];
  const secondsRemaining = Math.ceil(timeRemaining / 1000);

  return (
    <Screen>
      <View style={breathingStyles.container}>
        <Text style={breathingStyles.title}>Breathing Exercise</Text>
        <Text style={breathingStyles.subtitle}>
          Take a moment to center yourself. This exercise can help reduce cravings.
        </Text>

        <View style={breathingStyles.exerciseContainer}>
          <Animated.View
            style={[
              breathingStyles.circle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}>
            <Text style={breathingStyles.phaseText}>{currentPhase.phase}</Text>
            {isRunning && (
              <Text style={breathingStyles.timerText}>{secondsRemaining}s</Text>
            )}
          </Animated.View>

          <Text style={breathingStyles.instruction}>{currentPhase.instruction}</Text>

          {!isRunning && (
            <TouchableOpacity style={breathingStyles.startButton} onPress={handleStart}>
              <Text style={breathingStyles.startButtonText}>Start</Text>
            </TouchableOpacity>
          )}

          {isRunning && (
            <TouchableOpacity style={breathingStyles.stopButton} onPress={handleStop}>
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
    padding: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.onPrimary,
    marginBottom: spacing.sm,
  },
  timerText: {
    fontSize: 18,
    color: colors.onPrimary,
    opacity: 0.9,
  },
  instruction: {
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  startButtonText: {
    color: colors.onPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: colors.background.card,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  stopButtonText: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.background.muted,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
});
