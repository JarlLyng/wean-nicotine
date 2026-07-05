/**
 * SQLite database setup and operations for Wean Nicotine
 *
 * NOTE: expo-sqlite does not work on web. This app is designed for mobile (iOS/Android) only.
 */

import { Platform } from 'react-native';

// Type for SQLite database (avoiding direct import for web compatibility)
type SQLiteParam = string | number | null | boolean;

type SQLiteDatabase = {
  execAsync: (sql: string) => Promise<void>;
  runAsync: (sql: string, params?: SQLiteParam[]) => Promise<{ lastInsertRowId: number }>;
  getAllAsync: <T = Record<string, unknown>>(sql: string, params?: SQLiteParam[]) => Promise<T[]>;
  getFirstAsync: <T = Record<string, unknown>>(
    sql: string,
    params?: SQLiteParam[],
  ) => Promise<T | null>;
};

// Lazy load expo-sqlite only on native platforms to avoid web bundling issues
// On web, this function returns null immediately to prevent Metro from analyzing expo-sqlite
function getSQLite(): { openDatabaseAsync: (name: string) => Promise<SQLiteDatabase> } | null {
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
  /**
   * Migration body. Receives the db and must perform all SQL inside the
   * provided transaction. Throwing rolls the migration back AND prevents
   * `schema_version` from being advanced — so the next launch retries.
   */
  up: (db: SQLiteDatabase) => Promise<void>;
}

/**
 * Returns true if `table` has a column named `column`. Used by legacy ALTER
 * migrations (versions 1 and 2) so they can be skipped idempotently on
 * databases where the column was already added before the migration system
 * was introduced — without resorting to swallow-all-errors `ignoreError`.
 */
async function hasColumn(db: SQLiteDatabase, table: string, column: string): Promise<boolean> {
  type ColumnInfo = { name: string };
  const cols = await db.getAllAsync<ColumnInfo>(`PRAGMA table_info(${table})`);
  return cols.some((c) => c.name === column);
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      if (!(await hasColumn(db, 'taper_settings', 'triggers'))) {
        await db.execAsync(`ALTER TABLE taper_settings ADD COLUMN triggers TEXT`);
      }
    },
  },
  {
    version: 2,
    up: async (db) => {
      if (!(await hasColumn(db, 'taper_settings', 'currency'))) {
        await db.execAsync(`ALTER TABLE taper_settings ADD COLUMN currency TEXT`);
      }
    },
  },
  {
    version: 3,
    up: async (db) => {
      await db.execAsync(`CREATE TABLE IF NOT EXISTS breathing_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern TEXT NOT NULL,
        duration_seconds INTEGER NOT NULL,
        completed_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
      )`);
    },
  },
  {
    version: 4,
    up: async (db) => {
      await db.execAsync(`CREATE TABLE IF NOT EXISTS reflections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt_id TEXT NOT NULL,
        category TEXT NOT NULL,
        prompt_text TEXT NOT NULL,
        note TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
      )`);
    },
  },
  {
    version: 5,
    up: async (db) => {
      await db.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_reflections_created_at ON reflections(created_at)`,
      );
    },
  },
  {
    // Moved here from analytics.ts so the schema is owned in one place and
    // gets recorded in schema_version.
    version: 6,
    up: async (db) => {
      await db.execAsync(`CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        data TEXT
      )`);
      await db.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type)`,
      );
      await db.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp)`,
      );
    },
  },
  {
    // Drop the redundant `user_plan` cache table — its `current_daily_allowance`
    // column was never read for display; the Today screen recomputes it from
    // settings on every focus. See #11.
    version: 7,
    up: async (db) => {
      await db.execAsync(`DROP TABLE IF EXISTS user_plan`);
    },
  },
  {
    // Per-entry trigger tagging (#220). Nullable — existing history and
    // untagged one-tap logs stay valid. Fresh installs get the column from
    // the base CREATE TABLE, hence the hasColumn guard (same pattern as v1/v2).
    version: 8,
    up: async (db) => {
      if (!(await hasColumn(db, 'log_entries', 'trigger'))) {
        await db.execAsync(`ALTER TABLE log_entries ADD COLUMN trigger TEXT`);
      }
    },
  },
];

async function runMigrations(database: SQLiteDatabase): Promise<void> {
  await database.execAsync(
    `CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`,
  );
  const row = await database.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1',
  );
  const currentVersion = row?.version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue;

    // Run each migration in its own transaction. If `up` throws, the SQL is
    // rolled back AND we do NOT advance `schema_version` — so the next launch
    // retries this migration cleanly instead of skipping a half-applied one.
    await database.runAsync('BEGIN');
    try {
      await migration.up(database);
      await database.runAsync('INSERT OR REPLACE INTO schema_version (version) VALUES (?)', [
        migration.version,
      ]);
      await database.runAsync('COMMIT');
    } catch (error) {
      await database.runAsync('ROLLBACK');
      throw error;
    }
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
      trigger TEXT,
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

      // `user_plan` table existed before #11 to cache the daily allowance,
      // but it was never read for display — the allowance is always recomputed
      // from settings. Migration v7 (below) drops the table on existing
      // installs.

      await db.execAsync(
        `CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp);`,
      );
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
    await database.runAsync('DELETE FROM app_preferences');
    await database.runAsync('DELETE FROM breathing_sessions');
    await database.runAsync('DELETE FROM reflections');
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
