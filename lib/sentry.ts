/**
 * Sentry error tracking and monitoring
 * Configured for React Native/Expo
 *
 * Setup:
 * - Early init in app/_layout.tsx (before first render)
 * - Root component wrapped with Sentry.wrap() for native crash capture
 * - Sentry.ErrorBoundary wraps the React tree for JS error fallback
 * - captureError() called in every production catch-block
 */

import * as Sentry from '@sentry/react-native';
import { reactNavigationIntegration } from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** True only when we had a DSN and called Sentry.init() – use to show "not configured" in Diagnostics. */
let sentryInitialized = false;

/**
 * React Navigation integration instance — created once so the root layout can call
 * `registerNavigationContainer()` on it after the navigation ref is ready.
 */
export const navigationIntegration = Platform.OS !== 'web'
  ? reactNavigationIntegration({ enableTimeToInitialDisplay: true })
  : undefined;

/**
 * Whether Sentry was initialized with a DSN in this build (for Diagnostics UI).
 */
export function isSentryConfigured(): boolean {
  return sentryInitialized;
}

/**
 * Initialize Sentry
 * Call this early in app lifecycle (in app/_layout.tsx before first render)
 */
export function initSentry(): void {
  // Skip Sentry initialization on web (Sentry React Native doesn't support web)
  if (Platform.OS === 'web') {
    return;
  }

  // DSN: prefer env (Metro inlining), fallback to extra from app.config.js (set at EAS build time).
  // EAS env vars are injected when EAS runs the build; app.config.js reads them and extra is embedded.
  const dsn =
    process.env.EXPO_PUBLIC_SENTRY_DSN ||
    (Constants.expoConfig?.extra as { sentryDsn?: string } | undefined)?.sentryDsn ||
    '';

  if (!dsn || dsn.trim() === '') {
    if (__DEV__) {
      console.warn('Sentry DSN not configured. Set EXPO_PUBLIC_SENTRY_DSN (EAS env or .env).');
    }
    return;
  }

  sentryInitialized = true;
  Sentry.init({
    dsn,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% of transactions in production (was 10%)
    // Attach app version and build info
    release: Constants.expoConfig?.version || '1.0.0',
    dist: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString() || undefined,
    beforeSend(event) {
      // In development, log but don't send
      if (__DEV__) {
        console.log('Sentry event (dev mode - not sent):', event.exception?.values?.[0]?.value ?? event.message);
        return null;
      }
      return event;
    },
    // Default integrations (ANR detection, app start, native crashes, screenshots)
    // are included automatically. We add React Navigation tracking on top.
    integrations: navigationIntegration ? [navigationIntegration] : [],
  });
}

/**
 * Log an error to Sentry
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  if (Platform.OS === 'web' || !sentryInitialized) {
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Log a message to Sentry
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (Platform.OS === 'web' || !sentryInitialized) {
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string; username?: string } | null): void {
  if (Platform.OS === 'web' || !sentryInitialized) {
    return;
  }

  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}): void {
  if (Platform.OS === 'web' || !sentryInitialized) {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Test Sentry integration by sending a test error
 * Use this to verify that Sentry is working correctly
 */
export function testSentry(): void {
  if (Platform.OS === 'web') {
    if (__DEV__) {
      console.log('Sentry test skipped (web platform)');
    }
    return;
  }
  if (!sentryInitialized) {
    if (__DEV__) {
      console.warn('Sentry test skipped (DSN not configured)');
    }
    return;
  }

  try {
    // Send a test message
    captureMessage('Sentry test message - integration working!', 'info');

    // Send a test error
    const testError = new Error('Sentry test error - this is intentional');
    captureError(testError, {
      context: 'sentry_test',
      timestamp: Date.now(),
    });

    if (__DEV__) {
      console.log('✅ Sentry test completed! Check your Sentry dashboard for the test events.');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('❌ Sentry test failed:', error);
    }
  }
}
