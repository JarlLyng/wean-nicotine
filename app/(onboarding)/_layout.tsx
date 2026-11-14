import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDesignTokens } from '@/lib/design';

export default function OnboardingLayout() {
  const { colors } = useDesignTokens();
  const { bottom } = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background.app },
        headerTintColor: colors.text.primary,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
        // Android draws the app under the gesture bar, and these screens have
        // no tab bar to keep Continue and Skip above it (#435). On iOS the
        // scroll views already make room for the home indicator.
        ...(Platform.OS === 'android' && {
          contentStyle: { paddingBottom: bottom, backgroundColor: colors.background.app },
        }),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ title: '' }} />
      <Stack.Screen name="baseline" options={{ title: 'Step 1 of 4' }} />
      <Stack.Screen name="pace" options={{ title: 'Step 2 of 4' }} />
      <Stack.Screen name="price" options={{ title: 'Step 3 of 4' }} />
      <Stack.Screen name="triggers" options={{ title: 'Step 4 of 4' }} />
    </Stack>
  );
}
