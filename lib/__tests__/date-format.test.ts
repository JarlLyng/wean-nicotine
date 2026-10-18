/**
 * Tests for the locale-aware date and time labels (#409).
 *
 * The copy is English, but day/month order and the 12- or 24-hour clock must
 * follow the phone's region. Before this, Cost Savings wrote 18/9/2026 on a
 * US phone while Progress wrote 9/18/2026, and Settings said 20:00.
 *
 * The exact characters come from ICU and can shift between versions (en-GB's
 * September became "Sept"), so the assertions pin order and clock style
 * rather than every character where that is the point being tested.
 */

import {
  formatDayMonth,
  formatMediumDate,
  formatMonthYear,
  formatNumericDate,
  formatTimeOfDay,
} from '../date-format';

// 18 September 2026, local time. Day 18 cannot be read as a month, so the
// order is unambiguous in every assertion below.
const SEP_18 = new Date(2026, 8, 18, 9, 30);

describe('formatNumericDate', () => {
  it('puts the month first on a US phone, matching Progress', () => {
    expect(formatNumericDate(SEP_18, 'en-US')).toBe('9/18/2026');
  });

  it('puts the day first in day-first regions', () => {
    expect(formatNumericDate(SEP_18, 'en-GB')).toBe('18/09/2026');
    expect(formatNumericDate(SEP_18, 'da-DK')).toBe('18.9.2026');
  });

  it('accepts a timestamp as well as a Date', () => {
    expect(formatNumericDate(SEP_18.getTime(), 'en-US')).toBe('9/18/2026');
  });

  it('uses the device locale when none is passed', () => {
    expect(formatNumericDate(SEP_18)).toBe(
      SEP_18.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' }),
    );
  });
});

describe('formatDayMonth', () => {
  it('drops the year and keeps the locale order', () => {
    expect(formatDayMonth(SEP_18, 'en-US')).toBe('9/18');
    expect(formatDayMonth(SEP_18, 'en-GB')).toBe('18/09');
  });
});

describe('formatMonthYear', () => {
  it('writes a short month name and the year', () => {
    expect(formatMonthYear(SEP_18, 'en-US')).toBe('Sep 2026');
    expect(formatMonthYear(SEP_18, 'en-GB')).toMatch(/^Sept? 2026$/);
  });
});

describe('formatMediumDate', () => {
  it('follows the locale order around the month name', () => {
    expect(formatMediumDate(SEP_18, 'en-US')).toBe('Sep 18, 2026');
    expect(formatMediumDate(SEP_18, 'en-GB')).toMatch(/^18 Sept? 2026$/);
  });
});

describe('formatTimeOfDay', () => {
  it('uses the 12-hour clock on a US phone', () => {
    // ICU puts a narrow no-break space before PM; \s matches it.
    expect(formatTimeOfDay(20, 0, 'en-US')).toMatch(/^8:00\sPM$/);
  });

  it('uses the 24-hour clock where that is the custom', () => {
    expect(formatTimeOfDay(20, 0, 'en-GB')).toBe('20:00');
    expect(formatTimeOfDay(20, 0, 'da-DK')).toBe('20.00');
  });

  it('pads minutes and handles the hour after midnight', () => {
    // Whether the hour gets a leading zero is ICU's call; the minutes always do.
    expect(formatTimeOfDay(7, 5, 'en-GB')).toMatch(/^0?7:05$/);
    expect(formatTimeOfDay(0, 5, 'en-US')).toMatch(/^12:05\sAM$/);
  });

  it('defaults to the top of the hour', () => {
    expect(formatTimeOfDay(18, undefined, 'en-GB')).toBe('18:00');
  });
});
