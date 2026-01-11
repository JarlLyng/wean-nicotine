import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppInitialize } from '@/hooks/useAppInitialize';
import { spacing, colors, typography } from '@/lib/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Initialize app (database, analytics)
  useAppInitialize();

  // Note: On web, database won't work but UI can still be viewed for design purposes

  // Error boundary fallback component
  const ErrorFallback = ({ error }: { error: Error }) => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>
        The app encountered an unexpected error. Please restart the app.
      </Text>
      {__DEV__ && error && (
        <Text style={styles.errorDetails}>{error.toString()}</Text>
      )}
    </View>
  );

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

const styles = StyleSheet.create({
  webWarning: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  webWarningTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  webWarningText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
  },
  errorTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorDetails: {
    ...typography.sm,
    color: colors.semantic.error.main,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontFamily: 'monospace',
  },
});
