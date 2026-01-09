import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { initDatabase } from '@/lib/db';
import { hasTaperSettings } from '@/lib/db-settings';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
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
