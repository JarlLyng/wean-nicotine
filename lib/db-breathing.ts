/**
 * CRUD operations for breathing sessions
 */

import { getDatabase } from './db';
import type { BreathingPattern, BreathingSession } from './models';

export async function saveBreathingSession(
  pattern: BreathingPattern,
  durationSeconds: number,
): Promise<number> {
  const db = await getDatabase();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO breathing_sessions (pattern, duration_seconds, completed_at, created_at) VALUES (?, ?, ?, ?)`,
    [pattern, durationSeconds, now, now],
  );
  return result.lastInsertRowId;
}

export async function getBreathingSessionCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM breathing_sessions',
  );
  return row?.count ?? 0;
}

export async function getAllBreathingSessions(): Promise<BreathingSession[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: number;
    pattern: string;
    duration_seconds: number;
    completed_at: number;
    created_at: number;
  }>('SELECT * FROM breathing_sessions ORDER BY completed_at DESC');
  return rows.map((r) => ({
    id: r.id,
    pattern: r.pattern as BreathingPattern,
    durationSeconds: r.duration_seconds,
    completedAt: r.completed_at,
    createdAt: r.created_at,
  }));
}
