/**
 * Pages that are translations of each other but live at different slugs.
 *
 * `translatePath` can only swap the language prefix, which works for /privacy/
 * and the homes but not for the guides: /da/trappe-ned-snus/ is
 * /sv/trappa-ner-snus/ in Swedish. Without this map each guide named only
 * itself in hreflang, and the language switcher sent readers to the other
 * locale's home instead of the same guide. Google had no hreflang path between
 * them, and several of these pages were unknown to it (#381).
 *
 * A set lists only pages that really are the same page: same sections, same
 * purpose. The English guides are longer but follow the same outline. Add a
 * page here only when that is true; check-build verifies every target exists
 * and that each page names the others back.
 */

export type Locale = 'en' | 'da' | 'sv' | 'no';
export type TranslationSet = Partial<Record<Locale, string>>;

export const TRANSLATION_SETS: TranslationSet[] = [
  // The app
  {
    en: '/snus-reduction-app/',
    da: '/da/stop-med-snus-app/',
    sv: '/sv/sluta-snusa-app/',
    no: '/no/slutte-med-snus-app/',
  },
  // Gradual reduction, step by step
  {
    en: '/how-to-reduce-snus/',
    da: '/da/hvordan-stopper-man-med-snus/',
    sv: '/sv/hur-slutar-man-snusa/',
    no: '/no/hvordan-slutte-med-snus/',
  },
  // Cravings
  {
    en: '/how-to-handle-nicotine-cravings/',
    da: '/da/nikotin-trang-hjaelp/',
    sv: '/sv/nikotinsug-hjalp/',
    no: '/no/nikotinsug-hjelp/',
  },
  // Tapering (no English counterpart)
  {
    da: '/da/trappe-ned-snus/',
    sv: '/sv/trappa-ner-snus/',
    no: '/no/trappe-ned-snus/',
  },
];

/** The translation set a page belongs to, if any. */
export function translationsFor(pathname: string): TranslationSet | undefined {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return TRANSLATION_SETS.find((set) => Object.values(set).includes(path));
}
