# CLAUDE.md — Wean Nicotine

Quick-start context for developers and AI assistants. Detailed specs in `docs/` (see `docs/AI_CONTEXT.md`).

## What is Wean Nicotine?

A calm, private iPhone app for **gradually reducing** snus and nicotine pouches (not quitting cold turkey). Local-first: no accounts, no cloud, no internet required. The tone is deliberately non-judgmental — it serves _reducers_, not _quitters_.

- **Developer:** Jarl Lyng / [IAMJARL](https://iamjarl.com)
- **Website:** [weannicotine.iamjarl.com](https://weannicotine.iamjarl.com)
- **License:** [MIT](LICENSE) — open source.
- **Price:** **29 DKK (~$4) one-time** — no subscription, no in-app purchases, no ads.
- **Platform:** iPhone (Expo / React Native — the portfolio's one non-SwiftUI app; chosen deliberately).
- **Current version:** **1.6.1** (iOS build 23) live in App Store since July 2026. `app.config.js` is the source of truth for the current build number; release history is in `CHANGELOG.md`.

## Strategy lives in the private hub

Target audience, positioning, pricing reasoning, SEO/ASO playbooks, and competitor analysis are **not** in this public repo — they're in the private [iamjarl-strategy](https://github.com/JarlLyng/iamjarl-strategy) hub (folder `WeanNicotine/`). Before doing any audience/positioning/pricing/marketing-planning work, read that repo's `CONVENTIONS.md` and write results there, not here. (This is already documented in `docs/README.md` and `docs/AI_CONTEXT.md`.)

## App features (be precise — do not invent features that don't exist)

- **Onboarding** — welcome → baseline (pouches/day) → pace (3–15% weekly reduction, with a live "you'd reach zero in ~X weeks" preview) → optional price per can → common triggers. Progress dots show step-of-4.
- **Daily tracking** — one-tap _Used a pouch_ / _Craving resisted_; daily allowance from the taper plan shown as a whole number; calm UI even when over the limit; 10-second undo via toast. After a pouch log, an optional dismissible chip row lets the user tag which trigger fired (never required).
- **Taper plan** — automatic weekly reduction, user-selectable pace (3–15%); edit baseline/pace/price anytime from Settings without losing log history. If usage runs ≥20% over allowance across the trailing two weeks, Home shows a gentle dismissible "adjust pace?" suggestion (snoozed 7 days on dismissal, never nagging).
- **Progress** — weekly bar chart, pouches avoided vs baseline, money saved, gentle milestones (not aggressive streaks), and a Patterns card (pouches by time of day + by tagged trigger, trailing 30 days; hidden until ≥10 pouches logged). All six reads are issued in parallel.
- **Support tools** — guided breathing exercise (multiple patterns + completion celebration), urge-surfing timer, reflection prompts with optional journal, cost-savings calculator with week/month breakdown.
- **Notifications (optional)** — daily check-in + trigger reminders, both local-only. When permission is denied the app deep-links to OS notification settings.
- **Taper complete** — when the whole-pouch daily target reaches zero, Home shows a one-time "You reached your goal" celebration (trophy card, framed around the plan — explicitly NOT a streak/"days clean" counter, and no clinical "quit"/"cured" claims). Re-arms only if the plan is edited so the allowance rises above zero again.
- **Reset / Start Over** — hold-to-confirm destructive action (2-second press with animated fill); wipes all local SQLite data and returns to onboarding.
- **Theme** — light / dark / system, IAMJARL tokens via `lib/design.ts`. Phosphor icons.

### Features that do NOT exist (common hallucination targets)

- No accounts, cloud sync, or off-device data.
- No subscription, IAP, or ads.
- No streak counter or "days clean" framing — Wean uses cumulative "pouches avoided" instead. Adding one would contradict the product principle.
- Not a cold-turkey/quit-date app — it's built around gradual reduction.
- Not a cigarette / vape / general-habit tracker — it's calibrated for snus and nicotine pouches specifically.
- No medical advice or clinical claims.
- iOS only; no Android, no real web build (web stubs SQLite so the UI can render for design preview, but the app does not function there).

## Build & release

- Expo / React Native. Bump `ios.buildNumber` (and `version` for a marketing release) in `app.config.js`, then either: **(a) EAS cloud build + auto-submit** — `npx eas build --profile production --platform ios --auto-submit` — which builds and uploads straight to App Store Connect via the stored ASC API key + `eas.json` `submit` config (this is what shipped builds 20 and 21); or **(b) local build → IPA → Transporter** upload.
- Telemetry: anonymous crash reporting (Sentry) only — disclosed in the privacy policy.

## Conventions

- Privacy-first, local-first (SQLite storage — see `docs/decisions/storage.md`).
- `components/ui/` holds reusable primitives.
