import { Stack } from 'expo-router';

export default function ToolsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="breathing" />
      <Stack.Screen name="urge-surfing" />
      <Stack.Screen name="reflection" />
    </Stack>
  );
}
