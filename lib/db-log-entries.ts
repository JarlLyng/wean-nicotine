/**
 * CRUD operations for LogEntry
 */

import { Platform } from 'react-native';
import { getDatabase } from './db';
import { addDummyLogEntry, getDummyLogEntries } from './db-web-dummy';
import type { LogEntry, LogEntryType } from './models';

/**
 * Create a new log entry
 */
export async function createLogEntry(
  type: LogEntryType,
  timestamp?: number
): Promise<number> {
  // On web, write to in-memory dummy store so UI preview is interactive.
  if (Platform.OS === 'web') {
    return addDummyLogEntry(type, timestamp);
  }

  const db = await getDatabase();
  const now = Date.now();
  const entryTimestamp = timestamp ?? now;

  const result = await db.runAsync(
    `INSERT INTO log_entries (type, timestamp, created_at) VALUES (?, ?, ?)`,
    [type, entryTimestamp, now]
  );

  return result.lastInsertRowId;
}

/**
 * Get all log entries, optionally filtered by type and date range
 */
export async function getLogEntries(options?: {
  type?: LogEntryType;
  startDate?: number;
  endDate?: number;
  limit?: number;
}): Promise<LogEntry[]> {
  // On web, return dummy data for UI preview
  if (Platform.OS === 'web') {
    let dummyEntries = getDummyLogEntries();

    // Apply filters to dummy data
    if (options?.type) {
      dummyEntries = dummyEntries.filter(entry => entry.type === options.type);
    }

    if (options?.startDate) {
      dummyEntries = dummyEntries.filter(entry => entry.timestamp >= options.startDate!);
    }

    if (options?.endDate) {
      dummyEntries = dummyEntries.filter(entry => entry.timestamp <= options.endDate!);
    }

    if (options?.limit) {
      dummyEntries = dummyEntries.slice(0, options.limit);
    }

    return dummyEntries;
  }

  const db = await getDatabase();
  let query = 'SELECT * FROM log_entries WHERE 1=1';
  const params: (string | number | null)[] = [];

  if (options?.type) {
    query += ' AND type = ?';
    params.push(options.type);
  }

  if (options?.startDate) {
    query += ' AND timestamp >= ?';
    params.push(options.startDate);
  }

  if (options?.endDate) {
    query += ' AND timestamp <= ?';
    params.push(options.endDate);
  }

  query += ' ORDER BY timestamp DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  const result = await db.getAllAsync<{
    id: number;
    type: string;
    timestamp: number;
    created_at?: number;
    createdAt?: number;
  }>(query, params);
  return result.map((row: {
    id: number;
    type: string;
    timestamp: number;
    created_at?: number;
    createdAt?: number;
  }) => ({
    id: row.id,
    type: row.type as LogEntryType,
    timestamp: row.timestamp,
    createdAt: row.created_at ?? row.createdAt ?? row.timestamp, // Handle both snake_case and camelCase
  }));
}

/**
 * Get log entries for a specific day (start of day to end of day)
 */
export async function getLogEntriesForDay(date: Date): Promise<LogEntry[]> {
  // On web, return dummy data for UI preview
  if (Platform.OS === 'web') {
    const dummyEntries = getDummyLogEntries();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return dummyEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startOfDay && entryDate <= endOfDay;
    });
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return getLogEntries({
    startDate: startOfDay.getTime(),
    endDate: endOfDay.getTime(),
  });
}

/**
 * Count log entries by type for a date range
 */
export async function countLogEntriesByType(
  type: LogEntryType,
  startDate?: number,
  endDate?: number
): Promise<number> {
  const db = await getDatabase();
  let query = 'SELECT COUNT(*) as count FROM log_entries WHERE type = ?';
  const params: (string | number | null)[] = [type];

  if (startDate) {
    query += ' AND timestamp >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND timestamp <= ?';
    params.push(endDate);
  }

  const result = await db.getFirstAsync<{ count: number }>(query, params);
  if (!result) {
    return 0;
  }
  return result.count;
}

/**
 * Delete a log entry by ID
 */
export async function deleteLogEntry(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM log_entries WHERE id = ?', [id]);
}

/**
 * Delete all log entries (used when resetting/starting over)
 */
export async function deleteAllLogEntries(): Promise<void> {
  const db = await getDatabase();
  if (__DEV__) {
    console.log('deleteAllLogEntries: Deleting all log entries...');
  }

  // First, count how many entries exist
  const countBefore = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM log_entries');
  if (__DEV__) {
    console.log('deleteAllLogEntries: Entries before deletion:', countBefore?.count || 0);
  }

  // Delete all entries
  await db.runAsync('DELETE FROM log_entries');

  // Verify deletion
  const countAfter = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM log_entries');
  if (__DEV__) {
    console.log('deleteAllLogEntries: Entries after deletion:', countAfter?.count || 0);
  }

  if (countAfter && countAfter.count > 0) {
    if (__DEV__) {
      console.error('deleteAllLogEntries: WARNING - Some entries were not deleted!');
    }
  } else {
    if (__DEV__) {
      console.log('deleteAllLogEntries: All entries successfully deleted');
    }
  }
}
