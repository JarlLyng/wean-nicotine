/**
 * Local-only analytics (no tracking, no external services)
 * Stores basic usage stats locally for app improvement
 */

import { getDatabase } from './db';
import { captureError } from './sentry';

export interface AnalyticsEvent {
  id: number;
  eventType: string;
  timestamp: number;
  data?: string; // JSON string for additional data
}

/**
 * Initialize analytics — no-op kept for backward-compatible callers.
 *
 * The `analytics` table and its indexes are now created by the centralized
 * migration runner in `lib/db.ts` (migration v6). Calling this function only
 * needs to ensure the database is initialized so callers don't crash on a
 * fresh launch.
 */
export async function initAnalytics(): Promise<void> {
  // Touch the DB so the migration system runs if it hasn't yet.
  await getDatabase();
}

/**
 * Log an analytics event (local only)
 */
export async function logEvent(eventType: string, data?: Record<string, unknown>): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO analytics (event_type, timestamp, data) VALUES (?, ?, ?)',
      [eventType, Date.now(), data ? JSON.stringify(data) : null]
    );
  } catch (error) {
    if (__DEV__) console.error('Error logging analytics event:', error);
    // Fail silently - analytics should never break the app
    // But capture in Sentry for monitoring
    if (error instanceof Error) {
      captureError(error, { context: 'analytics_log_event' });
    }
  }
}

/**
 * Get analytics events (for debugging/development only)
 */
export async function getAnalyticsEvents(
  eventType?: string,
  limit: number = 100
): Promise<AnalyticsEvent[]> {
  try {
    const db = await getDatabase();
    let query = 'SELECT * FROM analytics';
    const params: (string | number | null)[] = [];

    if (eventType) {
      query += ' WHERE event_type = ?';
      params.push(eventType);
    }

    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(limit);

    const result = await db.getAllAsync<{
      id: number;
      event_type: string;
      timestamp: number;
      data: string | null;
    }>(query, params);
    return result.map((row: {
      id: number;
      event_type: string;
      timestamp: number;
      data: string | null;
    }) => ({
      id: row.id,
      eventType: row.event_type,
      timestamp: row.timestamp,
      data: row.data ? (() => { try { return JSON.parse(row.data); } catch { return undefined; } })() : undefined,
    }));
  } catch (error) {
    if (__DEV__) console.error('Error getting analytics events:', error);
    if (error instanceof Error) captureError(error, { context: 'analytics_get_events' });
    return [];
  }
}

/**
 * Clear old analytics events (keep last 30 days)
 */
export async function clearOldAnalytics(): Promise<void> {
  try {
    const db = await getDatabase();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    await db.runAsync('DELETE FROM analytics WHERE timestamp < ?', [thirtyDaysAgo]);
  } catch (error) {
    if (__DEV__) console.error('Error clearing old analytics:', error);
    if (error instanceof Error) captureError(error, { context: 'analytics_clear_old' });
  }
}

/**
 * Delete all analytics events (e.g. when user does Start Over).
 * Keeps the table; only data is removed.
 */
export async function deleteAllAnalytics(): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM analytics');
  } catch (error) {
    if (__DEV__) console.error('Error deleting all analytics:', error);
    if (error instanceof Error) {
      captureError(error, { context: 'analytics_delete_all' });
    }
    throw error;
  }
}
