import { Stack } from 'expo-router';
import { useDesignTokens } from '@/lib/design';

export default function SettingsLayout() {
  const { colors } = useDesignTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background.app },
        headerTintColor: colors.text.primary,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
      }}>
      <Stack.Screen
        name="index"
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="reset-taper"
        options={{ title: 'Start Over' }}
      />
    </Stack>
  );
}
