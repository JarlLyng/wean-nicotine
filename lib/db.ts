/**
 * SQLite database setup and operations for Taper
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync('taper.db');

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
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    return await initDatabase();
  }
  return db;
}
