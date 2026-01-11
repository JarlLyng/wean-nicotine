/**
 * CRUD operations for UserPlan
 */

import { Platform } from 'react-native';
import { getDatabase } from './db';
import type { UserPlan } from './models';
import { getDummyUserPlan } from './db-web-dummy';

/**
 * Create or update user plan
 * Since we only have one user, we'll use a single row approach
 */
export async function saveUserPlan(
  plan: Omit<UserPlan, 'id' | 'createdAt' | 'updatedAt'>,
  forceCreate: boolean = false
): Promise<number> {
  const db = await getDatabase();
  const now = Date.now();

  // If forceCreate is true, delete existing first (for fresh start scenarios)
  if (forceCreate) {
    await db.runAsync('DELETE FROM user_plan');
  }

  // Check if plan already exists
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM user_plan LIMIT 1',
    []
  );

  if (existing && !forceCreate) {
    // Update existing
    console.log('saveUserPlan: Updating existing plan with ID:', existing.id);
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
    console.log('saveUserPlan: Creating new plan');
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
    console.log('saveUserPlan: Created new plan with ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  }
}

/**
 * Get current user plan
 */
export async function getUserPlan(): Promise<UserPlan | null> {
  // On web, return dummy data for UI preview
  if (Platform.OS === 'web') {
    return getDummyUserPlan(1);
  }

  const db = await getDatabase();
  const result = await db.getFirstAsync<{
    id: number;
    settings_id: number;
    current_daily_allowance: number;
    last_calculated_date: number;
    created_at: number;
    updated_at: number;
  }>('SELECT * FROM user_plan LIMIT 1', []);

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

/**
 * Delete all user plans (for testing/resetting onboarding)
 */
export async function deleteUserPlan(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM user_plan');
}
