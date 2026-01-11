/**
 * Web stub for expo-sqlite
 * This file replaces expo-sqlite on web builds to prevent WASM errors
 * The actual database operations are handled by platform checks in db.ts
 */

// Stub implementation that will never be called on web
// (because db.ts checks Platform.OS before using SQLite)
export function openDatabaseAsync() {
  throw new Error('SQLite is not available on web. Taper is designed for mobile devices only.');
}

// Export all the functions that expo-sqlite might export
// This prevents "module not found" errors
export const SQLiteProvider = null;
export const useSQLiteContext = null;
export const importDatabaseFromAssetAsync = null;

// Export default to match expo-sqlite structure
const stub = {
  openDatabaseAsync,
  SQLiteProvider,
  useSQLiteContext,
  importDatabaseFromAssetAsync,
};

export default stub;
