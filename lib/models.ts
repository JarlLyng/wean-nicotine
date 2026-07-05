/**
 * Data models for Wean Nicotine app
 */

import type { CurrencyCode } from './currency';

export type LogEntryType = 'pouch_used' | 'craving_resisted';

export interface LogEntry {
  id: number;
  type: LogEntryType;
  timestamp: number; // Unix timestamp in milliseconds
  trigger?: string; // Optional trigger tag (one of the user's TaperSettings.triggers)
  createdAt: number; // Unix timestamp in milliseconds
}

export interface TaperSettings {
  id: number;
  baselinePouchesPerDay: number;
  pricePerCan?: number; // Optional, in smallest currency unit (e.g., cents)
  currency?: CurrencyCode;
  weeklyReductionPercent: number; // e.g., 5 for 5% reduction per week
  startDate: number; // Unix timestamp in milliseconds
  triggers?: string[]; // Selected triggers from onboarding (e.g., ['Coffee', 'Stress', 'After meals'])
  createdAt: number;
  updatedAt: number;
}

// Note: the `UserPlan` model and its underlying `user_plan` table were
// removed in #11. The daily allowance is always recomputed from
// `TaperSettings` at display time (see `lib/taper-plan.ts`), so the cached
// row served no purpose.

export type BreathingPattern = 'default' | '4-7-8' | 'box' | 'quick-calm';

export interface BreathingSession {
  id: number;
  pattern: BreathingPattern;
  durationSeconds: number;
  completedAt: number;
  createdAt: number;
}

export type ReflectionCategory = 'triggers' | 'progress' | 'self-care';

export interface Reflection {
  id: number;
  promptId: string;
  category: ReflectionCategory;
  promptText: string;
  note: string;
  createdAt: number;
}
