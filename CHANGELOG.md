# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.1] - 2026-07-18

iOS build 23. Small patch: refreshed app icons, a privacy hardening, and a layout fix.

### Fixed

- **Progress "Daily Usage" title and legend collided.** The title and the 4-item legend (Under limit / Over / No data / Upcoming) were on one row and crammed together on-device; the legend now stacks below the title and wraps. (#254)
- Sentry now scrubs breadcrumbs, not just `event.extra`. Touch (`ui.click`) breadcrumbs label taps by their `accessibilityLabel` — trigger chips carry the trigger name — and `console` breadcrumbs could log stray text; both are stripped via a new `beforeBreadcrumb` scrubber so no health signal rides along on a crash report. Navigation route names are kept. (privacy hardening; #252)

### Changed

- Refreshed app icons.

## [1.6.0] - 2026-07-14

iOS build 22, approved and live in the App Store July 2026. Small quality release that also carries the ASO metadata pass (new SV/NO subtitles + rebuilt keyword fields per locale, entered in App Store Connect with this version).

### Added
- **Expected-timeline preview on the Pace onboarding step.** Selecting a pace now shows "From N a day at X%, you'd reach zero in about W weeks (~M months)", computed from the exact production formula so it matches what the app will actually do. (#123)

### Changed
- Home undo window extended from 5s to 10s — a mistap writes real data, and the old window was tight for users with motor impairments. (#124)
- Softened the baseline onboarding copy/hint: realistic placeholder, the 1–100 range surfaced before submit, and a gentler validation message. (#131)
- Progress empty-state now uses a Phosphor icon instead of a 📊 emoji, matching the icon system. (#135)

### Fixed
- Closed a notification cancel/schedule race by scheduling with stable identifiers, so rapid reminder toggles can no longer leave duplicate reminders. (#96)

### Internal
- Toast surface/text moved to `static.*` design tokens (#133); milestone achievement-time semantics unified into one day-walk across pouch/money/craving thresholds (#92); removed dead `webpack.config.js` (#116). Lint is now warning-free.
- Website (deploys independently of the app): hero LCP image → AVIF/WebP via `astro:assets` (#142); da/sv/no homes DRYed into a shared `NordicHome` component (#100); internal links from the top-ranking blog article into the taper cluster (#237).

## [1.5.0] - 2026-07-06

iOS build 21, approved and live in the App Store July 2026 (build 20 was superseded before release to fold in refreshed app icons). Theme: insight + the finish line — the app now delivers the usage-pattern promises from the blog, acknowledges reaching the goal, and gently helps when the pace doesn't fit.

### Added
- **Trigger tagging on pouch logs.** After "Used a pouch", an optional dismissible chip row ("What triggered it?") offers the user's own onboarding-selected triggers. One-tap logging is unchanged — tagging is an optional second tap, never required. Stored per entry (schema migration v8, nullable — existing history untouched). The tag is scrubbed from any Sentry payload like all user data. (#220)
- **Patterns card on Progress.** Pouches broken down by time of day (morning/afternoon/evening/night) and by tagged trigger over the trailing 30 days. Descriptive primary-colored bars — no red, no "worst time" framing. Hidden until 10+ pouches are logged; honest footnote when only some pouches are tagged. (#221)
- **Gentle pace suggestion.** When usage runs ≥20% over the allowance across the trailing two complete weeks, Home shows a calm, dismissible "Going over most days?" card linking to Edit plan. Dismissal snoozes it for 7 days — it never nags. Framed as pace-fit information, never failure. (#222)
- **Goal-reached celebration.** The first time the whole-pouch daily target hits zero, Home shows a one-time trophy card ("You reached your goal") with the cumulative pouches-avoided number, one success haptic, and gentle next steps. Explicitly not a streak or "days clean" counter; re-arms only if the plan is edited above zero again. (#223)
- **In-app review prompt** via expo-store-review, asked only at positive moments (goal celebration acknowledged; 100+ pouches avoided on Progress) and hard-gated: plan ≥14 days old, ≥90 days between asks, never after Reset. No network calls, no user data. (#180)
- **20 new unit tests** — total now 87.

### Changed
- **Whole-pouch daily target.** The Today ring now shows "3" instead of "3.5" — floored, so staying under the shown number always means staying under the real allowance. The decimal precision still drives the taper math and Progress chart unchanged. (#219)
- Magic numbers (pouches per can, milestone thresholds, notification defaults, nudge tunables) consolidated into `lib/constants.ts`. No behavior change. (#112)

## [1.4.1] - 2026-06-01

iOS build 19. Hotfix for build 18 — Buttons were unresponsive across the entire app, including the welcome-screen "Get Started" CTA which blocked onboarding completely.

### Fixed
- Buttons not responding to taps. The 2px focus-ring landed in 1.4.0 wrapped the `Pressable` style in a callback, but `Animated.createAnimatedComponent(Pressable)` silently disables press handling when given a callback style. Reverted to an array style. Focus-ring re-implementation deferred to a future iteration that uses `onFocus`/`onBlur` state instead — iOS does not surface keyboard-focus state anyway.

## [1.4.0] - 2026-05-31

User-visible changes shipped with iOS build 18.

### Added
- **Onboarding progress dots** below the header on baseline, pace, price, and triggers — visual progress through the 4-step setup, with `accessibilityRole="progressbar"` for screen readers.
- **Hold-to-confirm Reset Taper.** Two-second press-and-hold with an animated primary-coloured fill replaces the one-tap "Delete Everything" alert. Light/warning haptics on iOS at start and fire.
- **Breathing completion celebration.** Bigger duotone check, "Nicely done." headline, and a session-count subtext that switches between first-session copy and a running total. Matches the "wean don't punish" tone.
- **Bar-chart legend** now documents all four states: Under limit, Over, No data, Upcoming.
- **Calm error state on Today.** When the data load fails (parse error / transient SQLite), the screen surfaces a "Couldn't load right now" card with a Try again button instead of routing the user back through onboarding.
- **Deep-link to OS notification settings.** Permission-denied alerts now offer "Open Settings" via `Linking.openSettings()` so the user can flip the system toggle without leaving the app for a settings safari.
- **17 new unit tests** for `cost-savings.ts` and `notifications.ts` — total now 60.

### Changed
- IAMJARL design-system pass: realigned `typography` line-heights to the IAMJARL pairings (xs 12/16, sm 14/20, base 16/24, lg 18/28, xl 24/32, xxl 36/44). Dropped legacy `neutral.*`, `semantic.info`, `'3xl'`, and `fontWeights.medium: '500'` from `lib/theme.ts`. Nine inline `'500'` weight usages updated to `'600'`.
- Milestone palette now reads from `colors.warning` / `colors.success` / `colors.primary` instead of hardcoded `#FF9500` / `#FFD700` / `#FF6B35` / `#4CAF50` / `#CE63FF` — auto-flips in dark mode.
- Switch off-track in dark mode bumped from `border.subtle` (rgba white 0.12) to `border.default` (rgba white 0.18) so the affordance is visible against `#000`.
- Touch targets ≥ 44pt across segmented control (Progress) and currency pills (Price onboarding).
- ProgressScreen reads all five week/breakdown/total queries via `Promise.all` instead of sequentially, cutting cold-load latency.
- `useHomeData` removed its self-healing recreation of `user_plan` — the cache table no longer exists.
- Currency typing centralized: `parseCurrency()` helper, `CurrencyCode` imported via `lib/models.ts`. Dropped one `as any` cast in `tools/cost-savings.tsx` and the 5-way `===` chain in `db-settings.ts`.

### Fixed
- **Notifications race.** `NotificationsScreen`'s one-shot self-heal could re-create a trigger reminder concurrently with a user toggle, leaving an orphan. New `cancelled` flag + `didSelfHealRef` guard the heal so it can never run twice or after unmount.
- Removed 2 `as any` router-push casts (tools index, reflection journal link) in favour of proper `Href` typing.
- Onboarding question titles and Settings section header now carry `accessibilityRole="header"` so screen readers can navigate by landmark.
- IAMJARL focus ring (2px) on `Button` when keyboard-focused.

### Internal
- `lib/db.ts`: migrations are now transactional and idempotent. `BEGIN`/`COMMIT`/`ROLLBACK` per migration; `schema_version` only advances on success. Legacy ALTERs use `PRAGMA table_info` to detect already-applied columns instead of the swallow-all-errors `ignoreError`.
- Migration v6 creates the `analytics` table inside the migration runner (moved from `analytics.ts`'s inline CREATE).
- Migration v7 `DROP TABLE IF EXISTS user_plan` — the cache was never read for display.
- Removed 6 unused exports across `lib/`: `calculateTotalProgress`, `detectMilestones`, `scheduleTriggerReminder` (singular), `countLogEntriesByType`, `deleteAllLogEntries`, `deleteTaperSettings`. Deleted dead `lib/db-web-stub.ts`.
- New UI primitives: `OnboardingProgress`, `Input` (default + display variants), `Chip` (filled / outline), `ListItem`. `baseline.tsx` migrated as a demo.

## [1.3.1] - 2026-04-30

### Added
- Public-repo polish: issue templates, `CONTRIBUTING.md`, `SECURITY.md`, `CODEOWNERS`.
- CI workflow (`App (lint + typecheck + tests)`, `Website (build)`, CodeQL).
- Dependabot config grouping app + website minor/patch bumps.

### Fixed
- Sentry data leak: runtime aligned with public privacy claims (`lib/sentry-scrubber.ts`).
- Social previews: PNG `og:image` so renderers actually display it.
- Favicon variants generated from 1024×1024 source.
- CodeQL workflow-permissions finding closed; dependency overrides for `ws`, `brace-expansion`, `@tootallnate/once`, `uuid`.

### Changed
- Pace preset "Very gentle" → "Gentle" for consistency.
- Edit Plan inputs redesigned; design system bumped to v0.2.0.
- Toast slides in from the top with guaranteed contrast.

## [1.3.0] - 2026-04-15

### Added
- Cravings resisted tracking + milestones based on resisted cravings.
- Cost-savings tool with currency-aware projections.
- Reflection journal entries.
- App Store metadata synced with v1.3.0 submitted texts.

### Changed
- Website/App Store copy updated to reflect the new tooling.

## [1.2.0] - 2026-03-20

### Added
- "Why Taper" section across localized website pages.
- Localized landing pages (DA / SV / NO).
- Dependency refresh across the stack.

## [1.1.0] - 2026-02-25

### Added
- Sentry integration for app + website (privacy-conscious, scrubbed).
- Website UI styling and animation pass.
- Bumped dependencies; tuned Expo SDK.

## [1.0.0] - 2026-02-14

### Added
- Initial iOS App Store release.
- Onboarding (welcome → baseline → pace → price → triggers).
- Daily logging, undo, daily allowance.
- Progress screen with 7-day bar chart and milestones.
- Tools: breathing, urge-surfing, reflection.
- Settings: notifications, theme, edit plan, start over.
- Local-only SQLite persistence; no accounts, no cloud sync.

---

[Unreleased]: https://github.com/JarlLyng/wean-nicotine/compare/v1.6.1...HEAD
[1.6.1]: https://github.com/JarlLyng/wean-nicotine/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/JarlLyng/wean-nicotine/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/JarlLyng/wean-nicotine/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/JarlLyng/wean-nicotine/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/JarlLyng/wean-nicotine/releases/tag/v1.0.0
