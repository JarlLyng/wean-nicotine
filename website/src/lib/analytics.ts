/**
 * Store click tracking (#304, #393).
 *
 * Every link to the App Store carries the same event and dimensions, or the
 * numbers cannot be compared. Most of them now come from the design system's
 * store fragments (src/store/, rendered by StoreButton.astro), which carry the
 * portfolio's event: `store-click` with `store`, `placement` and `locale`.
 * This helper gives the few hand-written links (the footer and blog prose) the
 * same shape, so all of them read as one series in Umami.
 *
 * The event was `app-store-click` until #393. Umami keeps the two names
 * apart, so totals from before and after the switch have to be added up by hand.
 *
 * `page` is deliberately absent: Umami already records the URL an event fires
 * on. Nothing user-specific goes in here: these are static strings decided at
 * build time, never plan data, baseline, price or trigger names.
 */

/** Where on the page the link sits. The fragments use nav, hero and midpage. */
export type StorePlacement = 'nav' | 'hero' | 'midpage' | 'footer' | 'in-article';

export const STORE_EVENT = 'store-click';

/**
 * Spread onto an anchor: `<a {...storeTracking('footer', lang)}>`.
 */
export function storeTracking(placement: StorePlacement, locale: string) {
  return {
    'data-umami-event': STORE_EVENT,
    'data-umami-event-store': 'app-store',
    'data-umami-event-placement': placement,
    'data-umami-event-locale': locale,
  };
}
