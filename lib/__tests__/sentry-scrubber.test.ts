/**
 * Tests for the Sentry PII scrubber.
 *
 * The scrubber is the last line of defense between sloppy captureError calls
 * and our public privacy promise that user data never reaches Sentry. If you
 * change the PII_KEYS list, add a test here.
 */

import { scrubExtra } from '../sentry';

describe('scrubExtra', () => {
  it('returns undefined when input is undefined', () => {
    expect(scrubExtra(undefined)).toBeUndefined();
  });

  it('returns an empty object unchanged', () => {
    expect(scrubExtra({})).toEqual({});
  });

  it('keeps technical context keys intact', () => {
    const input = {
      context: 'home_log_pouch',
      screen: 'home',
      operation: 'create_log_entry',
    };
    expect(scrubExtra(input)).toEqual(input);
  });

  it('replaces baseline-related user data with [scrubbed]', () => {
    const result = scrubExtra({
      context: 'onboarding_complete',
      baseline: 14,
      baselinePouchesPerDay: 14,
    });
    expect(result).toEqual({
      context: 'onboarding_complete',
      baseline: '[scrubbed]',
      baselinePouchesPerDay: '[scrubbed]',
    });
  });

  it('replaces price + currency data with [scrubbed]', () => {
    const result = scrubExtra({
      context: 'edit_plan_save',
      price: 5000,
      pricePerCan: 5000,
      currency: 'DKK',
    });
    expect(result).toEqual({
      context: 'edit_plan_save',
      price: '[scrubbed]',
      pricePerCan: '[scrubbed]',
      currency: '[scrubbed]',
    });
  });

  it('replaces raw triggers with [scrubbed]', () => {
    const result = scrubExtra({
      context: 'db_settings_parse_triggers',
      triggers: ['Coffee', 'Stress'],
      raw: '["Coffee","Stress"]',
    });
    expect(result).toEqual({
      context: 'db_settings_parse_triggers',
      triggers: '[scrubbed]',
      raw: '[scrubbed]',
    });
  });

  it('replaces daily counters and allowance with [scrubbed]', () => {
    const result = scrubExtra({
      context: 'home_load_data',
      pouchesUsedToday: 7,
      cravingsResistedToday: 2,
      dailyAllowance: 11.4,
      currentDailyAllowance: 11.4,
      weeklyReductionPercent: 5,
    });
    expect(result).toEqual({
      context: 'home_load_data',
      pouchesUsedToday: '[scrubbed]',
      cravingsResistedToday: '[scrubbed]',
      dailyAllowance: '[scrubbed]',
      currentDailyAllowance: '[scrubbed]',
      weeklyReductionPercent: '[scrubbed]',
    });
  });

  it('replaces whole user-data objects with [scrubbed]', () => {
    const result = scrubExtra({
      context: 'reset',
      userPlan: { id: 1, currentDailyAllowance: 12 },
      taperSettings: { id: 1, baselinePouchesPerDay: 14 },
      logEntries: [{ id: 1, type: 'pouch_used' }],
    });
    expect(result).toEqual({
      context: 'reset',
      userPlan: '[scrubbed]',
      taperSettings: '[scrubbed]',
      logEntries: '[scrubbed]',
    });
  });

  it('preserves non-PII keys alongside scrubbed ones', () => {
    const result = scrubExtra({
      context: 'mixed',
      operation: 'save',
      baseline: 14,
      timestamp: 1234567890,
    });
    expect(result).toEqual({
      context: 'mixed',
      operation: 'save',
      baseline: '[scrubbed]',
      timestamp: 1234567890,
    });
  });
});
