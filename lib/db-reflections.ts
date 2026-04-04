/**
 * CRUD operations for reflections (journal entries)
 */

import { getDatabase } from './db';
import type { Reflection, ReflectionCategory } from './models';

export async function saveReflection(
  promptId: string,
  category: ReflectionCategory,
  promptText: string,
  note: string,
): Promise<number> {
  const db = await getDatabase();
  const now = Date.now();
  const result = await db.runAsync(
    `INSERT INTO reflections (prompt_id, category, prompt_text, note, created_at) VALUES (?, ?, ?, ?, ?)`,
    [promptId, category, promptText, note, now],
  );
  return result.lastInsertRowId;
}

export async function getReflections(options?: {
  category?: ReflectionCategory;
  limit?: number;
  offset?: number;
}): Promise<Reflection[]> {
  const db = await getDatabase();
  let query = 'SELECT * FROM reflections WHERE 1=1';
  const params: (string | number | null)[] = [];

  if (options?.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }

  query += ' ORDER BY created_at DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  if (options?.offset) {
    query += ' OFFSET ?';
    params.push(options.offset);
  }

  const rows = await db.getAllAsync<{
    id: number;
    prompt_id: string;
    category: string;
    prompt_text: string;
    note: string;
    created_at: number;
  }>(query, params);

  return rows.map((r) => ({
    id: r.id,
    promptId: r.prompt_id,
    category: r.category as ReflectionCategory,
    promptText: r.prompt_text,
    note: r.note,
    createdAt: r.created_at,
  }));
}

export async function getReflectionCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reflections',
  );
  return row?.count ?? 0;
}

export async function deleteReflection(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM reflections WHERE id = ?', [id]);
}
