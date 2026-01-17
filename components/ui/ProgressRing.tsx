import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { typography, spacing, animations } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

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
  useGradient?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
  label,
  sublabel,
  color,
  backgroundColor,
  useGradient = false,
}: ProgressRingProps) {
  const { colors } = useDesignTokens();
  const defaultColor = color || colors.primary;
  const defaultBackgroundColor = backgroundColor || colors.background.muted;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  // Animated progress value
  const animatedProgress = useSharedValue(0);

  // Animate progress changes
  useEffect(() => {
    // Guard against NaN and Infinity
    let safeProgress = progress;
    if (!Number.isFinite(progress) || isNaN(progress)) {
      safeProgress = 0;
    }
    const clampedProgress = Math.max(0, Math.min(1, safeProgress));
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

  // Guard against NaN/Infinity in label calculation
  const safeProgress = Number.isFinite(progress) && !isNaN(progress) ? progress : 0;
  const displayLabel = label !== undefined ? label : `${Math.round(safeProgress * 100)}%`;
  const gradientId = 'progressGradient';
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Defs>
            {useGradient && (
              <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="50%" stopColor={colors.primary} stopOpacity="0.8" />
                <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
              </LinearGradient>
            )}
          </Defs>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={defaultBackgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle - animated */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={useGradient ? `url(#${gradientId})` : defaultColor}
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

// Styles are created inside component to access colors from hook
const createStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
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
