/**
 * App Store click tracking (#304).
 *
 * Every link to the App Store must carry the same event name and the same
 * dimensions, or the numbers cannot be compared. Before this existed the site
 * had five different shapes: `source="header"` with no locale, `source="badge"`
 * with a locale, a generic `source="button"`, a `source="midpage"`, and 46
 * links (the footer on all 41 pages, plus five in blog prose) with no event at
 * all. A measurement cycle was spent unable to tell which surface produced
 * anything.
 *
 * The event name stays `app-store-click` so the one figure that was already
 * meaningful, the total, remains comparable across this change. The dimensions
 * are new: `placement` replaces the old `source`, and `locale` is now on every
 * event rather than only the badge.
 *
 * `page` is deliberately absent: Umami already records the URL an event fires
 * on, so a page field would duplicate it.
 *
 * Nothing user-specific goes in here. These are static strings decided at
 * build time, never plan data, baseline, price or trigger names.
 */

/** Where on the page the link sits. Keep this list short and meaningful. */
export type AppStorePlacement =
  'header' | 'hero' | 'midpage' | 'bottom-cta' | 'in-article' | 'footer';

export const APP_STORE_EVENT = 'app-store-click';

/**
 * Spread onto an anchor: `<a {...appStoreTracking('footer', lang)}>`.
 */
export function appStoreTracking(placement: AppStorePlacement, locale: string) {
  return {
    'data-umami-event': APP_STORE_EVENT,
    'data-umami-event-placement': placement,
    'data-umami-event-locale': locale,
  };
}
