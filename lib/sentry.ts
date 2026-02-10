/**
 * Sentry error tracking and monitoring
 * Configured for React Native/Expo
 */

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Initialize Sentry
 * Call this early in app lifecycle (in app/_layout.tsx or index.tsx)
 */
export function initSentry(): void {
  // Skip Sentry initialization on web (Sentry React Native doesn't support web)
  if (Platform.OS === 'web') {
    return;
  }

  // Get DSN from environment variable. If set in production, error/crash data is sent to Sentry.
  // App Store: you must declare this in App Store Connect privacy labels and in your privacy policy.
  // See docs/PRIVACY_APP_STORE.md.
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    if (__DEV__) {
      console.warn('Sentry DSN not configured. Set EXPO_PUBLIC_SENTRY_DSN environment variable.');
    }
    return;
  }

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
  if (Platform.OS === 'web') {
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
  if (Platform.OS === 'web') {
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id?: string; email?: string; username?: string } | null): void {
  if (Platform.OS === 'web') {
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
  if (Platform.OS === 'web') {
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
