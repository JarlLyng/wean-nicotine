import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol.ios';
import { useDesignTokens } from '@/lib/design';

export default function TabLayout() {
  const { colors } = useDesignTokens();

  return (
    <Tabs
      screenOptions={{
        // Native iOS headers
        headerShown: true,
        headerStyle: { backgroundColor: colors.background.app },
        headerTintColor: colors.text.primary,
        headerShadowVisible: false,
        // Tab bar
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface.default,
          borderTopColor: colors.border.subtle,
        },
        // Native haptics on iOS tab press
        ...(Platform.OS === 'ios' && { tabBarHapticFeedbackEnabled: true }),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="house.fill" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="chart.line.uptrend.xyaxis" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          // Tools has its own Stack layout
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="heart.fill" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          // Settings has its own Stack layout
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <IconSymbol name="gearshape.fill" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
