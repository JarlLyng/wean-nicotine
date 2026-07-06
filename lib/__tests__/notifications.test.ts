/**
 * Unit tests for notifications.ts.
 *
 * Mocks `expo-notifications` end-to-end so the tests run without a native
 * runtime. Focus areas:
 * - `scheduleTriggerReminders` cancels existing reminders before scheduling
 *   a fresh one (avoids the snapshot-then-cancel race documented in #16).
 * - `cancelTriggerReminders` / `cancelDailyCheckIn` only cancel notifications
 *   matching their respective `data.type` — other scheduled notifications
 *   survive.
 * - Body text varies based on whether the user has selected example triggers.
 * - All schedule helpers swallow expo-notifications errors and return null
 *   rather than throwing into the caller.
 */

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
}));

jest.mock('../sentry', () => ({
  captureError: jest.fn(),
}));

import * as Notifications from 'expo-notifications';
import {
  scheduleTriggerReminders,
  cancelTriggerReminders,
  cancelDailyCheckIn,
  scheduleDailyCheckIn,
} from '../notifications';

const mockGetAll = Notifications.getAllScheduledNotificationsAsync as jest.MockedFunction<
  typeof Notifications.getAllScheduledNotificationsAsync
>;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.MockedFunction<
  typeof Notifications.scheduleNotificationAsync
>;
const mockCancel = Notifications.cancelScheduledNotificationAsync as jest.MockedFunction<
  typeof Notifications.cancelScheduledNotificationAsync
>;

function fakeScheduled(id: string, type: string) {
  return {
    identifier: id,
    content: { data: { type } },
    trigger: { type: 'daily', hour: 20, minute: 0 },
  } as unknown as Notifications.NotificationRequest;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('scheduleTriggerReminders', () => {
  it('cancels existing trigger reminders before scheduling a new one', async () => {
    mockGetAll.mockResolvedValue([
      fakeScheduled('old-1', 'trigger_reminder'),
      fakeScheduled('keep-1', 'daily_checkin'),
    ]);
    mockSchedule.mockResolvedValue('new-1');

    const id = await scheduleTriggerReminders(['Stress'], 19, 30);

    expect(id).toBe('new-1');
    // Stable-id cancel + legacy sweep of 'old-1'; daily_checkin untouched.
    expect(mockCancel).toHaveBeenCalledTimes(2);
    expect(mockCancel).toHaveBeenCalledWith('trigger-reminder');
    expect(mockCancel).toHaveBeenCalledWith('old-1');
    expect(mockCancel).not.toHaveBeenCalledWith('keep-1');
    // And we schedule exactly one new reminder — under the stable id (#96),
    // so concurrent schedules replace rather than duplicate.
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule.mock.calls[0][0].identifier).toBe('trigger-reminder');
  });

  it('uses default 20:00 when hour/minute are not provided', async () => {
    mockGetAll.mockResolvedValue([]);
    mockSchedule.mockResolvedValue('id');

    await scheduleTriggerReminders(['Stress']);

    const call = mockSchedule.mock.calls[0][0];
    expect((call.trigger as any).hour).toBe(20);
    expect((call.trigger as any).minute).toBe(0);
  });

  it('uses an example trigger in the body when triggers are provided', async () => {
    mockGetAll.mockResolvedValue([]);
    mockSchedule.mockResolvedValue('id');

    await scheduleTriggerReminders(['Stress'], 19, 0);

    const body = (mockSchedule.mock.calls[0][0].content as any).body as string;
    expect(body).toContain('Stress');
  });

  it('falls back to generic body when no triggers are provided', async () => {
    mockGetAll.mockResolvedValue([]);
    mockSchedule.mockResolvedValue('id');

    await scheduleTriggerReminders(undefined, 19, 0);

    const body = (mockSchedule.mock.calls[0][0].content as any).body as string;
    expect(body).toContain('Remember your plan');
  });

  it('returns null and does not throw if scheduling fails', async () => {
    mockGetAll.mockResolvedValue([]);
    mockSchedule.mockRejectedValue(new Error('boom'));

    const id = await scheduleTriggerReminders(['Stress'], 19, 0);

    expect(id).toBeNull();
  });
});

describe('cancelTriggerReminders', () => {
  it('only cancels notifications whose data.type is trigger_reminder', async () => {
    mockGetAll.mockResolvedValue([
      fakeScheduled('t-1', 'trigger_reminder'),
      fakeScheduled('t-2', 'trigger_reminder'),
      fakeScheduled('d-1', 'daily_checkin'),
      fakeScheduled('o-1', 'other'),
    ]);

    await cancelTriggerReminders();

    // Stable-id cancel first, then the two legacy trigger reminders.
    expect(mockCancel).toHaveBeenCalledTimes(3);
    expect(mockCancel).toHaveBeenCalledWith('trigger-reminder');
    expect(mockCancel).toHaveBeenCalledWith('t-1');
    expect(mockCancel).toHaveBeenCalledWith('t-2');
    expect(mockCancel).not.toHaveBeenCalledWith('d-1');
    expect(mockCancel).not.toHaveBeenCalledWith('o-1');
  });

  it('only issues the stable-id cancel when no legacy reminders exist', async () => {
    mockGetAll.mockResolvedValue([fakeScheduled('d-1', 'daily_checkin')]);

    await cancelTriggerReminders();

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(mockCancel).toHaveBeenCalledWith('trigger-reminder');
  });
});

describe('cancelDailyCheckIn', () => {
  it('only cancels notifications whose data.type is daily_checkin', async () => {
    mockGetAll.mockResolvedValue([
      fakeScheduled('d-1', 'daily_checkin'),
      fakeScheduled('t-1', 'trigger_reminder'),
    ]);

    await cancelDailyCheckIn();

    // Stable-id cancel first, then the legacy check-in.
    expect(mockCancel).toHaveBeenCalledTimes(2);
    expect(mockCancel).toHaveBeenCalledWith('daily-checkin');
    expect(mockCancel).toHaveBeenCalledWith('d-1');
    expect(mockCancel).not.toHaveBeenCalledWith('t-1');
  });
});

describe('scheduleDailyCheckIn', () => {
  it('cancels existing check-ins then schedules a new one', async () => {
    mockGetAll.mockResolvedValue([fakeScheduled('old-d', 'daily_checkin')]);
    mockSchedule.mockResolvedValue('new-d');

    const id = await scheduleDailyCheckIn(8, 30);

    expect(id).toBe('new-d');
    expect(mockCancel).toHaveBeenCalledWith('old-d');
    const call = mockSchedule.mock.calls[0][0];
    expect(call.identifier).toBe('daily-checkin');
    expect((call.trigger as any).hour).toBe(8);
    expect((call.trigger as any).minute).toBe(30);
    expect((call.content as any).data.type).toBe('daily_checkin');
  });

  it('returns null and does not throw if scheduling fails', async () => {
    mockGetAll.mockResolvedValue([]);
    mockSchedule.mockRejectedValue(new Error('boom'));

    const id = await scheduleDailyCheckIn();
    expect(id).toBeNull();
  });
});
