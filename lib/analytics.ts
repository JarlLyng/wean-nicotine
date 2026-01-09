/**
 * Local-only analytics (no tracking, no external services)
 * Stores basic usage stats locally for app improvement
 */

import { getDatabase } from './db';

export interface AnalyticsEvent {
  id: number;
  eventType: string;
  timestamp: number;
  data?: string; // JSON string for additional data
}

/**
 * Initialize analytics table
 */
export async function initAnalytics(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      data TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
    CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
  `);
}

/**
 * Log an analytics event (local only)
 */
export async function logEvent(eventType: string, data?: any): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT INTO analytics (event_type, timestamp, data) VALUES (?, ?, ?)',
      [eventType, Date.now(), data ? JSON.stringify(data) : null]
    );
  } catch (error) {
    console.error('Error logging analytics event:', error);
    // Fail silently - analytics should never break the app
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
    const params: any[] = [];

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
      data: row.data ? JSON.parse(row.data) : undefined,
    }));
  } catch (error) {
    console.error('Error getting analytics events:', error);
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
    console.error('Error clearing old analytics:', error);
  }
}
