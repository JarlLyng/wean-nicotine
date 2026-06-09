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
- Latest live App Store version: **1.4.1** (iOS build 19, approved June 2026). v1.4.0 / build 18 was a TestFlight-only release blocked by an unresponsive-Button regression and was never submitted to the App Store — see [CHANGELOG.md](../CHANGELOG.md#141---2026-06-01) for both versions.

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

- `app/(onboarding)/`: welcome, baseline, pace (3–15% weekly reduction), price, triggers — 4 setup steps
- `app/(tabs)/home.tsx`: daily allowance and quick logging; data layer lives in [`hooks/useHomeData.ts`](../hooks/useHomeData.ts); undo toast after every log entry
- `app/(tabs)/progress.tsx`: progress summary with 7-day bar chart, trend tracking, and milestones
- `app/(tabs)/tools/`: breathing, urge-surfing, reflection support flows
- `app/(tabs)/settings/`: notifications, theme, edit plan (baseline/pace/price), start over

### UI system

- [`lib/design.ts`](../lib/design.ts) defines the IAMJARL Design System tokens (aligned with the upstream v1.x source of truth at <https://github.com/JarlLyng/iamjarl-design>).
- [`lib/theme.ts`](../lib/theme.ts) exposes backward-compatible theme helpers.
- [`components/Screen.tsx`](../components/Screen.tsx) is a content wrapper (no title/SafeAreaView — native headers handle that).
- `components/ui/` contains reusable primitives: `Button` (with haptics), `Card`, `ProgressRing`, `Icon` (Phosphor), `StatCard`, `IconSymbol` (SF Symbols for tabs), `Toast` (transient notification with optional action).
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

These logs drive daily counts and progress summaries.

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
- The result is rounded to one decimal place.
- The result is clamped so it never falls below `0` or above baseline.

### Progress interpretation

- The home screen compares today’s `pouch_used` count with the current allowance.
- “Avoided” values are derived relative to the user’s baseline, not from an externally stored target.
- All allowance computation reads `TaperSettings` directly via `lib/taper-plan.ts` — there is no cached plan row to regenerate.

### Notifications

Canonical implementation: [`lib/notifications.ts`](../lib/notifications.ts)

- Supports a daily check-in reminder.
- Supports a single daily trigger reminder based on selected triggers.
- Existing reminders are cancelled before replacement to avoid duplicate schedules.

## Testing

- `jest-expo` preset configured in `package.json`.
- Unit tests live under `lib/__tests__/`.
  - [`taper-plan.test.ts`](../lib/__tests__/taper-plan.test.ts): allowance math, default plan generation, edge cases.
  - [`progress.test.ts`](../lib/__tests__/progress.test.ts): weekly progress, total + milestone detection, week boundaries. DB layer (`getLogEntries`) is mocked.
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
- Home screen data layer: [`hooks/useHomeData.ts`](../hooks/useHomeData.ts)
- Notifications: [`lib/notifications.ts`](../lib/notifications.ts)
- Error reporting: [`lib/sentry.ts`](../lib/sentry.ts) — includes the PII scrubber and `sendDefaultPii: false`. Privacy hardening details in [`SENTRY.md`](./SENTRY.md).
- Tests: `lib/__tests__/` (jest-expo, 43 tests across 3 suites). Run via `npm test` or `npm run check`.
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

- `.github/dependabot.yml` blocks **all** semver levels (major, minor, **and patch**) for `expo`, `expo-*`, `babel-preset-expo`, `react`, `react-dom`, `react-native`, `@types/react`, and the major `react-native-*` libs (`reanimated`, `worklets`, `gesture-handler`, `screens`, `safe-area-context`, `svg`). Don't loosen this without a deliberate SDK upgrade.
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

## Current state (handoff snapshot — June 2026)

This section helps future sessions pick up cleanly. Move stale items out as they're addressed; don't let it grow stale.

### What's recently shipped

- **v1.4.1 live in App Store** (iOS build 19). Hotfix for the v1.4.0 unresponsive-Button regression. Brings: onboarding progress dots, hold-to-confirm reset, breathing celebration, error-vs-no-settings distinction in `useHomeData`, bar-chart legend completeness, 44pt touch targets, dark-mode switch contrast, IAMJARL token alignment, transactional SQLite migrations (v6 analytics, v7 drop `user_plan`), notifications race fix, and 17 new unit tests (60 total).
- **Blog launched** with three long-form articles at `/blog/`:
  - [5 tips for reducing snus](/blog/five-tips-reducing-snus-without-cold-turkey/) — action-intent
  - [How tapering works](/blog/how-the-tapering-approach-works/) — research-intent
  - [Why privacy matters in health apps](/blog/why-privacy-matters-in-health-apps/) — positioning
  - Content collection schema in `website/src/content.config.ts`, RSS at `/rss.xml`, BlogPosting JSON-LD per post.
- **Website foundations** complete: language switcher (header + footer), self-hosted Inter/Outfit, sitemap i18n alternates, hreflang fix on SEO landings, IAMJARL primary color `#A435D2`, per-page OG support.
- **Repo professionalism**: CHANGELOG with back-tagged 1.0.0 → 1.4.1, Prettier + husky + lint-staged, GitHub Issue Forms (YAML), `.cursor/rules/project-conventions.mdc`, P0–P3 priority taxonomy, CodeQL configured.
- **GSC**: site is verified at `https://weannicotine.iamjarl.com/`; sitemap re-submitted June 2026 after adding blog. Baseline as of submit: 37 impressions / 0 clicks / position 10.9 over 28 days. Next checkpoint: 7+ days after submit to see if the new pages indexed.

### What's deliberately deferred

- **Issue #136 — 2px focus-ring on UI primitives.** First attempt regressed every Button (see "AnimatedPressable" pitfall above). Re-implement with `onFocus`/`onBlur` + local state. iOS doesn't surface keyboard focus state, so this is web/hardware-keyboard only — not urgent.
- **Issue #142 — full AVIF/WebP hero image.** Preload landed in #160 but the actual format conversion needs `astro:assets` plus moving screenshots from `public/` to `src/assets/`. Higher-effort follow-up.
- **Issue #117/#118 follow-on migrations.** UI primitives (`Input`, `Chip`, `ListItem`, `OnboardingProgress`) exist; baseline.tsx uses Input. Remaining call sites (pace radios, price currency pills, triggers chips, settings rows, reflection inputs) are tracked but not migrated.
- **Localizing blog articles to DA/SV/NO.** Not started. ~4500 words × 3 languages of nuanced translation. Wait until external traffic data justifies it.
- **Marketing distribution (#29 / #33 / #34 / #36 / #47).** No external link shares yet. The blog articles are good inventory but unposted. The leverage there is much higher than more content right now.

### Open priorities by impact

1. **Wait + observe.** GSC re-fetched sitemap June 2026. New blog URLs should index within a week. Recheck before adding more content.
2. **Distribution, not production.** One organic Reddit/X share of the privacy article (#32) is probably worth more right now than any code change.
3. **Maker story (#61).** Now timely with v1.4.1 live as a narrative anchor — worth writing once you have 1–2 weeks of post-launch data.
4. **App-tech-debt P2/P3 backlog.** Issues remaining: #12 (unify milestone algo), #14 (Index screen simplify), #15 (split progress.tsx), #16 (notification cancel race), plus the UI primitive migrations above. None are blocking.

### How to verify nothing's drifted before next release

```bash
# Tree health
npm run check                       # lint + typecheck + tests (should be 60 passing)
CI=1 npx expo install --fix         # should report "Dependencies are up to date"
npx expo doctor                     # should be 19/19 checks passed

# Release procedure (when bumping version)
# 1. Bump version + buildNumber in app.config.js
# 2. Bump version in package.json
# 3. Add CHANGELOG section
# 4. Commit, push, merge to main
# 5. From main:
pod repo update
rm -rf ios android .expo
npx eas build --profile production --platform ios --local
npx eas submit --platform ios --latest
# 6. Tag + GitHub Release after Apple approval
```
