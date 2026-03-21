/**
 * CRUD operations for TaperSettings
 */

import { Platform } from 'react-native';
import { getDatabase } from './db';
import { getDummySettings } from './db-web-dummy';
import { captureError } from './sentry';
import type { TaperSettings } from './models';

/**
 * Create or update taper settings
 * Since we only have one user, we'll use a single row approach
 */
export async function saveTaperSettings(
  settings: Omit<TaperSettings, 'id' | 'createdAt' | 'updatedAt'>,
  forceCreate: boolean = false
): Promise<number> {
  const db = await getDatabase();
  const now = Date.now();

  // If forceCreate is true, delete existing first (for fresh start scenarios)
  if (forceCreate) {
    await db.runAsync('DELETE FROM taper_settings');
  }

  // Check if settings already exist
  // Also read triggers so we can preserve them on partial updates.
  const existing = await db.getFirstAsync<{ id: number; triggers: string | null; currency: string | null }>(
    'SELECT id, triggers, currency FROM taper_settings LIMIT 1',
    []
  );

  /**
   * Serialize triggers:
   * - If `settings.triggers` is `undefined`, preserve existing triggers (do not overwrite).
   * - If it's an empty array (or falsy), explicitly clear triggers to `null`.
   * - Otherwise store JSON string.
   */
  const triggersJson =
    settings.triggers === undefined
      ? existing?.triggers ?? null
      : settings.triggers.length > 0
        ? JSON.stringify(settings.triggers)
        : null;

  const currencyValue =
    settings.currency === undefined ? (existing?.currency ?? 'DKK') : settings.currency;

  if (existing && !forceCreate) {
    // Update existing
    if (__DEV__) {
      console.log('saveTaperSettings: Updating existing settings with ID:', existing.id);
    }
    await db.runAsync(
      `UPDATE taper_settings 
       SET baseline_pouches_per_day = ?,
           price_per_can = ?,
           currency = ?,
           weekly_reduction_percent = ?,
           start_date = ?,
           triggers = ?,
           updated_at = ?
       WHERE id = ?`,
      [
        settings.baselinePouchesPerDay,
        settings.pricePerCan ?? null,
        currencyValue,
        settings.weeklyReductionPercent,
        settings.startDate,
        triggersJson,
        now,
        existing.id,
      ]
    );
    return existing.id;
  } else {
    // Create new
    if (__DEV__) {
      console.log('saveTaperSettings: Creating new settings');
    }
    const result = await db.runAsync(
      `INSERT INTO taper_settings 
       (baseline_pouches_per_day, price_per_can, currency, weekly_reduction_percent, start_date, triggers, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        settings.baselinePouchesPerDay,
        settings.pricePerCan ?? null,
        currencyValue,
        settings.weeklyReductionPercent,
        settings.startDate,
        triggersJson,
        now,
        now,
      ]
    );
    if (__DEV__) {
      console.log('saveTaperSettings: Created new settings with ID:', result.lastInsertRowId);
    }
    return result.lastInsertRowId;
  }
}

/**
 * Get current taper settings
 */
export async function getTaperSettings(): Promise<TaperSettings | null> {
  // On web, return dummy data for UI preview
  if (Platform.OS === 'web') {
    return getDummySettings();
  }

  const db = await getDatabase();
  const result = await db.getFirstAsync<{
    id: number;
    baseline_pouches_per_day: number;
    price_per_can: number | null;
    currency: string | null;
    weekly_reduction_percent: number;
    start_date: number;
    triggers: string | null;
    created_at: number;
    updated_at: number;
  }>('SELECT * FROM taper_settings LIMIT 1', []);

  if (!result) {
    return null;
  }

  // Parse triggers JSON string to array
  let triggers: string[] | undefined;
  if (result.triggers) {
    try {
      triggers = JSON.parse(result.triggers);
    } catch (error) {
      if (__DEV__) console.error('Error parsing triggers JSON:', error);
      if (error instanceof Error) captureError(error, { context: 'db_settings_parse_triggers', raw: result.triggers });
      triggers = undefined;
    }
  }

  return {
    id: result.id,
    baselinePouchesPerDay: result.baseline_pouches_per_day,
    pricePerCan: result.price_per_can ?? undefined,
    currency:
      result.currency === 'DKK' ||
        result.currency === 'SEK' ||
        result.currency === 'NOK' ||
        result.currency === 'EUR' ||
        result.currency === 'USD'
        ? result.currency
        : 'DKK',
    weeklyReductionPercent: result.weekly_reduction_percent,
    startDate: result.start_date,
    triggers,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

/**
 * Check if settings exist
 */
export async function hasTaperSettings(): Promise<boolean> {
  // On web, always return true so onboarding doesn't show
  if (Platform.OS === 'web') {
    return true;
  }
  const settings = await getTaperSettings();
  return settings !== null;
}

/**
 * Delete all taper settings (for testing/resetting onboarding)
 */
export async function deleteTaperSettings(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM taper_settings');
}
