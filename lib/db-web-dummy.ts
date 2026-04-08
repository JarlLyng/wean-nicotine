/**
 * Dummy data for web preview (Wean Nicotine)
 * Provides realistic sample data so the UI can be viewed on web
 */

import type { TaperSettings, UserPlan, LogEntry, LogEntryType } from './models';

// Generate dummy settings
export function getDummySettings(): TaperSettings {
  const now = Date.now();
  const startDate = now - (14 * 24 * 60 * 60 * 1000); // 14 days ago
  
  return {
    id: 1,
    baselinePouchesPerDay: 12,
    pricePerCan: 5000, // 50.00 in smallest unit
    currency: 'DKK',
    weeklyReductionPercent: 5,
    startDate,
    triggers: ['Stress', 'After meals', 'With coffee'],
    createdAt: startDate,
    updatedAt: now,
  };
}

// Generate dummy user plan
export function getDummyUserPlan(settingsId: number): UserPlan {
  const now = Date.now();
  // Calculate a realistic daily allowance (about 9 pouches after 2 weeks at 5% reduction)
  const dailyAllowance = 9.2;
  
  return {
    id: 1,
    settingsId,
    currentDailyAllowance: dailyAllowance,
    lastCalculatedDate: now,
    createdAt: now,
    updatedAt: now,
  };
}

// Cache base dummy log entries per session to ensure deterministic data
let cachedBaseDummyEntries: LogEntry[] | null = null;

// Session-added log entries for interactive web preview (e.g. clicking "Used a pouch")
let sessionAddedEntries: LogEntry[] = [];
let nextSessionId: number | null = null;

// Generate dummy log entries for the last 14 days
// Cached per session to ensure deterministic data for visual QA
export function getDummyLogEntries(): LogEntry[] {
  // Return combined base + session entries (keeps preview interactive)
  const base = ensureBaseDummyEntries();
  return [...base, ...sessionAddedEntries].sort((a, b) => b.timestamp - a.timestamp);
}

function ensureBaseDummyEntries(): LogEntry[] {
  if (cachedBaseDummyEntries) {
    return cachedBaseDummyEntries;
  }

  const now = Date.now();
  const entries: LogEntry[] = [];
  
  // Use a simple seeded random for deterministic results
  // Seed based on a fixed date to ensure consistency
  const seedDate = new Date('2024-01-01').getTime();
  let seed = Math.floor(seedDate / 1000);
  
  // Simple seeded random function
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // Generate logs for the last 14 days
  for (let day = 0; day < 14; day++) {
    const date = new Date(now - (day * 24 * 60 * 60 * 1000));
    date.setHours(0, 0, 0, 0);
    const dayStart = date.getTime();
    
    // Random number of pouches used per day (between 6-11, trending downward)
    const baseUsage = 12 - (day * 0.3); // Gradually decreasing
    const pouchesUsed = Math.max(6, Math.floor(baseUsage + (seededRandom() * 2 - 1)));
    
    // Distribute pouches throughout the day
    const hours = [8, 10, 12, 14, 16, 18, 20]; // Common times
    const usedHours = hours.slice(0, pouchesUsed);
    
    usedHours.forEach((hour, index) => {
      const timestamp = dayStart + (hour * 60 * 60 * 1000) + (index * 15 * 60 * 1000);
      entries.push({
        id: entries.length + 1,
        type: 'pouch_used',
        timestamp,
        createdAt: timestamp,
      });
    });
    
    // Add some cravings resisted (about 1-2 per day)
    if (seededRandom() > 0.3) {
      const cravingTime = dayStart + (14 * 60 * 60 * 1000) + (seededRandom() * 4 * 60 * 60 * 1000);
      entries.push({
        id: entries.length + 1,
        type: 'craving_resisted',
        timestamp: cravingTime,
        createdAt: cravingTime,
      });
    }
  }
  
  // Sort by timestamp descending (most recent first)
  cachedBaseDummyEntries = entries.sort((a, b) => b.timestamp - a.timestamp);
  nextSessionId = cachedBaseDummyEntries.length + 1;
  return cachedBaseDummyEntries;
}

/**
 * Add a log entry to the in-memory web preview store so UI updates instantly.
 * This is ONLY for web preview; native platforms use SQLite.
 */
export function addDummyLogEntry(type: LogEntryType, timestamp?: number): number {
  const base = ensureBaseDummyEntries();
  if (nextSessionId === null) {
    nextSessionId = base.length + 1;
  }
  const now = Date.now();
  const entryTimestamp = timestamp ?? now;

  const id = nextSessionId;
  nextSessionId += 1;

  sessionAddedEntries.push({
    id,
    type,
    timestamp: entryTimestamp,
    createdAt: now,
  });

  return id;
}
