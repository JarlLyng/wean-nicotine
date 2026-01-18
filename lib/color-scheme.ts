/**
 * Preferred color scheme store.
 *
 * Requirement:
 * - Default to Dark mode
 * - Allow user to switch to Light mode
 * - Persist choice
 */

import { getPreference, setPreference } from './db-preferences';

export type PreferredColorScheme = 'dark' | 'light';

const STORAGE_KEY = 'preferredColorScheme';

let current: PreferredColorScheme = 'dark';
let hydrated = false;
const listeners = new Set<(scheme: PreferredColorScheme) => void>();

function notify() {
  for (const listener of listeners) listener(current);
}

export function getPreferredColorSchemeSync(): PreferredColorScheme {
  return current;
}

export function subscribePreferredColorScheme(listener: (scheme: PreferredColorScheme) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function hydratePreferredColorScheme(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  const stored = await getPreference(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    current = stored;
  } else {
    current = 'dark';
  }
  notify();
}

export async function setPreferredColorScheme(scheme: PreferredColorScheme): Promise<void> {
  current = scheme;
  notify();
  await setPreference(STORAGE_KEY, scheme);
}

