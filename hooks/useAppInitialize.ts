/**
 * Custom hook for app initialization
 * Handles database and analytics setup on app launch
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import { initDatabase } from '@/lib/db';
import { initAnalytics, logEvent } from '@/lib/analytics';

export function useAppInitialize() {
  useEffect(() => {
    // Skip database initialization on web
    if (Platform.OS === 'web') {
      console.warn('Taper is designed for mobile devices only. SQLite is not available on web.');
      return;
    }

    // Initialize database on app start
    initDatabase()
      .then(() => {
        // Initialize analytics after database is ready
        return initAnalytics();
      })
      .then(() => {
        // Log app launch
        logEvent('app_launched');
      })
      .catch((error) => {
        console.error('Failed to initialize:', error);
      });
  }, []);
}
