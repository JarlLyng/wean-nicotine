import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { hasTaperSettings } from '@/lib/db-settings';

export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has already completed onboarding
    hasTaperSettings().then((hasSettings) => {
      if (hasSettings) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(onboarding)/welcome');
      }
    });
  }, [router]);

  return null;
}
