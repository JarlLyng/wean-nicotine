import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { spacing, colors } from '@/lib/theme';
import * as Haptics from 'expo-haptics';

const BREATHING_CYCLES = [
  { phase: 'Breathe In', duration: 4000, instruction: 'Slowly breathe in through your nose' },
  { phase: 'Hold', duration: 2000, instruction: 'Hold your breath gently' },
  { phase: 'Breathe Out', duration: 6000, instruction: 'Slowly breathe out through your mouth' },
  { phase: 'Pause', duration: 2000, instruction: 'Take a moment' },
];

export default function BreathingExercise() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(BREATHING_CYCLES[0].duration);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
  }, [isRunning, currentCycle]);

  const startBreathingCycle = () => {
    const cycle = BREATHING_CYCLES[currentCycle];
    setTimeRemaining(cycle.duration);

    // Animate based on phase
    if (cycle.phase === 'Breathe In') {
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: cycle.duration,
        useNativeDriver: true,
      }).start();
    } else if (cycle.phase === 'Breathe Out') {
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: cycle.duration,
        useNativeDriver: true,
      }).start();
    } else {
      // Hold or Pause - maintain current scale (no animation needed)
      // Scale stays at current value
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
  };

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
  const progress = 1 - timeRemaining / currentPhase.duration;
  const secondsRemaining = Math.ceil(timeRemaining / 1000);

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Breathing Exercise</Text>
        <Text style={styles.subtitle}>
          Take a moment to center yourself. This exercise can help reduce cravings.
        </Text>

        <View style={styles.exerciseContainer}>
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}>
            <Text style={styles.phaseText}>{currentPhase.phase}</Text>
            {isRunning && (
              <Text style={styles.timerText}>{secondsRemaining}s</Text>
            )}
          </Animated.View>

          <Text style={styles.instruction}>{currentPhase.instruction}</Text>

          {!isRunning && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          )}

          {isRunning && (
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Complete a few cycles. You can stop anytime. This is a tool to help you pause and
            refocus.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
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
    backgroundColor: colors.accentStart,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  phaseText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text.inverse,
    marginBottom: spacing.sm,
  },
  timerText: {
    fontSize: 18,
    color: colors.text.inverse,
    opacity: 0.9,
  },
  instruction: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  startButton: {
    backgroundColor: colors.accentStart,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  startButtonText: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#666',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
});
