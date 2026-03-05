import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Platform, InteractionManager } from 'react-native';
import { hasTaperSettings } from '@/lib/db-settings';
import { captureError } from '@/lib/sentry';

export default function Index() {
  const router = useRouter();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Wait for navigation to be ready before attempting to navigate
    const navigationReady = InteractionManager.runAfterInteractions(() => {
      // Skip database initialization on web
      if (Platform.OS === 'web') {
        const timer = setTimeout(() => {
          if (isMounted.current) router.replace('/(onboarding)/welcome');
        }, 100);
        return () => clearTimeout(timer);
      }

      // getDatabase() (used by hasTaperSettings) shares init with root layout; no duplicate init
      hasTaperSettings()
        .then((hasSettings) => {
          setTimeout(() => {
            if (!isMounted.current) return;
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
          setTimeout(() => {
            if (isMounted.current) router.replace('/(onboarding)/welcome');
          }, 100);
        });
    });

    return () => {
      isMounted.current = false;
      navigationReady.cancel();
    };
  }, [router]);

  return null;
}
