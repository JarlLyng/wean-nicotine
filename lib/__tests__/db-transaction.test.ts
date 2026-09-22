/**
 * Tests for runInTransaction (#53).
 *
 * Used by the migrations and by Start Over. The point of having our own
 * helper instead of expo-sqlite's withTransactionAsync: when ROLLBACK itself
 * fails, the error that caused the rollback is the one that gets thrown.
 */

import { runInTransaction } from '../db';

type Step = string | Error;

/** A fake database whose runAsync records each statement and can fail on one. */
function fakeDb(failOn: Record<string, Error> = {}) {
  const calls: Step[] = [];
  return {
    calls,
    runAsync: jest.fn(async (sql: string) => {
      calls.push(sql);
      if (failOn[sql]) throw failOn[sql];
      return { lastInsertRowId: 0 };
    }),
  };
}

describe('runInTransaction', () => {
  it('runs the task between BEGIN and COMMIT', async () => {
    const db = fakeDb();
    await runInTransaction(db, async () => {
      await db.runAsync('DELETE FROM log_entries');
    });
    expect(db.calls).toEqual(['BEGIN', 'DELETE FROM log_entries', 'COMMIT']);
  });

  it('rolls back and rethrows when the task fails', async () => {
    const cause = new Error('no such column: trigger');
    const db = fakeDb();
    await expect(
      runInTransaction(db, async () => {
        throw cause;
      }),
    ).rejects.toBe(cause);
    expect(db.calls).toEqual(['BEGIN', 'ROLLBACK']);
  });

  it('keeps the original error when ROLLBACK also fails', async () => {
    const cause = new Error('database or disk is full');
    const db = fakeDb({ ROLLBACK: new Error('cannot rollback - no transaction is active') });
    await expect(
      runInTransaction(db, async () => {
        throw cause;
      }),
    ).rejects.toBe(cause);
  });

  it('keeps the BEGIN error and never runs the task when BEGIN fails', async () => {
    const cause = new Error('database is locked');
    const db = fakeDb({
      BEGIN: cause,
      ROLLBACK: new Error('cannot rollback - no transaction is active'),
    });
    const task = jest.fn(async () => {});
    await expect(runInTransaction(db, task)).rejects.toBe(cause);
    expect(task).not.toHaveBeenCalled();
  });

  it('rolls back when COMMIT fails', async () => {
    const cause = new Error('database is locked');
    const db = fakeDb({ COMMIT: cause });
    await expect(runInTransaction(db, async () => {})).rejects.toBe(cause);
    expect(db.calls).toEqual(['BEGIN', 'COMMIT', 'ROLLBACK']);
  });
});
