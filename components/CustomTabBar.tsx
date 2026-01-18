import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/Icon';
import { borderRadius, shadows, spacing, animations } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface TabItemProps {
  route: any;
  options: any;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  colors: ReturnType<typeof useDesignTokens>['colors'];
}

function TabItem({ route, options, isFocused, onPress, onLongPress, colors }: TabItemProps) {
  const label = options.tabBarLabel ?? options.title ?? route.name;
  
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
      opacity: withTiming(isFocused ? 1 : 0, {
        duration: animations.slow,
      }),
      height: withTiming(isFocused ? 14 : 0, {
        duration: animations.slow,
      }),
      marginTop: withTiming(isFocused ? spacing.xs : 0, {
        duration: animations.slow,
      }),
    };
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}>
      <View style={styles.iconWrapper}>
        <Icon name={getIconName()} size={24} color={color} weight="regular" />
      </View>
      <AnimatedText 
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
        styles.tabBar,
        {
          backgroundColor: colors.surface.default,
          marginHorizontal: spacing.md,
          marginBottom: spacing.sm + insets.bottom,
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
  );
}

// Static styles (colors are applied inline for light/dark mode support)
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    ...shadows.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 64,
    height: 64,
    paddingHorizontal: spacing.sm,
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
    fontSize: 10,
    marginTop: spacing.xs,
    marginBottom: 0,
    textAlign: 'center',
  },
});
