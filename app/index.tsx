import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hasTaperSettings } from '@/lib/db-settings';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has completed onboarding
    hasTaperSettings().then((hasSettings) => {
      if (hasSettings) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(onboarding)');
      }
    });
  }, [router]);

  return null;
}
