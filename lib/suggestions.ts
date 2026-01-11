/**
 * Smart suggestions based on user behavior
 */

import type { TaperSettings } from './models';
import { getLogEntries } from './db-log-entries';
import { calculateDailyAllowance } from './taper-plan';

export interface Suggestion {
  id: string;
  type: 'slow_down_taper' | 'adjust_baseline' | 'encouragement';
  title: string;
  message: string;
  actionLabel?: string;
  actionRoute?: string;
}

/**
 * Analyze user behavior and generate suggestions
 */
export async function generateSuggestions(
  settings: TaperSettings
): Promise<Suggestion[]> {
  const suggestions: Suggestion[] = [];

  // Check if user is consistently exceeding limits
  // Get logs from the last 7 days (not just last 7 logs)
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentLogs = await getLogEntries({
    startDate: sevenDaysAgo.getTime(),
    endDate: today.getTime(),
  });

  const usedLogs = recentLogs.filter((log) => log.type === 'pouch_used');

  if (usedLogs.length > 0) {
    // Group logs by day (unique date)
    const logsByDay = new Map<string, number>();
    
    for (const log of usedLogs) {
      const logDate = new Date(log.timestamp);
      const dayKey = `${logDate.getFullYear()}-${logDate.getMonth()}-${logDate.getDate()}`;
      logsByDay.set(dayKey, (logsByDay.get(dayKey) || 0) + 1);
    }

    // Check each unique day
    let daysOverLimit = 0;
    let totalDays = 0;

    for (const [dayKey, dayUsed] of logsByDay.entries()) {
      const [year, month, day] = dayKey.split('-').map(Number);
      const dayDate = new Date(year, month, day);
      const dayAllowance = calculateDailyAllowance(settings, dayDate);

      totalDays++;
      if (dayUsed > dayAllowance) {
        daysOverLimit++;
      }
    }

    // If more than 5 out of 7 days over limit, suggest slowing down
    // Only suggest if we have at least 5 days of data
    if (totalDays >= 5 && daysOverLimit >= 5) {
      suggestions.push({
        id: 'slow_down_taper',
        type: 'slow_down_taper',
        title: 'Consider Adjusting Your Plan',
        message:
          'You&apos;ve been exceeding your daily allowance frequently. This might mean your taper plan is too aggressive. Consider slowing down the reduction rate — progress isn&apos;t about speed, it&apos;s about sustainability.',
        actionLabel: 'Adjust Plan',
        actionRoute: '/(settings)',
      });
    }
  }

  // Always include encouragement
  suggestions.push({
    id: 'encouragement',
    type: 'encouragement',
    title: 'You&apos;re Doing Great',
    message:
      'Remember: every step forward counts, even the small ones. Progress isn&apos;t linear, and setbacks are part of the journey. Be kind to yourself.',
  });

  return suggestions;
}
