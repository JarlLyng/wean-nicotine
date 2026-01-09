import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Icon } from '@/components/ui/Icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/lib/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accentStart,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.neutral[200],
          ...Platform.select({
            ios: {
              paddingBottom: 20,
              height: 88,
            },
            android: {
              paddingBottom: 8,
              height: 60,
            },
          }),
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <Icon name="house" size={24} color={color} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <Icon name="chart-line-up" size={24} color={color} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color }) => <Icon name="heart" size={24} color={color} weight="fill" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Icon name="gear" size={24} color={color} weight="fill" />,
        }}
      />
    </Tabs>
  );
}
