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

- `Taper` is a mobile app that helps users reduce snus and nicotine pouch usage gradually.
- The repo also contains the public marketing site in `website/`.
- The app is local-first. There is no backend, no account system, and no cloud sync in the MVP.
- The mobile app uses Expo SDK 55, Expo Router, SQLite, Expo Notifications, Sentry, and React Compiler.
- The website uses Astro and contains SEO landing pages in multiple languages.

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

- `app/(onboarding)/`: welcome and initial setup flow
- `app/(tabs)/home.tsx`: daily allowance and quick logging
- `app/(tabs)/progress.tsx`: progress summary with 7-day bar chart, trend tracking, and milestones
- `app/(tabs)/tools/`: breathing, urge-surfing, reflection support flows
- `app/(tabs)/settings/`: notifications, reset, and app settings

### UI system

- [`lib/design.ts`](../lib/design.ts) defines the IAMJARL Design System tokens (v0.1.3).
- [`lib/theme.ts`](../lib/theme.ts) exposes backward-compatible theme helpers.
- [`components/Screen.tsx`](../components/Screen.tsx) is a content wrapper (no title/SafeAreaView — native headers handle that).
- `components/ui/` contains reusable primitives: `Button` (with haptics), `Card`, `ProgressRing`, `Icon` (Phosphor), `StatCard`, `IconSymbol` (SF Symbols for tabs).
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

### `UserPlan`

Stores derived plan state.

- `settingsId`: link back to `TaperSettings`
- `currentDailyAllowance`: calculated allowance for the current day
- `lastCalculatedDate`: timestamp of last plan refresh

There is effectively one active plan row in the app.

### `LogEntry`

Tracks timestamped user actions.

- `pouch_used`
- `craving_resisted`

These logs drive daily counts and progress summaries.

### Local analytics

`lib/analytics.ts` stores local-only usage events in SQLite. This is not third-party product analytics.

## Storage Model

Primary implementation lives in [`lib/db.ts`](../lib/db.ts).

### Core tables

- `log_entries`
- `taper_settings`
- `user_plan`
- `app_preferences`
- `schema_version`
- `analytics`

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
- The result is rounded to one decimal place.
- The result is clamped so it never falls below `0` or above baseline.

### Progress interpretation

- The home screen compares today’s `pouch_used` count with the current allowance.
- “Avoided” values are derived relative to the user’s baseline, not from an externally stored target.
- Missing `user_plan` state can be regenerated from settings.

### Notifications

Canonical implementation: [`lib/notifications.ts`](../lib/notifications.ts)

- Supports a daily check-in reminder.
- Supports a single daily trigger reminder based on selected triggers.
- Existing reminders are cancelled before replacement to avoid duplicate schedules.

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
### Strategy linkage

### Scale-out logic

The website uses a **programmatic SEO approach**:
1.  New landing pages are created in localized folders (e.g., `/da/stop-med-snus-app/`).
2.  Each page uses `SeoLandingLayout.astro`, which handles standard headers, CTAs, and SEO metadata.
3.  Each layout instance is provided a `campaignToken` (e.g., `seo_da_app`), which is used by `getCampaignAppStoreUrl` to append Apple Search Ads / App Store Connect metrics (`pt` and `ct` parameters).

SEO intent and landing-page plan are described in [`SEO_STRATEGY.md`](./SEO_STRATEGY.md).

## Source Of Truth By Concern

- Product behavior: code in `app/` and `lib/`
- Domain types: [`lib/models.ts`](../lib/models.ts)
- Design tokens: [`lib/design.ts`](../lib/design.ts), [`lib/theme.ts`](../lib/theme.ts)
- Persistence: [`lib/db.ts`](../lib/db.ts) and `lib/db-*.ts`
- Notifications: [`lib/notifications.ts`](../lib/notifications.ts)
- Error reporting: [`lib/sentry.ts`](../lib/sentry.ts)
- Repo-level orientation: [`docs/README.md`](./README.md)

## Change Checklist For LLMs And Contributors

- Before editing a screen, inspect both the route file and the supporting `lib/` module it depends on.
- Before changing a data field, update `lib/models.ts`, the relevant `db-*.ts` files, and any migration needs in `lib/db.ts`.
- Before changing the tapering logic, update `lib/taper-plan.ts` and verify the screens that display allowance or progress.
- Before changing visual tokens, inspect `lib/design.ts`, `lib/theme.ts`, and shared UI primitives.
- Before changing notifications, inspect both settings screens and `lib/notifications.ts`.
- Before changing website messaging, check whether the change should also affect SEO docs, privacy copy, or App Store metadata.

## Known Pitfalls

- Web support is partial and should not be treated as a production target for the app.
- Notifications can appear broken in Expo Go even when code is correct.
- Some docs are strategic and can lag behind implementation if not maintained. Resolve conflicts in favor of code, then update docs.
