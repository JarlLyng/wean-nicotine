/**
 * Per-locale footer guide links (#303).
 *
 * The English Resources/Guides columns are declared inline in Layout.astro and
 * gated on `lang === 'en'`. That gate is deliberate (#98): Nordic readers
 * should not be dropped into English pages from a Danish footer.
 *
 * The side effect was that the Nordic locales got no guide links at all, so
 * each locale's content cluster was reachable only from inside itself. The
 * three craving guides had zero inbound links anywhere on the site, and a
 * reader landing on /da/ had no path to a single Danish page.
 *
 * This gives each Nordic locale its own column, linking only within that
 * locale. English stays where it is: it has ten pages across two themed
 * columns, and squeezing that into the same shape as a four-page locale would
 * misrepresent both.
 */

export interface FooterLink {
  href: string;
  label: string;
}

export interface LocaleFooter {
  heading: string;
  links: FooterLink[];
}

/** Locales with their own content cluster. English is handled in Layout.astro. */
export const NORDIC_FOOTER: Record<string, LocaleFooter> = {
  da: {
    heading: 'Guider',
    links: [
      { href: '/da/trappe-ned-snus/', label: 'Trappe ned på snus' },
      { href: '/da/hvordan-stopper-man-med-snus/', label: 'Sådan stopper du med snus' },
      { href: '/da/nikotin-trang-hjaelp/', label: 'Hjælp til nikotintrang' },
      { href: '/da/stop-med-snus-app/', label: 'Appen til nedtrapning' },
    ],
  },
  sv: {
    heading: 'Guider',
    links: [
      { href: '/sv/trappa-ner-snus/', label: 'Trappa ner snus' },
      { href: '/sv/hur-slutar-man-snusa/', label: 'Så slutar du snusa' },
      { href: '/sv/nikotinsug-hjalp/', label: 'Hjälp mot nikotinsug' },
      { href: '/sv/sluta-snusa-app/', label: 'Appen för nedtrappning' },
    ],
  },
  no: {
    heading: 'Guider',
    links: [
      { href: '/no/trappe-ned-snus/', label: 'Trappe ned snus' },
      { href: '/no/hvordan-slutte-med-snus/', label: 'Slik slutter du med snus' },
      { href: '/no/nikotinsug-hjelp/', label: 'Hjelp mot nikotinsug' },
      { href: '/no/slutte-med-snus-app/', label: 'Appen for nedtrapping' },
    ],
  },
};
