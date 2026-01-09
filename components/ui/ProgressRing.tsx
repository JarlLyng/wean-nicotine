import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { colors, typography, spacing, animations } from '@/lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  color?: string;
  backgroundColor?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  label,
  sublabel,
  color = colors.accent.primary,
  backgroundColor = colors.neutral[200],
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Animated progress value
  const animatedProgress = useSharedValue(0);

  // Animate progress changes
  useEffect(() => {
    const clampedProgress = Math.max(0, Math.min(1, progress));
    animatedProgress.value = withTiming(clampedProgress, {
      duration: animations.normal,
      easing: Easing.bezier(0.4, 0, 0.2, 1), // easeInOut
    });
  }, [progress]);

  // Animated props for the progress circle
  const animatedCircleProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - animatedProgress.value);
    return {
      strokeDashoffset,
    };
  });

  const displayLabel = label !== undefined ? label : `${Math.round(progress * 100)}%`;

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle - animated */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            animatedProps={animatedCircleProps}
          />
        </Svg>
        {showLabel && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{displayLabel}</Text>
            {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography['2xl'],
    fontWeight: '700',
    color: colors.text.primary,
  },
  sublabel: {
    ...typography.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});
