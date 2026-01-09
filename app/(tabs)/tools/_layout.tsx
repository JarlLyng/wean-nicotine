import { Stack } from 'expo-router';

export default function ToolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTitle: '',
      }}>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }}
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
