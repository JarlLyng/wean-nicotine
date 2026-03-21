import { Stack } from 'expo-router';
import { useDesignTokens } from '@/lib/design';

export default function OnboardingLayout() {
  const { colors } = useDesignTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background.app },
        headerTintColor: colors.text.primary,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ title: '' }} />
      <Stack.Screen name="baseline" options={{ title: 'Step 1 of 3' }} />
      <Stack.Screen name="price" options={{ title: 'Step 2 of 3' }} />
      <Stack.Screen name="triggers" options={{ title: 'Step 3 of 3' }} />
    </Stack>
  );
}
