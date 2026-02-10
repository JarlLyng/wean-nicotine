/**
 * Custom hook for app initialization
 * Handles Sentry, database and analytics setup on app launch
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { initSentry, captureError } from '@/lib/sentry';
import { initDatabase } from '@/lib/db';
import { initAnalytics, logEvent, clearOldAnalytics } from '@/lib/analytics';

export function useAppInitialize() {
  useEffect(() => {
    // Initialize Sentry first (before any other operations)
    initSentry();

    // Skip database initialization on web
    if (Platform.OS === 'web') {
      console.warn('Taper is designed for mobile devices only. SQLite is not available on web.');
      return;
    }

    // Initialize database on app start (single init; safe for concurrent callers)
    initDatabase()
      .then(() => initAnalytics())
      .then(() => clearOldAnalytics())
      .then(() => {
        logEvent('app_launched');
      })
      .catch((error) => {
        console.error('Failed to initialize:', error);
        // Capture initialization errors in Sentry
        captureError(error, {
          context: 'app_initialization',
        });
      });
  }, []);
}
