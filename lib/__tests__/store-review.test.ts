/**
 * Tests for the in-app review prompt gates (#180).
 *
 * The wrapper must be conservative: any failed gate means NO prompt.
 * Apple additionally caps prompts at 3/365 — these are our stricter limits.
 */

import { REVIEW_MIN_DAYS_BETWEEN, REVIEW_MIN_DAYS_SINCE_START } from '../constants';

const mockIsAvailable = jest.fn();
const mockRequestReview = jest.fn();
jest.mock('expo-store-review', () => ({
  isAvailableAsync: () => mockIsAvailable(),
  requestReview: () => mockRequestReview(),
}));

const mockGetPreference = jest.fn();
const mockSetPreference = jest.fn();
jest.mock('../db-preferences', () => ({
  getPreference: (key: string) => mockGetPreference(key),
  setPreference: (key: string, value: string) => mockSetPreference(key, value),
}));

import { maybeRequestReview } from '../store-review';

const DAY_MS = 24 * 60 * 60 * 1000;
const OLD_PLAN = Date.now() - 60 * DAY_MS;

beforeEach(() => {
  mockIsAvailable.mockReset().mockResolvedValue(true);
  mockRequestReview.mockReset().mockResolvedValue(undefined);
  mockGetPreference.mockReset().mockResolvedValue(null);
  mockSetPreference.mockReset().mockResolvedValue(undefined);
});

describe('maybeRequestReview', () => {
  it('requests a review when every gate passes', async () => {
    const result = await maybeRequestReview(OLD_PLAN);
    expect(result).toBe(true);
    expect(mockRequestReview).toHaveBeenCalledTimes(1);
  });

  it('declines when the plan is younger than the minimum age', async () => {
    // Also the "not right after Reset" guard: Start Over creates a fresh plan.
    const freshPlan = Date.now() - (REVIEW_MIN_DAYS_SINCE_START - 1) * DAY_MS;
    const result = await maybeRequestReview(freshPlan);
    expect(result).toBe(false);
    expect(mockRequestReview).not.toHaveBeenCalled();
  });

  it('declines when a request was made within the frequency window', async () => {
    const recent = Date.now() - (REVIEW_MIN_DAYS_BETWEEN - 1) * DAY_MS;
    mockGetPreference.mockResolvedValue(String(recent));
    const result = await maybeRequestReview(OLD_PLAN);
    expect(result).toBe(false);
    expect(mockRequestReview).not.toHaveBeenCalled();
  });

  it('requests again once the frequency window has fully elapsed', async () => {
    const longAgo = Date.now() - (REVIEW_MIN_DAYS_BETWEEN + 1) * DAY_MS;
    mockGetPreference.mockResolvedValue(String(longAgo));
    const result = await maybeRequestReview(OLD_PLAN);
    expect(result).toBe(true);
  });

  it('declines when StoreKit reports the prompt is unavailable', async () => {
    mockIsAvailable.mockResolvedValue(false);
    const result = await maybeRequestReview(OLD_PLAN);
    expect(result).toBe(false);
    expect(mockRequestReview).not.toHaveBeenCalled();
  });

  it('records the request timestamp BEFORE asking (no double-ask on failure)', async () => {
    const order: string[] = [];
    mockSetPreference.mockImplementation(async () => {
      order.push('record');
    });
    mockRequestReview.mockImplementation(async () => {
      order.push('request');
    });
    await maybeRequestReview(OLD_PLAN);
    expect(order).toEqual(['record', 'request']);
  });

  it('returns false instead of throwing when StoreKit errors', async () => {
    mockRequestReview.mockRejectedValue(new Error('storekit unavailable'));
    await expect(maybeRequestReview(OLD_PLAN)).resolves.toBe(false);
  });
});
