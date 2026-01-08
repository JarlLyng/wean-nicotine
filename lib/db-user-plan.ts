/**
 * CRUD operations for UserPlan
 */

import { getDatabase } from './db';
import type { UserPlan } from './models';

/**
 * Create or update user plan
 * Since we only have one user, we'll use a single row approach
 */
export async function saveUserPlan(
  plan: Omit<UserPlan, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const db = await getDatabase();
  const now = Date.now();

  // Check if plan already exists
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM user_plan LIMIT 1'
  );

  if (existing) {
    // Update existing
    await db.runAsync(
      `UPDATE user_plan 
       SET settings_id = ?,
           current_daily_allowance = ?,
           last_calculated_date = ?,
           updated_at = ?
       WHERE id = ?`,
      [
        plan.settingsId,
        plan.currentDailyAllowance,
        plan.lastCalculatedDate,
        now,
        existing.id,
      ]
    );
    return existing.id;
  } else {
    // Create new
    const result = await db.runAsync(
      `INSERT INTO user_plan 
       (settings_id, current_daily_allowance, last_calculated_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        plan.settingsId,
        plan.currentDailyAllowance,
        plan.lastCalculatedDate,
        now,
        now,
      ]
    );
    return result.lastInsertRowId;
  }
}

/**
 * Get current user plan
 */
export async function getUserPlan(): Promise<UserPlan | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{
    id: number;
    settings_id: number;
    current_daily_allowance: number;
    last_calculated_date: number;
    created_at: number;
    updated_at: number;
  }>('SELECT * FROM user_plan LIMIT 1');

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    settingsId: result.settings_id,
    currentDailyAllowance: result.current_daily_allowance,
    lastCalculatedDate: result.last_calculated_date,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}
