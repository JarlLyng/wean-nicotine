/**
 * Sentry error tracking and monitoring
 * Configured for React Native/Expo
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** True only when we had a DSN and called Sentry.init() – use to show "not configured" in Diagnostics. */
let sentryInitialized = false;

/**
 * Whether Sentry was initialized with a DSN in this build (for Diagnostics UI).
 */
export function isSentryConfigured(): boolean {
  return sentryInitialized;
}

/**
 * Initialize Sentry
 * Call this early in app lifecycle (in app/_layout.tsx or index.tsx)
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
    debug: __DEV__, // Enable debug mode in development
    environment: __DEV__ ? 'development' : 'production',
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000, // 30 seconds
    tracesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% in dev, 10% in production
    // Attach app version and build info
    release: Constants.expoConfig?.version || '1.0.0',
    dist: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString() || undefined,
    // Filter out common non-critical errors
    beforeSend(event, hint) {
      // Only send events in production builds
      // In development, we log to console instead
      if (__DEV__) {
        console.log('Sentry event (dev mode - not sent):', event);
        return null; // Don't send events in development
      }
      return event;
    },
    // Configure integrations
    // Note: ReactNativeTracing is not available in @sentry/react-native v7
    // Basic error tracking works without it
    integrations: [],
  });

  // Set user context if available (optional)
  // Sentry.setUser({ id: 'user-id', email: 'user@example.com' });
}

/**
 * Log an error to Sentry
 */
export function captureError(error: Error, context?: Record<string, any>): void {
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
  data?: Record<string, any>;
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
