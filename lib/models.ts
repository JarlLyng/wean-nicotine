/**
 * Data models for Taper app
 */

export type LogEntryType = 'pouch_used' | 'craving_resisted';

export interface LogEntry {
  id: number;
  type: LogEntryType;
  timestamp: number; // Unix timestamp in milliseconds
  createdAt: number; // Unix timestamp in milliseconds
}

export interface TaperSettings {
  id: number;
  baselinePouchesPerDay: number;
  pricePerCan?: number; // Optional, in smallest currency unit (e.g., cents)
  currency?: 'DKK' | 'SEK' | 'NOK' | 'EUR' | 'USD';
  weeklyReductionPercent: number; // e.g., 5 for 5% reduction per week
  startDate: number; // Unix timestamp in milliseconds
  triggers?: string[]; // Selected triggers from onboarding (e.g., ['Coffee', 'Stress', 'After meals'])
  createdAt: number;
  updatedAt: number;
}

export interface UserPlan {
  id: number;
  settingsId: number; // Foreign key to TaperSettings
  currentDailyAllowance: number; // Calculated based on taper plan
  lastCalculatedDate: number; // Unix timestamp in milliseconds
  createdAt: number;
  updatedAt: number;
}
