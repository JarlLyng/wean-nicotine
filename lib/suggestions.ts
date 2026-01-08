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
  const recentLogs = await getLogEntries({
    limit: 14, // Last 14 days
  });

  const usedLogs = recentLogs.filter((log) => log.type === 'pouch_used');

  if (usedLogs.length >= 7) {
    // Check last 7 days
    const last7Days = usedLogs.slice(0, 7);
    let daysOverLimit = 0;

    for (const log of last7Days) {
      const logDate = new Date(log.timestamp);
      const dayAllowance = calculateDailyAllowance(settings, logDate);

      // Count how many logs on this day
      const dayLogs = last7Days.filter((l) => {
        const lDate = new Date(l.timestamp);
        return (
          lDate.getFullYear() === logDate.getFullYear() &&
          lDate.getMonth() === logDate.getMonth() &&
          lDate.getDate() === logDate.getDate()
        );
      });

      const dayUsed = dayLogs.length;
      if (dayUsed > dayAllowance) {
        daysOverLimit++;
      }
    }

    // If more than 5 out of 7 days over limit, suggest slowing down
    if (daysOverLimit >= 5) {
      suggestions.push({
        id: 'slow_down_taper',
        type: 'slow_down_taper',
        title: 'Consider Adjusting Your Plan',
        message:
          'You\'ve been exceeding your daily allowance frequently. This might mean your taper plan is too aggressive. Consider slowing down the reduction rate — progress isn\'t about speed, it\'s about sustainability.',
        actionLabel: 'Adjust Plan',
        actionRoute: '/(settings)',
      });
    }
  }

  // Always include encouragement
  suggestions.push({
    id: 'encouragement',
    type: 'encouragement',
    title: 'You\'re Doing Great',
    message:
      'Remember: every step forward counts, even the small ones. Progress isn\'t linear, and setbacks are part of the journey. Be kind to yourself.',
  });

  return suggestions;
}
