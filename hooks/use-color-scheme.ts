import { useEffect, useState } from 'react';
import {
  getPreferredColorSchemeSync,
  hydratePreferredColorScheme,
  subscribePreferredColorScheme,
  type PreferredColorScheme,
} from '@/lib/color-scheme';

export function useColorScheme(): PreferredColorScheme {
  const [scheme, setScheme] = useState<PreferredColorScheme>(getPreferredColorSchemeSync());

  useEffect(() => {
    hydratePreferredColorScheme();
    return subscribePreferredColorScheme(setScheme);
  }, []);

  return scheme;
}
