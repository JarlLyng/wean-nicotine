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
// On web, this function returns null immediately to prevent Metro from analyzing expo-sqlite
function getSQLite(): any {
  if (Platform.OS === 'web') {
    return null;
  }
  try {
    // Use dynamic require with string concatenation to prevent Metro static analysis
    // This prevents Metro from analyzing the expo-sqlite import chain on web
    const sqliteModuleName = 'expo-' + 'sqlite';
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(sqliteModuleName);
  } catch {
    return null;
  }
}

let db: SQLiteDatabase | null = null;
let initPromise: Promise<SQLiteDatabase> | null = null;

interface Migration {
  version: number;
  sql: string;
  /** True for legacy migrations that may already have run on existing installs */
  ignoreError?: boolean;
}

const MIGRATIONS: Migration[] = [
  { version: 1, sql: `ALTER TABLE taper_settings ADD COLUMN triggers TEXT`, ignoreError: true },
  { version: 2, sql: `ALTER TABLE taper_settings ADD COLUMN currency TEXT`, ignoreError: true },
];

async function runMigrations(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(
    `CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`
  );
  const row = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
  );
  const currentVersion = row?.version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue;
    try {
      await database.execAsync(migration.sql);
    } catch (error) {
      if (!migration.ignoreError) throw error;
    }
    await database.runAsync(
      'INSERT OR REPLACE INTO schema_version (version) VALUES (?)',
      [migration.version]
    );
  }
}

/**
 * Initialize the database and create tables if they don't exist.
 * Safe to call concurrently: only one init runs, others await the same promise.
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  if (initPromise) {
    return initPromise;
  }

  const SQLite = getSQLite();
  if (Platform.OS === 'web' || !SQLite) {
    // On web, return a mock database that allows UI to render
    // This enables viewing the UI for design purposes
    return {
      execAsync: async () => {},
      runAsync: async () => ({ lastInsertRowId: 0 }),
      getAllAsync: async () => [],
      getFirstAsync: async () => null,
    } as SQLiteDatabase;
  }

  initPromise = (async (): Promise<SQLiteDatabase> => {
    try {
      if (db) return db;

      db = (await SQLite.openDatabaseAsync('taper.db')) as SQLiteDatabase;

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
      currency TEXT,
      weekly_reduction_percent REAL NOT NULL DEFAULT 5.0,
      start_date INTEGER NOT NULL,
      triggers TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    );
  `);

      await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
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

      await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp);`);
      await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_log_entries_type ON log_entries(type);`);

      await runMigrations(db);

      return db;
    } catch (error) {
      initPromise = null;
      db = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Get the database instance (initializes if needed).
 * If init previously failed, the next call will retry (initPromise is cleared on failure).
 */
export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!db) {
    db = await initDatabase();
  }
  return db;
}

/**
 * Delete all data from core tables in a single transaction (Start Over).
 * Does not touch the analytics table – call deleteAllAnalytics() separately.
 * On failure, transaction is rolled back.
 */
export async function resetAllData(): Promise<void> {
  const database = await getDatabase();
  try {
    await database.runAsync('BEGIN');
    await database.runAsync('DELETE FROM log_entries');
    await database.runAsync('DELETE FROM taper_settings');
    await database.runAsync('DELETE FROM user_plan');
    await database.runAsync('DELETE FROM app_preferences');
    await database.runAsync('COMMIT');
  } catch (error) {
    try {
      await database.runAsync('ROLLBACK');
    } catch {
      // Ignore rollback errors
    }
    throw error;
  }
}
