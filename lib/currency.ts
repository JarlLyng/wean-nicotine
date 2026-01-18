export type CurrencyCode = 'DKK' | 'SEK' | 'NOK' | 'EUR' | 'USD';

export const CURRENCY_OPTIONS: Array<{ code: CurrencyCode; label: string; locale: string }> = [
  { code: 'DKK', label: 'Danske kroner (DKK)', locale: 'da-DK' },
  { code: 'SEK', label: 'Svenske kroner (SEK)', locale: 'sv-SE' },
  { code: 'NOK', label: 'Norske kroner (NOK)', locale: 'nb-NO' },
  { code: 'EUR', label: 'Euro (EUR)', locale: 'de-DE' },
  { code: 'USD', label: 'US dollars (USD)', locale: 'en-US' },
];

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

