/**
 * Web stub for expo-sqlite
 * This file replaces expo-sqlite on web builds to prevent WASM errors
 * The actual database operations are handled by platform checks in db.ts
 */

// Stub implementation that will never be called on web
// (because db.ts checks Platform.OS before using SQLite)
function openDatabaseAsync() {
  throw new Error('SQLite is not available on web. Wean Nicotine is designed for mobile devices only.');
}

// Export all the functions that expo-sqlite might export
// This prevents "module not found" errors
const SQLiteProvider = null;
const useSQLiteContext = null;
const importDatabaseFromAssetAsync = null;

// Export default to match expo-sqlite structure
const stub = {
  openDatabaseAsync,
  SQLiteProvider,
  useSQLiteContext,
  importDatabaseFromAssetAsync,
};

module.exports = stub;
module.exports.default = stub;
module.exports.openDatabaseAsync = openDatabaseAsync;
module.exports.SQLiteProvider = SQLiteProvider;
module.exports.useSQLiteContext = useSQLiteContext;
module.exports.importDatabaseFromAssetAsync = importDatabaseFromAssetAsync;
