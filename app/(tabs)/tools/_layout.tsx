import { Stack } from 'expo-router';
import { useDesignTokens } from '@/lib/design';

export default function ToolsLayout() {
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
        options={{ title: 'Tools' }}
      />
      <Stack.Screen
        name="breathing"
        options={{ title: 'Breathing Exercise' }}
      />
      <Stack.Screen
        name="urge-surfing"
        options={{ title: 'Urge Surfing' }}
      />
      <Stack.Screen
        name="reflection"
        options={{ title: 'Reflection' }}
      />
    </Stack>
  );
}
