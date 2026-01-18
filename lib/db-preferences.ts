/**
 * Simple key/value app preferences stored in SQLite (native only).
 */

import { Platform } from 'react-native';
import { getDatabase } from './db';

export async function getPreference(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_preferences WHERE key = ? LIMIT 1',
    [key]
  );
  return row?.value ?? null;
}

export async function setPreference(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO app_preferences (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}

