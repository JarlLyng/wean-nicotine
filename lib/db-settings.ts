/**
 * CRUD operations for TaperSettings
 */

import { getDatabase } from './db';
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
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM taper_settings LIMIT 1',
    []
  );

  if (existing && !forceCreate) {
    // Update existing
    console.log('saveTaperSettings: Updating existing settings with ID:', existing.id);
    await db.runAsync(
      `UPDATE taper_settings 
       SET baseline_pouches_per_day = ?,
           price_per_can = ?,
           weekly_reduction_percent = ?,
           start_date = ?,
           updated_at = ?
       WHERE id = ?`,
      [
        settings.baselinePouchesPerDay,
        settings.pricePerCan || null,
        settings.weeklyReductionPercent,
        settings.startDate,
        now,
        existing.id,
      ]
    );
    return existing.id;
  } else {
    // Create new
    console.log('saveTaperSettings: Creating new settings');
    const result = await db.runAsync(
      `INSERT INTO taper_settings 
       (baseline_pouches_per_day, price_per_can, weekly_reduction_percent, start_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        settings.baselinePouchesPerDay,
        settings.pricePerCan || null,
        settings.weeklyReductionPercent,
        settings.startDate,
        now,
        now,
      ]
    );
    console.log('saveTaperSettings: Created new settings with ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  }
}

/**
 * Get current taper settings
 */
export async function getTaperSettings(): Promise<TaperSettings | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{
    id: number;
    baseline_pouches_per_day: number;
    price_per_can: number | null;
    weekly_reduction_percent: number;
    start_date: number;
    created_at: number;
    updated_at: number;
  }>('SELECT * FROM taper_settings LIMIT 1', []);

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    baselinePouchesPerDay: result.baseline_pouches_per_day,
    pricePerCan: result.price_per_can || undefined,
    weeklyReductionPercent: result.weekly_reduction_percent,
    startDate: result.start_date,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

/**
 * Check if settings exist
 */
export async function hasTaperSettings(): Promise<boolean> {
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
