import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppInitialize } from '@/hooks/useAppInitialize';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens } from '@/lib/design';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Initialize app (database, analytics)
  useAppInitialize();

  // Note: On web, database won't work but UI can still be viewed for design purposes

  // Error boundary fallback component
  const ErrorFallback = ({ error }: { error: unknown; componentStack: string; eventId: string; resetError(): void }) => {
    const { colors } = useDesignTokens();
    const errorStyles = createErrorStyles(colors);
    const message = error instanceof Error ? error.toString() : String(error);
    return (
      <View style={errorStyles.errorContainer}>
        <Text style={errorStyles.errorTitle}>Something went wrong</Text>
        <Text style={errorStyles.errorText}>
          The app encountered an unexpected error. Please restart the app.
        </Text>
        {__DEV__ && Boolean(error) && (
          <Text style={errorStyles.errorDetails}>{message}</Text>
        )}
      </View>
    );
  };

  // Wrap app with Sentry ErrorBoundary (skip on web)
  if (Platform.OS === 'web') {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}

const createErrorStyles = (colors: ReturnType<typeof useDesignTokens>['colors']) => StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface.default,
  },
  errorTitle: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorDetails: {
    ...typography.sm,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontFamily: 'monospace',
  },
});
