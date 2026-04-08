# Storage Decision: SQLite vs MMKV

Purpose:
- Record why SQLite was chosen over MMKV for local persistence

Audience:
- Maintainers and LLMs evaluating storage-related changes

Source of truth:
- Current implementation in [`lib/db.ts`](../../lib/db.ts) and `lib/db-*.ts`
- This document explains the decision, not every runtime detail

Related files:
- [`docs/AI_CONTEXT.md`](../AI_CONTEXT.md)
- [`lib/db.ts`](../../lib/db.ts)
- [`lib/db-log-entries.ts`](../../lib/db-log-entries.ts)
- [`lib/db-settings.ts`](../../lib/db-settings.ts)

Update when:
- Storage technology changes
- Migration strategy changes materially
- The reasons for the decision are no longer accurate

**Date:** 2024-12-19  
**Status:** Decided  
**Decision:** SQLite

---

## Context

Wean needs local-first storage for:
- Timestamped log entries (pouch usage, cravings resisted)
- User taper plan settings
- Daily/weekly progress data
- Future charting and analytics needs

## Options Considered

### SQLite (expo-sqlite)

**Pros:**
- Full relational database with SQL queries
- Excellent for timestamped logs with date ranges
- Supports complex queries (aggregations, joins, filtering)
- Well-suited for future charting needs (time-series data)
- Mature, battle-tested solution
- Good performance for read-heavy workloads
- Can handle thousands of log entries efficiently
- Easy to export data (CSV) for users later

**Cons:**
- More setup complexity than key-value stores
- Requires schema migrations
- Slightly heavier than MMKV

### MMKV (react-native-mmkv)

**Pros:**
- Extremely fast key-value operations
- Simple API (get/set)
- Very lightweight
- Great for simple settings storage

**Cons:**
- Key-value only (no relational queries)
- Not ideal for timestamped logs (would need manual filtering)
- No built-in date range queries
- Would require custom indexing logic for charts
- Less suitable for aggregations (daily/weekly stats)
- More complex to query "all entries from last week"

## Use Case Analysis

Wean's primary storage needs:

1. **Log entries** — timestamped events that need:
   - Date range queries ("entries from last 7 days")
   - Aggregations ("count pouches used today")
   - Filtering by type (pouch used vs craving resisted)
   - Future: time-series charts

2. **User settings** — simple key-value pairs:
   - Baseline pouches per day
   - Price per can
   - Taper plan settings

3. **Progress calculations** — derived from logs:
   - Daily/weekly summaries
   - Pouches avoided vs baseline
   - Money saved calculations

## Recommendation

**SQLite** is the clear choice for Wean because:

1. **Log entries are relational data** — SQLite excels at querying timestamped logs with date ranges, which is core to Wean's functionality.

2. **Future charting needs** — Charts require time-series queries (group by day/week, date ranges). SQLite makes this straightforward with SQL.

3. **Aggregations** — Daily/weekly progress calculations are natural SQL queries (COUNT, SUM, GROUP BY).

4. **Scalability** — As users log entries over months, SQLite handles thousands of rows efficiently with proper indexing.

5. **Data export** — SQLite databases can be easily exported/backed up, which aligns with Wean's privacy-first approach.

6. **Settings can coexist** — Simple settings can still be stored in SQLite (single-row table or JSON column) without complexity.

## Implementation Notes

- Use `expo-sqlite` for React Native compatibility
- Create tables: `log_entries`, `taper_settings`, `user_plan`, `app_preferences`, `schema_version`
- Index `log_entries.timestamp` and `log_entries.type` for fast queries
- Database operations organized by domain (`db-log-entries.ts`, `db-settings.ts`, etc.)
- Web platform detection: SQLite is not available on web, app shows warning message

## Schema Migrations

Schema changes are managed via the `MIGRATIONS` array in `lib/db.ts`. Each entry has a `version` (integer), `sql` (DDL statement), and optional `ignoreError` flag for legacy migrations that may already have run on existing installs. The `schema_version` table tracks which migrations have been applied.

To add a new migration:
```ts
{ version: 3, sql: `ALTER TABLE log_entries ADD COLUMN note TEXT` }
```

---

**Decision made:** SQLite via `expo-sqlite`
