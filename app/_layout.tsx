import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text, StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import 'react-native-reanimated';

import { initSentry } from '@/lib/sentry';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppInitialize } from '@/hooks/useAppInitialize';
import { spacing, typography } from '@/lib/theme';
import { useDesignTokens, designTokens } from '@/lib/design';

// Override React Navigation theme backgrounds to match our design tokens.
// Default themes use rgb(242,242,242) / rgb(1,1,1) which differ from our
// pure white / pure black, creating a visible mismatch behind the tab bar.
const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: designTokens.colors.modes.light.background.app,
    card: designTokens.colors.modes.light.background.app,
  },
};

const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: designTokens.colors.modes.dark.background.app,
    card: designTokens.colors.modes.dark.background.app,
  },
};

// Init Sentry before first render so early crashes and ErrorBoundary errors are captured
if (Platform.OS !== 'web') {
  initSentry();
}

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
      <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
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
      <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
