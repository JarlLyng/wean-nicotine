# CLAUDE.md — Wean Nicotine

Quick-start context for developers and AI assistants. Detailed specs in `docs/` (see `docs/AI_CONTEXT.md`).

## What is Wean Nicotine?

A calm, private iPhone app for **gradually reducing** snus and nicotine pouches (not quitting cold turkey). Local-first: no accounts, no cloud, no internet required. The tone is deliberately non-judgmental — it serves _reducers_, not _quitters_.

- **Developer:** Jarl Lyng / [IAMJARL](https://iamjarl.com)
- **Website:** [weannicotine.iamjarl.com](https://weannicotine.iamjarl.com)
- **License:** [MIT](LICENSE) — open source.
- **Price:** **29 DKK (~$4) one-time** — no subscription, no in-app purchases, no ads.
- **Platform:** iPhone (Expo / React Native — the portfolio's one non-SwiftUI app; chosen deliberately).
- **Current version:** **1.4.1** (live in App Store since June 2026). `app.config.js` is the source of truth for the current build; release history is in `CHANGELOG.md`.

## Strategy lives in the private hub

Target audience, positioning, pricing reasoning, SEO/ASO playbooks, and competitor analysis are **not** in this public repo — they're in the private [iamjarl-strategy](https://github.com/JarlLyng/iamjarl-strategy) hub (folder `WeanNicotine/`). Before doing any audience/positioning/pricing/marketing-planning work, read that repo's `CONVENTIONS.md` and write results there, not here. (This is already documented in `docs/README.md` and `docs/AI_CONTEXT.md`.)

## App features (be precise — do not invent features that don't exist)

- **Onboarding** — welcome → baseline (pouches/day) → pace (3–15% weekly reduction) → optional price per can → common triggers. Progress dots show step-of-4.
- **Daily tracking** — one-tap _Used a pouch_ / _Craving resisted_; daily allowance from the taper plan; calm UI even when over the limit; 5-second undo via toast.
- **Taper plan** — automatic weekly reduction, user-selectable pace (3–15%); edit baseline/pace/price anytime from Settings without losing log history.
- **Progress** — weekly bar chart, pouches avoided vs baseline, money saved, gentle milestones (not aggressive streaks). All five reads are issued in parallel.
- **Support tools** — guided breathing exercise (multiple patterns + completion celebration), urge-surfing timer, reflection prompts with optional journal, cost-savings calculator with week/month breakdown.
- **Notifications (optional)** — daily check-in + trigger reminders, both local-only. When permission is denied the app deep-links to OS notification settings.
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

- Expo / React Native. Preferred release: local build → IPA → upload via **Transporter** to App Store Connect (bump `ios.buildNumber` in `app.config.js`). Cloud alternative: `npx eas build --profile production --platform ios`.
- Telemetry: anonymous crash reporting (Sentry) only — disclosed in the privacy policy.

## Conventions

- Privacy-first, local-first (SQLite storage — see `docs/decisions/storage.md`).
- `components/ui/` holds reusable primitives.
