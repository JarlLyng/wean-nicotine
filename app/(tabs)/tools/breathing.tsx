import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { spacing } from '@/lib/theme';
import { useDesignTokens, typography } from '@/lib/design';
import { saveBreathingSession, getBreathingSessionCount } from '@/lib/db-breathing';
import { captureError } from '@/lib/sentry';
import * as Haptics from 'expo-haptics';
import type { BreathingPattern } from '@/lib/models';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── Breathing Patterns ──────────────────────────────────────────────
interface Phase {
  phase: string;
  duration: number; // ms
  instruction: string;
}

interface PatternConfig {
  label: string;
  phases: Phase[];
}

const PATTERNS: Record<BreathingPattern, PatternConfig> = {
  default: {
    label: 'Relaxing',
    phases: [
      { phase: 'Breathe In', duration: 4000, instruction: 'Slowly breathe in through your nose' },
      { phase: 'Hold', duration: 2000, instruction: 'Hold your breath gently' },
      { phase: 'Breathe Out', duration: 6000, instruction: 'Slowly breathe out through your mouth' },
      { phase: 'Pause', duration: 2000, instruction: 'Take a moment' },
    ],
  },
  '4-7-8': {
    label: '4-7-8 Sleep',
    phases: [
      { phase: 'Breathe In', duration: 4000, instruction: 'Breathe in through your nose' },
      { phase: 'Hold', duration: 7000, instruction: 'Hold your breath' },
      { phase: 'Breathe Out', duration: 8000, instruction: 'Exhale slowly through your mouth' },
    ],
  },
  box: {
    label: 'Box',
    phases: [
      { phase: 'Breathe In', duration: 4000, instruction: 'Breathe in slowly' },
      { phase: 'Hold', duration: 4000, instruction: 'Hold your breath' },
      { phase: 'Breathe Out', duration: 4000, instruction: 'Breathe out slowly' },
      { phase: 'Hold', duration: 4000, instruction: 'Hold before the next breath' },
    ],
  },
  'quick-calm': {
    label: 'Quick Calm',
    phases: [
      { phase: 'Breathe In', duration: 3000, instruction: 'Breathe in deeply' },
      { phase: 'Breathe Out', duration: 3000, instruction: 'Let it all out slowly' },
    ],
  },
};

const DURATIONS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

const RING_SIZE = 220;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function BreathingExercise() {
  const { colors } = useDesignTokens();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>('default');
  const [selectedDuration, setSelectedDuration] = useState(180); // 3 min default
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  const scaleAnim = useSharedValue(1);
  const ringProgress = useSharedValue(0);
  const ringPulse = useSharedValue(STROKE_WIDTH);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseHandledRef = useRef(false);
  const hapticTickRef = useRef(0);

  const pattern = PATTERNS[selectedPattern];
  const currentPhase = pattern.phases[currentCycle];
  const s = useMemo(() => createStyles(colors), [colors]);

  // Load session count
  useFocusEffect(
    useCallback(() => {
      getBreathingSessionCount().then(setSessionCount).catch(captureError);
    }, []),
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPhase = useCallback(
    (cycleIndex: number, elapsed: number) => {
      clearTimer();
      phaseHandledRef.current = false;
      hapticTickRef.current = 0;
      const phase = pattern.phases[cycleIndex];
      setTimeRemaining(phase.duration);

      // Scale animation
      if (phase.phase === 'Breathe In') {
        scaleAnim.value = withTiming(1.15, {
          duration: phase.duration,
          easing: Easing.inOut(Easing.ease),
        });
        ringPulse.value = withTiming(STROKE_WIDTH + 6, {
          duration: phase.duration,
          easing: Easing.inOut(Easing.ease),
        });
      } else if (phase.phase === 'Breathe Out') {
        scaleAnim.value = withTiming(1, {
          duration: phase.duration,
          easing: Easing.inOut(Easing.ease),
        });
        ringPulse.value = withTiming(STROKE_WIDTH, {
          duration: phase.duration,
          easing: Easing.inOut(Easing.ease),
        });
      }

      // Phase-start haptic
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      let phaseElapsed = 0;
      timerRef.current = setInterval(() => {
        phaseElapsed += 100;
        hapticTickRef.current += 100;

        // Rhythmic haptic every second during inhale/exhale
        if (
          hapticTickRef.current >= 1000 &&
          (phase.phase === 'Breathe In' || phase.phase === 'Breathe Out')
        ) {
          hapticTickRef.current = 0;
          Haptics.selectionAsync().catch(() => {});
        }

        const remaining = Math.max(0, phase.duration - phaseElapsed);
        const newTotal = elapsed + phaseElapsed;
        setTimeRemaining(remaining);
        setTotalElapsed(newTotal);

        // Update ring progress
        ringProgress.value = Math.min(1, newTotal / (selectedDuration * 1000));

        // Check if session is done
        if (newTotal >= selectedDuration * 1000) {
          clearTimer();
          setIsRunning(false);
          setIsComplete(true);
          scaleAnim.value = withTiming(1, { duration: 300 });
          ringPulse.value = withTiming(STROKE_WIDTH, { duration: 300 });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          // Save session
          saveBreathingSession(selectedPattern, selectedDuration)
            .then(() => getBreathingSessionCount())
            .then(setSessionCount)
            .catch(captureError);
          return;
        }

        // Check if phase is done
        if (remaining === 0 && !phaseHandledRef.current) {
          phaseHandledRef.current = true;
          clearTimer();
          const nextCycle = (cycleIndex + 1) % pattern.phases.length;
          setCurrentCycle(nextCycle);
        }
      }, 100);
    },
    [pattern, selectedPattern, selectedDuration, scaleAnim, ringPulse, ringProgress, clearTimer],
  );

  // React to cycle changes while running
  useEffect(() => {
    if (isRunning && !isComplete) {
      startPhase(currentCycle, totalElapsed);
    }
    return clearTimer;
    // totalElapsed is read but should not re-trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, currentCycle, startPhase, clearTimer, isComplete]);

  const handleStart = () => {
    setCurrentCycle(0);
    setTotalElapsed(0);
    setIsComplete(false);
    ringProgress.value = 0;
    setIsRunning(true);
  };

  const handleStop = () => {
    clearTimer();
    setIsRunning(false);
    setCurrentCycle(0);
    setTimeRemaining(0);
    setTotalElapsed(0);
    ringProgress.value = 0;
    scaleAnim.value = withTiming(1, { duration: 200 });
    ringPulse.value = withTiming(STROKE_WIDTH, { duration: 200 });
  };

  const handleDone = () => {
    setIsComplete(false);
    setTotalElapsed(0);
    ringProgress.value = 0;
  };

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - ringProgress.value),
    strokeWidth: ringPulse.value,
  }));

  const secondsRemaining = Math.ceil(timeRemaining / 1000);
  const showSetup = !isRunning && !isComplete;

  return (
    <Screen>
      <View style={s.container}>
        {/* Setup: pattern + duration selectors */}
        {showSetup && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text style={s.subtitle}>
              Choose a pattern and duration, then press start.
            </Text>

            {/* Pattern pills */}
            <View style={s.pillRow}>
              {(Object.keys(PATTERNS) as BreathingPattern[]).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[s.pill, selectedPattern === key && s.pillActive]}
                  onPress={() => setSelectedPattern(key)}>
                  <Text style={[s.pillText, selectedPattern === key && s.pillTextActive]}>
                    {PATTERNS[key].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Duration pills */}
            <View style={s.pillRow}>
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d.seconds}
                  style={[s.pill, selectedDuration === d.seconds && s.pillActive]}
                  onPress={() => setSelectedDuration(d.seconds)}>
                  <Icon
                    name="clock"
                    size={14}
                    color={selectedDuration === d.seconds ? colors.onPrimary : colors.text.secondary}
                  />
                  <Text style={[s.pillText, selectedDuration === d.seconds && s.pillTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Breathing ring */}
        <View style={s.ringArea}>
          <Animated.View style={animatedScale}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={colors.background.muted}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={colors.primary}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeLinecap="round"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                animatedProps={animatedRingProps}
              />
            </Svg>
            <View style={s.ringLabel}>
              {isRunning && (
                <>
                  <Text style={s.phaseText}>{currentPhase.phase}</Text>
                  <Text style={s.timerText}>{secondsRemaining}s</Text>
                </>
              )}
              {isComplete && (
                <Animated.View entering={FadeIn.duration(300)} style={s.completeContainer}>
                  <Icon name="check-circle" size={36} color={colors.success} />
                  <Text style={s.completeText}>Done!</Text>
                </Animated.View>
              )}
              {showSetup && (
                <Icon name="wind" size={48} color={colors.primary} weight="duotone" />
              )}
            </View>
          </Animated.View>

          {isRunning && (
            <Text style={s.instruction}>{currentPhase.instruction}</Text>
          )}
        </View>

        {/* Buttons */}
        <View style={s.buttonArea}>
          {showSetup && (
            <Button title="Start" onPress={handleStart} />
          )}
          {isRunning && (
            <Button title="Stop" variant="secondary" onPress={handleStop} />
          )}
          {isComplete && (
            <Button title="Done" onPress={handleDone} />
          )}
        </View>

        {/* Session counter */}
        {showSetup && sessionCount > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={s.sessionBox}>
            <Icon name="check-circle" size={16} color={colors.text.secondary} />
            <Text style={s.sessionText}>
              {sessionCount} session{sessionCount !== 1 ? 's' : ''} completed
            </Text>
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    subtitle: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      lineHeight: typography.lineHeights.normal,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    pillRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 9999,
      backgroundColor: colors.background.muted,
    },
    pillActive: {
      backgroundColor: colors.primary,
    },
    pillText: {
      fontSize: typography.sizes.sm,
      fontWeight: '500' as const,
      color: colors.text.secondary,
    },
    pillTextActive: {
      color: colors.onPrimary,
    },
    ringArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ringLabel: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    phaseText: {
      fontSize: typography.sizes.xl,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.text.primary,
      marginBottom: 2,
    },
    timerText: {
      fontSize: typography.sizes.lg,
      color: colors.text.secondary,
    },
    instruction: {
      fontSize: typography.sizes.base,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    completeContainer: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    completeText: {
      fontSize: typography.sizes.xl,
      fontWeight: `${typography.weights.semibold}`,
      color: colors.success,
    },
    buttonArea: {
      paddingTop: spacing.md,
    },
    sessionBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    sessionText: {
      fontSize: typography.sizes.sm,
      color: colors.text.secondary,
    },
  });
