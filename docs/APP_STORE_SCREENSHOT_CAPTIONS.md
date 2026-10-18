# App Store screenshot captions

Purpose:

- The captions on the App Store posters, what each poster shows, and why it is in the set

Audience:

- Maintainers remaking or reordering the set
- LLMs asked to write or check screenshot copy

Source of truth:

- [`appstore/manifest.json`](../appstore/manifest.json) holds the captions the posters are built from. If this file and the manifest disagree, the manifest wins, and this file is out of date
- The app's code for every claim a caption makes

Related files:

- [`appstore/README.md`](../appstore/README.md): how the captures and posters are made
- [`docs/APP_STORE_METADATA.md`](./APP_STORE_METADATA.md): the rest of the listing copy
- [`lib/capture-mode.ts`](../lib/capture-mode.ts): the sample month on every screen

Update when:

- A caption, the order or a screen in the set changes
- The app changes something a caption claims

---

## The set (October 2026, app version 1.7.1)

Six posters at 6.9" (1320 × 2868), in English. Apple scales them down to every smaller iPhone.
The Danish, Norwegian and Swedish listings show the English set: the app's interface is English
(#315), so a localized caption would sit above an English screen. Localized captions come when
the app is localized.

The first three show in search results, so they carry the three things a shopper decides on:
the method, the tone and the price. The other three follow the app the way it is used.

| #   | File               | Screen                                         | Caption                                               |
| --- | ------------------ | ---------------------------------------------- | ----------------------------------------------------- |
| 1   | `iphone-6.9-1.png` | Today, 2 of 6 pouches                          | Less snus, fewer pouches, **week by week**            |
| 2   | `iphone-6.9-2.png` | Progress, last week, every day within the plan | Progress without **the pressure**                     |
| 3   | `iphone-6.9-3.png` | Settings: reminder, plan, export               | Pay once. **No subscription.**                        |
| 4   | `iphone-6.9-4.png` | Progress, Patterns and milestones              | Learn when and why you **reach for one**              |
| 5   | `iphone-6.9-5.png` | Tools for cravings                             | Ride out **a craving**                                |
| 6   | `iphone-6.9-6.png` | Export, the share sheet with the CSV file      | Your log stays on your iPhone, **until you share it** |

The phrase in bold is the one emphasis on each poster: a magenta chip with black text, never
magenta text on the light ground.

## What each caption rests on

1. **Less snus, fewer pouches, week by week.** The daily allowance steps down every week at the
   pace the user picks (`calculateDailyAllowance` in `lib/taper-plan.ts`). Both words people
   search for, snus and pouches, are in the first caption.
2. **Progress without the pressure.** There is no streak or "days clean" counter, a day above the
   plan is drawn in a soft tint rather than red (1.7.1, #398), and the screen says "Every day
   stayed within your plan."
3. **Pay once. No subscription.** The app is a one-time purchase on every storefront. There are no
   in-app purchases, no subscription and no ads in the code or the listing. The caption names no
   price, since each storefront sets its own and Apple asks for none on screenshots. Never "free".
4. **Learn when and why you reach for one.** The Patterns card counts pouches by time of day and
   by tagged trigger over the last 30 days (`getUsagePatterns` in `lib/progress.ts`).
5. **Ride out a craving.** The guided breathing exercise, urge surfing and reflection prompts.
6. **Your log stays on your iPhone, until you share it.** The log is kept in SQLite on the phone
   with no account. Export writes a CSV and opens the share sheet, so the file goes only where the
   user sends it (#43). The caption says "your log", not "everything", because crash reports do
   leave the phone (Sentry, `docs/PRIVACY_APP_STORE.md`).

## Rules the captions follow

- One benefit per poster, and at most one emphasis.
- The hub's `VOICE.md` with Wean's overlay: no em-dashes, no exclamation marks, no hype, and the
  gentlest tone in the portfolio. No streak, shame or war language (nothing about fighting or
  beating anything), and a day over the plan is never framed as failure.
- No claim the app can't back, no medical claim, and no "quit" or "cured" promise.
- No third-party brand on any poster, and no price.
- Line breaks are set by hand in the manifest, so the emphasis never wraps across lines.
- Every number on screen comes from the capture build's sample month, which the app computed.
  The sample can is priced in dollars, so the English set shows no kroner.
- The repo is public, so this file and any text about the set go through the hub's
  `tools/public_text_check.py`.
