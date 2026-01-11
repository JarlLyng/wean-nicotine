import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { initDatabase } from '@/lib/db';
import { hasTaperSettings } from '@/lib/db-settings';

export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    // On web, always go to welcome (database won't work)
    if (Platform.OS === 'web') {
      setTimeout(() => {
        router.replace('/(onboarding)/welcome');
      }, 100);
      return;
    }

    // Ensure database is initialized before checking settings
    initDatabase()
      .then(() => {
        // Check if user has already completed onboarding
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
        console.error('Error checking onboarding status:', error);
        // Default to welcome screen on error
        router.replace('/(onboarding)/welcome');
      });
  }, [router]);

  return null;
}
