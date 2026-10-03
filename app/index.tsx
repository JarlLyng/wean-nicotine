import { useEffect, useState } from 'react';
import { Redirect, type Href } from 'expo-router';
import { Platform } from 'react-native';
import { hasTaperSettings } from '@/lib/db-settings';
import { captureError } from '@/lib/sentry';

const HOME: Href = '/(tabs)/home';
const WELCOME: Href = '/(onboarding)/welcome';

/**
 * Entry route: send people with a plan to Home and everyone else to
 * onboarding. <Redirect> navigates once the navigator is ready, so no
 * InteractionManager wait or fixed delay is needed before it (#94).
 */
export default function Index() {
  // On web there is no database, so go straight to onboarding
  const [destination, setDestination] = useState<Href | null>(
    Platform.OS === 'web' ? WELCOME : null,
  );

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;

    // getDatabase() (used by hasTaperSettings) shares init with root layout; no duplicate init
    hasTaperSettings()
      .then((hasSettings) => {
        if (!cancelled) setDestination(hasSettings ? HOME : WELCOME);
      })
      .catch((error) => {
        if (__DEV__) {
          console.error('Error initializing app:', error);
        }
        if (error instanceof Error) {
          captureError(error, { context: 'app_index_initialization' });
        }
        if (!cancelled) setDestination(WELCOME);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!destination) return null;
  return <Redirect href={destination} />;
}
