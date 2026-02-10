import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Platform, InteractionManager } from 'react-native';
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

      // getDatabase() (used by hasTaperSettings) shares init with root layout; no duplicate init
      hasTaperSettings()
        .then((hasSettings) => {
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
          if (error instanceof Error) {
            captureError(error, { context: 'app_index_initialization' });
          }
          setTimeout(() => router.replace('/(onboarding)/welcome'), 100);
        });
    });

    return () => {
      // Cleanup if component unmounts
      navigationReady.cancel();
    };
  }, [router]);

  return null;
}
