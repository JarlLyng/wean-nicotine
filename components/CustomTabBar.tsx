import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { BottomTabBarProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import { borderRadius, shadows, spacing, animations } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface TabItemProps {
  route: { name: string; key: string };
  options: BottomTabNavigationOptions;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colors: ReturnType<typeof useDesignTokens>['colors'];
}

function TabItem({ route, options, isFocused, onPress, onLongPress, colors }: TabItemProps) {
  const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
  const label = typeof rawLabel === 'function' ? route.name : rawLabel;
  
  // Get icon name based on route
  const getIconName = () => {
    switch (route.name) {
      case 'home':
        return 'house';
      case 'progress':
        return 'chart-line-up';
      case 'tools':
        return 'heart';
      case 'settings':
        return 'gear';
      default:
        return 'x-circle';
    }
  };

  const color = isFocused ? colors.primary : colors.text.secondary;

  const labelAnimatedStyle = useAnimatedStyle(() => {
    return {
      // Avoid animating height to prevent clipping with Dynamic Type.
      // Keep label space stable and only animate opacity/position.
      opacity: withTiming(isFocused ? 1 : 0.85, {
        duration: animations.slow,
      }),
      transform: [
        {
          translateY: withTiming(isFocused ? 0 : -2, {
            duration: animations.slow,
          }),
        },
      ],
      marginTop: withTiming(spacing.xs, {
        duration: animations.slow,
      }),
    };
  });

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={options.tabBarAccessibilityLabel ?? String(label)}
      accessibilityHint={`Go to ${String(label)} tab.`}
      testID={(options as Record<string, unknown>).tabBarTestID as string | undefined}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}>
      <View style={styles.iconWrapper}>
        <Icon name={getIconName()} size={24} color={color} weight="regular" />
      </View>
      <AnimatedText
        numberOfLines={1}
        style={[styles.tabLabel, { color }, labelAnimatedStyle]}>
        {label}
      </AnimatedText>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useDesignTokens();

  return (
    <View
      style={[
        styles.tabBarOuter,
        {
          paddingHorizontal: spacing.md,
          paddingBottom: spacing.sm + insets.bottom,
        },
      ]}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.surface.default,
            paddingBottom: spacing.sm,
          },
        ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }

            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              options={options}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              colors={colors}
            />
          );
        })}
      </View>
    </View>
  );
}

// Static styles (colors are applied inline for light/dark mode support)
const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    ...shadows.md,
    // Match preview shadow: 0px 2px 8px rgba(0,0,0,0.16)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  iconWrapper: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: spacing.xs,
    marginBottom: 0,
    textAlign: 'center',
  },
});
