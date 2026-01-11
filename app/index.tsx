import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Platform, InteractionManager } from 'react-native';
import { initDatabase } from '@/lib/db';
import { hasTaperSettings } from '@/lib/db-settings';
import { captureError } from '@/lib/sentry';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Wait for navigation to be ready before attempting to navigate
    const navigationReady = InteractionManager.runAfterInteractions(() => {
      // Skip database initialization on web
      if (Platform.OS === 'web') {
        // On web, always go to onboarding since we can't check settings
        // Use setTimeout to ensure navigation is ready
        setTimeout(() => {
          router.replace('/(onboarding)/welcome');
        }, 100);
        return;
      }

      // Ensure database is initialized before checking settings
      initDatabase()
        .then(() => {
          // Check if user has completed onboarding
          return hasTaperSettings();
        })
        .then((hasSettings) => {
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            if (hasSettings) {
              router.replace('/(tabs)/home');
            } else {
              router.replace('/(onboarding)/welcome');
            }
          }, 100);
        })
        .catch((error) => {
          console.error('Error initializing app:', error);
          // Capture error in Sentry
          if (error instanceof Error) {
            captureError(error, { context: 'app_index_initialization' });
          }
          // Default to onboarding on error
          setTimeout(() => {
            router.replace('/(onboarding)/welcome');
          }, 100);
        });
    });

    return () => {
      // Cleanup if component unmounts
      navigationReady.cancel();
    };
  }, [router]);

  return null;
}
