# AI Context

This file is the canonical fast-path for understanding the repository.

Purpose:

- Provide a canonical repo overview for humans and LLMs

Audience:

- Maintainers onboarding to the codebase
- LLMs performing implementation, review, or planning tasks

Source of truth:

- Code remains canonical for exact runtime behavior
- This document is the top-level architectural summary

Related files:

- [`docs/README.md`](./README.md)
- [`README.md`](../README.md)
- [`app/_layout.tsx`](../app/_layout.tsx)
- [`lib/models.ts`](../lib/models.ts)
- [`lib/db.ts`](../lib/db.ts)

Update when:

- The repo structure changes
- A subsystem is added or removed
- Core business rules or runtime assumptions change

## One-Screen Summary

- `Wean Nicotine` is a mobile app that helps users reduce snus and nicotine pouch usage gradually.
- The repo is **public** under MIT, also contains the marketing site in `website/`.
- The app is local-first by design. No backend, no account system, no cloud sync.
- The mobile app uses Expo SDK 55, Expo Router, SQLite, Expo Notifications, Sentry, and React Compiler.
- The website uses Astro and contains SEO landing pages in EN/DA/SV/NO.
- Latest live App Store version: **1.6.0** (iOS build 22, approved July 2026) — small quality release (pace timeline preview, 10s undo, softer baseline copy, notification-race fix) that also carried the ASO metadata pass (new SV/NO subtitles + rebuilt keyword fields). See [CHANGELOG.md](../CHANGELOG.md) for the full history (incl. the 1.4.0/build 18 TestFlight-only regression).

## What Exists In This Repo

### 1. Mobile app

- Path: `app/`, `components/`, `hooks/`, `lib/`, `plugins/`
- Runtime: Expo / React Native
- Primary target: iPhone first, mobile only
- Persistence: SQLite on native via `expo-sqlite`

### 2. Marketing website

- Path: `website/`
- Runtime: Astro
- Purpose: product marketing, privacy page, support pages, SEO landing pages

### 3. Documentation

- Path: `docs/`
- Purpose: architecture summaries, strategy, release ops, App Store material

### 4. Maintainer scripts

- Path: `scripts/`
- Runtime: Python (one dependency, `pyjwt[crypto]`, in a gitignored `.venv`)
- Purpose: local tooling. `asc_downloads.py` pulls App Store Connect download/sales numbers from the command line. No secrets in the repo — credentials come from a gitignored `.env` and the `.p8` key stays out of git. See [`scripts/README.md`](../scripts/README.md).

## System Boundaries

### In scope

- Onboarding for taper settings
- Daily logging of pouch use and cravings resisted
- Daily allowance calculation based on a taper plan
- Progress and savings views
- Optional local notifications
- Local analytics for app improvement
- Marketing site and SEO content

### Out of scope in the current app

- User accounts
- Cloud sync
- Shared/community features
- Medical advice
- AI personalization inside the product

## Runtime Assumptions

- Native mobile is the real target. Web exists only as a limited rendering fallback.
- SQLite is not available on web, so persistence is native-only.
- Notifications require a development build or production build. Expo Go is not sufficient for full notification testing.
- Sentry is disabled on web and does not send events in `__DEV__`.

## Mobile App Architecture

### Entry and initialization

- [`app/_layout.tsx`](../app/_layout.tsx) initializes Reanimated, Sentry (with `Sentry.wrap()` and navigation tracking), theming, and the root stack.
- [`hooks/useAppInitialize.ts`](../hooks/useAppInitialize.ts) initializes the database and local analytics on launch.
- [`app/index.tsx`](../app/index.tsx) decides whether the user goes to onboarding or the main tabs based on stored taper settings.

### Navigation model

- `app/(onboarding)/`: welcome, baseline, pace (3–15% weekly reduction), price, triggers — 4 setup steps
- `app/(tabs)/home.tsx`: daily allowance and quick logging; data layer lives in [`hooks/useHomeData.ts`](../hooks/useHomeData.ts); 10-second undo toast after every log entry; optional post-log trigger-tag row; a gentle pace-adjustment nudge and a one-time goal-reached celebration surface here when their conditions are met
- `app/(tabs)/progress.tsx`: progress summary with 7-day bar chart, trend tracking, milestones, and a usage-pattern card (time-of-day + trigger breakdown)
- `app/(tabs)/tools/`: breathing, urge-surfing, reflection support flows
- `app/(tabs)/settings/`: notifications, theme, edit plan (baseline/pace/price), start over

### UI system

- [`lib/design.ts`](../lib/design.ts) defines the IAMJARL Design System tokens (aligned with the upstream v1.x source of truth at <https://github.com/JarlLyng/iamjarl-design>).
- [`lib/theme.ts`](../lib/theme.ts) exposes backward-compatible theme helpers.
- [`components/Screen.tsx`](../components/Screen.tsx) is a content wrapper (no title/SafeAreaView — native headers handle that).
- `components/ui/` contains reusable primitives: `Button` (with haptics), `Card`, `ProgressRing`, `Icon` (Phosphor), `Chip`, `StatCard`, `IconSymbol` (SF Symbols for tabs), `Toast` (transient notification with optional action).
- `components/` also holds feature-scoped, non-primitive blocks composed onto screens: `TriggerTagRow`, `PatternsCard`, `PaceNudge`, `GoalReachedCard` (Home/Progress), and `Screen`.
- Navigation uses native iOS tab bar (SF Symbols) and native Expo Router Stack headers with Large Title support.
- React Compiler is enabled (`reactCompiler: true`) for automatic memoization.

## Domain Model

Canonical types live in [`lib/models.ts`](../lib/models.ts).

### `TaperSettings`

Represents the user’s taper setup.

- `baselinePouchesPerDay`: starting point for the plan
- `pricePerCan`: optional savings input
- `currency`: optional price currency
- `weeklyReductionPercent`: planned reduction rate
- `startDate`: when the plan starts
- `triggers`: optional reminder/craving contexts selected during onboarding

There is effectively one active settings row in the app.

### `LogEntry`

Tracks timestamped user actions.

- `pouch_used`
- `craving_resisted`

Entries can optionally carry a `trigger` tag (one of the user's onboarding-selected triggers, added via the post-log tag row on Today — migration v8, #220). These logs drive daily counts and progress summaries.

### Local analytics

`lib/analytics.ts` stores local-only usage events in SQLite. This is not third-party product analytics.

## Storage Model

Primary implementation lives in [`lib/db.ts`](../lib/db.ts).

### Core tables

- `log_entries`
- `taper_settings`
- `app_preferences`
- `breathing_sessions`
- `reflections`
- `schema_version`
- `analytics`

The `user_plan` cache table was dropped in v1.4.0 (migration v7). The daily allowance is recomputed from `TaperSettings` on every focus; no cache needed.

### Storage rules

- Database initialization is lazy and concurrency-safe.
- Migrations are versioned in the `MIGRATIONS` array in `lib/db.ts`.
- Domain operations are split into focused modules such as `lib/db-settings.ts` and `lib/db-log-entries.ts`.
- Web uses stubs and dummy data to avoid bundling or runtime failures.

The storage rationale is documented in [`decisions/storage.md`](./decisions/storage.md).

## Business Rules

### Daily allowance formula

Canonical implementation: [`lib/taper-plan.ts`](../lib/taper-plan.ts)

Rule:

`baselinePouchesPerDay * (1 - weeklyReductionPercent / 100) ^ fullWeeksSinceStart`

Important details:

- Only full weeks count toward reduction.
- The reduction percent is clamped to `0..100`.
- The result is rounded to one decimal place (this precision is load-bearing — flooring the stored value would stall gentle paces).
- The result is clamped so it never falls below `0` or above baseline.
- **Display vs. math:** the stored allowance keeps its decimal, but the Today screen shows the whole-pouch FLOOR via `getDisplayAllowance()` — you can't use half a pouch, and flooring is the forgiving direction (staying under the shown number keeps you under the real one). The goal-reached celebration triggers on `getDisplayAllowance() === 0`.
- `estimateWeeksToZero()` iterates this exact formula (rounding + display floor) so the onboarding Pace preview can promise a timeline that provably matches what the app will do.

### Progress interpretation

- The home screen compares today’s `pouch_used` count with the current allowance.
- “Avoided” values are derived relative to the user’s baseline, not from an externally stored target.
- All allowance computation reads `TaperSettings` directly via `lib/taper-plan.ts` — there is no cached plan row to regenerate.
- `lib/progress.ts` also derives non-milestone insight: `getUsagePatterns()` (pouches by part-of-day and by tagged trigger, trailing 30 days) and `assessPace()` (flags when trailing-2-week usage runs ≥20% over allowance, driving the Home pace nudge). Both have pure, unit-tested cores (`computeUsagePatterns` / `computePaceAssessment`).
- Milestone achievement times use one shared cumulative day-walk across pouch, money, **and** craving thresholds (unified in #92).

### Notifications

Canonical implementation: [`lib/notifications.ts`](../lib/notifications.ts)

- Supports a daily check-in reminder.
- Supports a single daily trigger reminder based on selected triggers.
- Both are scheduled with **stable identifiers** (`daily-checkin` / `trigger-reminder`), so re-scheduling atomically replaces the request and concurrent schedules can't duplicate (#96). The cancel helpers hit the stable id directly and keep a `data.type` sweep only to clean up legacy random-id requests from pre-#96 installs.
- In-app review prompts go through `lib/store-review.ts` (`maybeRequestReview`), gated on plan age ≥14 days, ≥90 days between asks, and StoreKit availability. It records before requesting so a failed prompt never double-asks. No network calls, no user data.

## Testing

- `jest-expo` preset configured in `package.json`.
- Unit tests live under `lib/__tests__/` (6 suites).
  - [`taper-plan.test.ts`](../lib/__tests__/taper-plan.test.ts): allowance math, default plan generation, whole-pouch display floor, weeks-to-zero estimate, edge cases.
  - [`progress.test.ts`](../lib/__tests__/progress.test.ts): weekly progress, total + milestone detection (unified day-walk), usage patterns, pace assessment, week boundaries. DB layer (`getLogEntries`) is mocked.
  - [`cost-savings.test.ts`](../lib/__tests__/cost-savings.test.ts): currency-aware savings projections.
  - [`notifications.test.ts`](../lib/__tests__/notifications.test.ts): reminder scheduling + cancel logic (stable identifiers + legacy sweep).
  - [`sentry-scrubber.test.ts`](../lib/__tests__/sentry-scrubber.test.ts): PII scrubbing.
  - [`store-review.test.ts`](../lib/__tests__/store-review.test.ts): review-prompt gate logic.
- Run tests: `npm test` or `npm run test:watch`.
- Target: pure functions in `lib/` are fully covered. Screen and hook tests are not part of the baseline.

## Website Architecture

### Purpose

- Explain the product
- Rank for high-intent SEO queries
- Provide privacy and support pages

### Key files

- [`website/src/lib/site.ts`](../website/src/lib/site.ts): site metadata, constants, and **Campaign Tracking logic** (`getCampaignAppStoreUrl`)
- [`website/src/layouts/SeoLandingLayout.astro`](../website/src/layouts/SeoLandingLayout.astro): standard programmatic wrapper for high-intent SEO pages
- [`website/src/components/AppStoreBadge.astro`](../website/src/components/AppStoreBadge.astro): localized official Apple Store badges (SVG)
- `website/src/pages/index.astro`: homepage
- `website/src/pages/privacy.astro`: privacy policy
- `website/src/pages/support.astro`: support page
- `website/src/pages/*/index.astro`: SEO landing pages
- `website/src/pages/da`, `website/src/pages/no`, `website/src/pages/sv`: localized folders with SEO-optimized pathnames
- [`website/src/components/NordicHome.astro`](../website/src/components/NordicHome.astro): shared da/sv/no home template — those three `index.astro` pages are content-only objects passed in (the EN home is standalone; it's structurally richer). Hero images are optimized to AVIF/WebP via `astro:assets` (`Picture`) from `website/src/assets/`.

### Strategy linkage

### Scale-out logic

The website uses a **programmatic SEO approach**:

1.  New landing pages are created in localized folders (e.g., `/da/stop-med-snus-app/`).
2.  Each page uses `SeoLandingLayout.astro`, which handles standard headers, CTAs, and SEO metadata.
3.  Each layout instance is provided a `campaignToken` (e.g., `seo_da_app`), which is used by `getCampaignAppStoreUrl` to append Apple Search Ads / App Store Connect metrics (`pt` and `ct` parameters).

SEO/ASO strategy, keyword targets, competitive positioning, and channel plans are tracked in the private IAMJARL strategy hub — see `WeanNicotine/` in [JarlLyng/iamjarl-strategy](https://github.com/JarlLyng/iamjarl-strategy) (access-restricted). Anything you wouldn't want a competitor reading lives there, not here.

## Source Of Truth By Concern

- Product behavior: code in `app/` and `lib/`
- Domain types: [`lib/models.ts`](../lib/models.ts)
- Design tokens: [`lib/design.ts`](../lib/design.ts), [`lib/theme.ts`](../lib/theme.ts)
- Persistence: [`lib/db.ts`](../lib/db.ts) and `lib/db-*.ts`
- Home screen data layer: [`hooks/useHomeData.ts`](../hooks/useHomeData.ts)
- Shared magic numbers / tunables (pouches-per-can, milestone thresholds, notification + pace-nudge + review-prompt constants): [`lib/constants.ts`](../lib/constants.ts)
- In-app review prompt: [`lib/store-review.ts`](../lib/store-review.ts)
- Notifications: [`lib/notifications.ts`](../lib/notifications.ts)
- Error reporting: [`lib/sentry.ts`](../lib/sentry.ts) — includes the PII scrubber and `sendDefaultPii: false`. Privacy hardening details in [`SENTRY.md`](./SENTRY.md).
- Tests: `lib/__tests__/` (jest-expo, 94 tests across 6 suites). Run via `npm test` or `npm run check`.
- Task tracking: [GitHub Issues](https://github.com/JarlLyng/wean-nicotine/issues) with labels `P1`/`P2`/`P3`, `seo`, `aso`, `website`, `marketing`, `enhancement`.
- Outside contributions: [`CONTRIBUTING.md`](../CONTRIBUTING.md) sets expectations for bug reports, feature requests, and PRs.
- Security: [`SECURITY.md`](../SECURITY.md) for vulnerability disclosure. Repo has CodeQL + Dependabot + secret scanning enabled.
- Repo-level orientation: [`docs/README.md`](./README.md)

## Change Checklist For LLMs And Contributors

- Before editing a screen, inspect both the route file and the supporting `lib/` module or hook it depends on (e.g., home.tsx → `hooks/useHomeData.ts`).
- Before changing a data field, update `lib/models.ts`, the relevant `db-*.ts` files, and any migration needs in `lib/db.ts`.
- Before changing the tapering logic in `lib/taper-plan.ts`, run `npm test` — changes should not break the existing unit tests unless the rule itself is changing.
- Before changing visual tokens, inspect `lib/design.ts`, `lib/theme.ts`, and shared UI primitives.
- Before changing notifications, inspect both settings screens and `lib/notifications.ts`.
- Before changing website messaging, check whether the change should also affect SEO docs, privacy copy, or App Store metadata.
- Before adding a new route, re-run `npx expo start` once so `.expo/types/router.d.ts` regenerates typed routes.

## Known Pitfalls

- Web support is partial and should not be treated as a production target for the app.
- Notifications can appear broken in Expo Go even when code is correct.
- Some docs are strategic and can lag behind implementation if not maintained. Resolve conflicts in favor of code, then update docs.

### Dependency drift past Expo SDK 55

The single most important pitfall this repo has hit. Three separate symptoms — all root-caused to the same drift:

1. **Codegen `TypeError: expand is not a function` during `pod install`** — caused by `react-native@0.83.9` (Dependabot bump) drifting past the SDK 55 manifest (which expects `0.83.6`). Same shape blocked TestFlight build 18.
2. **`Cannot find module 'babel-preset-expo'` in CI** — happens when patch bumps move `@react-navigation/bottom-tabs` or similar to versions that pull a `babel-preset-expo@56.x` dep into the tree.
3. **`pod install … None of your spec sources contain a spec satisfying the dependency: Sentry (= 9.15.0)`** — separate but compounding issue from stale CocoaPods spec repo.

The fix that holds up:

- `.github/dependabot.yml` blocks **all** semver levels (major, minor, **and patch**) for `expo`, `expo-*`, `babel-preset-expo`, `react`, `react-dom`, `react-native`, `@types/react`, the major `react-native-*` libs (`reanimated`, `worklets`, `gesture-handler`, `screens`, `safe-area-context`, `svg`), `@react-navigation/*`, and the Expo tooling the `expo-*` glob misses because the names don't start with `expo-`: `jest-expo` and `eslint-config-expo`. Don't loosen this without a deliberate SDK upgrade.
- Mind the glob gaps. `jest-expo@56` / `eslint-config-expo@56` belong to SDK 56 and fail CI on an SDK 55 tree (#185, #186). React Navigation is subtler: a local EAS build of the `@react-navigation/bottom-tabs@7.17.2` bump (#184) _built fine_ and didn't leak `babel-preset-expo@56`, but `expo doctor` went red on the version mismatch. "It builds" is not the bar — matching the SDK manifest (whatever `npx expo install --fix` chooses) is.
- When Expo ships a new SDK (or you want to bump intentionally):
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  CI=1 npx expo install --fix
  # commit + verify with a local EAS build before opening a PR
  ```
- Before EAS local build: `pod repo update` if it's been more than a week.
- Never add a `brace-expansion` npm `overrides` entry without testing a full EAS build first. Forcing v5 breaks the codegen pipeline by silently breaking transitive `minimatch@3.x` consumers (see #170/#172/#174).

### AnimatedPressable doesn't forward style callbacks

`Animated.createAnimatedComponent(Pressable)` accepts an array/object `style` prop but silently disables press handling if the style is a callback `({ pressed, focused }) => ...`. This blocked all Buttons in v1.4.0 build 18. If you need press-state-driven styling on an AnimatedPressable, use explicit `onPress{In,Out}` + animated SharedValue instead. The focus-ring feature for primitives lives in #136 with this constraint documented.

## Where "current state" lives

This file deliberately does **not** track live project status (recently shipped,
deferred work, current priorities). That information churns and goes stale fast,
so its source of truth lives where it stays current on its own:

- **In progress / deferred / prioritized:** the [GitHub issue tracker](https://github.com/JarlLyng/wean-nicotine/issues), using the P0–P3 labels (taxonomy in [`CONTRIBUTING.md`](../CONTRIBUTING.md)).
- **What shipped, and when:** [`CHANGELOG.md`](../CHANGELOG.md) and the git log.
- **What the App Store sees:** `npx eas build` history, and download/sales numbers via [`scripts/asc_downloads.py`](../scripts/asc_downloads.py).

Keep this document to the durable parts above (architecture, business rules,
and especially the hard-won pitfalls). When in doubt, prefer a pointer to the
canonical source over a restated copy that can drift.
