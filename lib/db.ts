/**
 * SQLite database setup and operations for Taper
 * 
 * NOTE: expo-sqlite does not work on web. This app is designed for mobile (iOS/Android) only.
 */

import { Platform } from 'react-native';

// Type for SQLite database (avoiding direct import for web compatibility)
type SQLiteDatabase = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: any[]) => Promise<{ lastInsertRowId: number }>;
  getAllAsync: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  getFirstAsync: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
};

// Lazy load expo-sqlite only on native platforms to avoid web bundling issues
function getSQLite(): typeof import('expo-sqlite') | null {
  if (Platform.OS === 'web') {
    return null;
  }
  try {
    // Use require to avoid static import analysis
    return require('expo-sqlite');
  } catch {
    return null;
  }
}

let db: SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  // Check if running on web
  const SQLite = getSQLite();
  if (Platform.OS === 'web' || !SQLite) {
    throw new Error(
      'Taper is designed for mobile devices only. SQLite is not available on web. ' +
      'Please use the iOS or Android app, or run: npx expo start --ios or npx expo start --android'
    );
  }

  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('taper.db') as SQLiteDatabase;

  // Create tables (execAsync can handle multiple statements separated by semicolons)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS log_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('pouch_used', 'craving_resisted')),
      timestamp INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS taper_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      baseline_pouches_per_day INTEGER NOT NULL,
      price_per_can INTEGER,
      weekly_reduction_percent REAL NOT NULL DEFAULT 5.0,
      start_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      settings_id INTEGER NOT NULL,
      current_daily_allowance REAL NOT NULL,
      last_calculated_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (settings_id) REFERENCES taper_settings(id)
    );
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp);
  `);

  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_log_entries_type ON log_entries(type);
  `);

  return db;
}

/**
 * Get the database instance (initializes if needed)
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}
