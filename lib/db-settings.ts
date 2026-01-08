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
  settings: Omit<TaperSettings, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const db = await getDatabase();
  const now = Date.now();

  // Check if settings already exist
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM taper_settings LIMIT 1'
  );

  if (existing) {
    // Update existing
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
  }>('SELECT * FROM taper_settings LIMIT 1');

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
