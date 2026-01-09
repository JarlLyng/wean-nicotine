import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { initDatabase } from '@/lib/db';
import { hasTaperSettings } from '@/lib/db-settings';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Skip database initialization on web
    if (Platform.OS === 'web') {
      // On web, always go to onboarding since we can't check settings
      router.replace('/(onboarding)/welcome');
      return;
    }

    // Ensure database is initialized before checking settings
    initDatabase()
      .then(() => {
        // Check if user has completed onboarding
        return hasTaperSettings();
      })
      .then((hasSettings) => {
        if (hasSettings) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(onboarding)/welcome');
        }
      })
      .catch((error) => {
        console.error('Error initializing app:', error);
        // Default to onboarding on error
        router.replace('/(onboarding)/welcome');
      });
  }, [router]);

  return null;
}
