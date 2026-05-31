export type CurrencyCode = 'DKK' | 'SEK' | 'NOK' | 'EUR' | 'USD';

export const CURRENCY_OPTIONS: Array<{ code: CurrencyCode; label: string; locale: string }> = [
  { code: 'DKK', label: 'Danske kroner (DKK)', locale: 'da-DK' },
  { code: 'SEK', label: 'Svenske kroner (SEK)', locale: 'sv-SE' },
  { code: 'NOK', label: 'Norske kroner (NOK)', locale: 'nb-NO' },
  { code: 'EUR', label: 'Euro (EUR)', locale: 'de-DE' },
  { code: 'USD', label: 'US dollars (USD)', locale: 'en-US' },
];

const VALID_CURRENCY_CODES: ReadonlySet<CurrencyCode> = new Set(
  CURRENCY_OPTIONS.map((c) => c.code),
);

/**
 * Narrow an arbitrary string (e.g. from the DB) to a `CurrencyCode`. Falls
 * back to the default `'DKK'` if the value is null/undefined/unknown. Use this
 * at every external boundary so the inline 5-way `===` check doesn't get
 * duplicated.
 */
export function parseCurrency(value: string | null | undefined, fallback: CurrencyCode = 'DKK'): CurrencyCode {
  if (value && VALID_CURRENCY_CODES.has(value as CurrencyCode)) {
    return value as CurrencyCode;
  }
  return fallback;
}

export function formatMoney(cents: number, currency: CurrencyCode): string {
  const value = (cents ?? 0) / 100;

  if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function') {
    const locale = CURRENCY_OPTIONS.find((c) => c.code === currency)?.locale ?? 'en-US';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      // Fall through to simple formatting.
    }
  }

  return `${currency} ${value.toFixed(2)}`;
}

