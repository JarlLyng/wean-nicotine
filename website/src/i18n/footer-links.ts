/**
 * The guides, listed above the footer on every page (#303, #396).
 *
 * Each locale links only within itself (#98): a Danish reader is not dropped
 * into English pages from a Danish page, nor the other way. The list is also
 * how most guides are reached at all; check-build fails a page nothing links
 * to, and three Nordic guides sat orphaned that way until #303.
 *
 * English has ten pages in two groups. The Nordic locales have four each.
 */
import type { Locale } from './translations';

export interface GuideLink {
  href: string;
  label: string;
}

export interface GuideGroup {
  heading: string;
  links: GuideLink[];
}

export interface LocaleGuides {
  /** The accessible name of the list's <nav>. */
  label: string;
  groups: GuideGroup[];
}

export const GUIDE_LINKS: Record<Locale, LocaleGuides> = {
  en: {
    label: 'Guides',
    groups: [
      {
        heading: 'Resources',
        links: [
          { href: '/snus-reduction-app/', label: 'Snus Reduction App' },
          { href: '/nicotine-pouch-reduction-app/', label: 'Nicotine Pouch Reduction' },
          { href: '/how-to-reduce-snus/', label: 'How to Reduce Snus' },
          { href: '/how-to-quit-nicotine-pouches/', label: 'How to Quit Nicotine Pouches' },
          { href: '/wean-vs-habit-tracker/', label: 'Wean vs. Habit Tracker' },
        ],
      },
      {
        heading: 'Guides',
        links: [
          { href: '/how-to-handle-nicotine-cravings/', label: 'Handle Nicotine Cravings' },
          { href: '/taper-nicotine/', label: 'Taper Nicotine' },
          { href: '/gradual-reduction-vs-cold-turkey/', label: 'Gradual vs. Cold Turkey' },
          { href: '/track-snus-use/', label: 'Track Snus Use' },
          { href: '/track-nicotine-pouches/', label: 'Track Nicotine Pouches' },
          { href: '/private-quit-nicotine-app/', label: 'Private Quit App' },
        ],
      },
    ],
  },
  da: {
    label: 'Guider',
    groups: [
      {
        heading: 'Guider',
        links: [
          { href: '/da/trappe-ned-snus/', label: 'Trappe ned på snus' },
          { href: '/da/hvordan-stopper-man-med-snus/', label: 'Sådan stopper du med snus' },
          { href: '/da/nikotin-trang-hjaelp/', label: 'Hjælp til nikotintrang' },
          { href: '/da/stop-med-snus-app/', label: 'Appen til nedtrapning' },
        ],
      },
    ],
  },
  sv: {
    label: 'Guider',
    groups: [
      {
        heading: 'Guider',
        links: [
          { href: '/sv/trappa-ner-snus/', label: 'Trappa ner snus' },
          { href: '/sv/hur-slutar-man-snusa/', label: 'Så slutar du snusa' },
          { href: '/sv/nikotinsug-hjalp/', label: 'Hjälp mot nikotinsug' },
          { href: '/sv/sluta-snusa-app/', label: 'Appen för nedtrappning' },
        ],
      },
    ],
  },
  no: {
    label: 'Guider',
    groups: [
      {
        heading: 'Guider',
        links: [
          { href: '/no/trappe-ned-snus/', label: 'Trappe ned snus' },
          { href: '/no/hvordan-slutte-med-snus/', label: 'Slik slutter du med snus' },
          { href: '/no/nikotinsug-hjelp/', label: 'Hjelp mot nikotinsug' },
          { href: '/no/slutte-med-snus-app/', label: 'Appen for nedtrapping' },
        ],
      },
    ],
  },
};
