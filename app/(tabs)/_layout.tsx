import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomTabBar } from '@/components/CustomTabBar';
import { spacing } from '@/lib/theme';

// Tab bar height: minHeight (64) + paddingVertical (xs*2=8) + paddingBottom (sm=8)
const TAB_BAR_CONTENT_HEIGHT = 64 + spacing.xs * 2 + spacing.sm;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  // Dynamic padding: tab bar content + safe area + outer padding
  const bottomPadding = TAB_BAR_CONTENT_HEIGHT + insets.bottom + spacing.md + spacing.sm;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { paddingBottom: bottomPadding },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Today',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
