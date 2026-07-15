/**
 * Tests for the Sentry PII scrubber.
 *
 * The scrubber is the last line of defense between sloppy captureError calls
 * and our public privacy promise that user data never reaches Sentry. If you
 * change the PII_KEYS list, add a test here.
 */

import { scrubExtra, scrubBreadcrumb } from '../sentry';

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

  it('replaces a single per-entry trigger tag with [scrubbed]', () => {
    // Per-log trigger tagging (#220): the tag names a personal habit and
    // must never reach Sentry, same as the settings-level triggers list.
    const result = scrubExtra({
      context: 'home_tag_trigger',
      trigger: 'Stress',
    });
    expect(result).toEqual({
      context: 'home_tag_trigger',
      trigger: '[scrubbed]',
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

describe('scrubBreadcrumb', () => {
  it('strips the label + data from touch (ui.click) breadcrumbs', () => {
    // A tap on a trigger chip: accessibilityLabel is the trigger name — a health
    // signal that must not ride along on a crash report.
    const result = scrubBreadcrumb({
      category: 'ui.click',
      message: 'Touch event within element: Stress',
      data: { label: 'Stress' },
      type: 'user',
    });
    expect(result.message).toBe('[scrubbed]');
    expect(result.data).toBeUndefined();
    // Skeleton kept for debugging value.
    expect(result.category).toBe('ui.click');
    expect(result.type).toBe('user');
  });

  it('strips other ui.* interaction breadcrumbs too', () => {
    const result = scrubBreadcrumb({ category: 'ui.longPress', message: 'With coffee' });
    expect(result.message).toBe('[scrubbed]');
  });

  it('strips console breadcrumb messages', () => {
    const result = scrubBreadcrumb({
      category: 'console',
      message: 'saveTaperSettings: baseline 14',
      data: { arguments: ['baseline', 14] },
    });
    expect(result.message).toBe('[scrubbed]');
    expect(result.data).toBeUndefined();
  });

  it('leaves navigation breadcrumbs untouched (route names are not PII)', () => {
    const nav = {
      category: 'navigation',
      message: 'home -> progress',
      data: { from: 'home', to: 'progress' },
    };
    expect(scrubBreadcrumb(nav)).toEqual(nav);
  });

  it('leaves breadcrumbs with no category untouched', () => {
    const b = { message: 'app.start' };
    expect(scrubBreadcrumb(b)).toEqual(b);
  });
});
