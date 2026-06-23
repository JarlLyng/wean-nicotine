# CLAUDE.md — Wean Nicotine

Quick-start context for developers and AI assistants. Detailed specs in `docs/` (see `docs/AI_CONTEXT.md`).

## What is Wean Nicotine?

A calm, private iPhone app for **gradually reducing** snus and nicotine pouches (not quitting cold turkey). Local-first: no accounts, no cloud, no internet required. The tone is deliberately non-judgmental — it serves *reducers*, not *quitters*.

- **Developer:** Jarl Lyng / [IAMJARL](https://iamjarl.com)
- **Website:** [weannicotine.iamjarl.com](https://weannicotine.iamjarl.com)
- **License:** [MIT](LICENSE) — open source.
- **Price:** One-time purchase — no subscription, no in-app purchases, no ads. <!-- set the actual $ figure -->
- **Platform:** iPhone (Expo / React Native — the portfolio's one non-SwiftUI app; chosen deliberately).
- **Current version:** see `app.config.js` (`version`).

## Strategy lives in the private hub

Target audience, positioning, pricing reasoning, SEO/ASO playbooks, and competitor analysis are **not** in this public repo — they're in the private [iamjarl-strategy](https://github.com/JarlLyng/iamjarl-strategy) hub (folder `WeanNicotine/`). Before doing any audience/positioning/pricing/marketing-planning work, read that repo's `CONVENTIONS.md` and write results there, not here. (This is already documented in `docs/README.md` and `docs/AI_CONTEXT.md`.)

## App features (be precise — do not invent features that don't exist)

- **Onboarding** — set baseline (pouches/day), optional price per can, common triggers.
- **Daily tracking** — one-tap *Used a pouch* / *Craving resisted*; daily allowance from the taper plan; calm UI even when over the limit; 5-second undo.
- **Taper plan** — automatic weekly reduction, user-selectable pace (3–15%); edit baseline/pace/price anytime without losing log history.
- **Progress** — pouches avoided vs baseline, money saved, gentle milestones (not aggressive streaks).

### Features that do NOT exist (common hallucination targets)
- No accounts, cloud sync, or off-device data.
- No subscription, IAP, or ads.
- Not a cold-turkey/quit-date app — it's built around gradual reduction.

## Build & release
- Expo / React Native. Preferred release: local build → IPA → upload via **Transporter** to App Store Connect (bump `ios.buildNumber` in `app.config.js`). Cloud alternative: `npx eas build --profile production --platform ios`.
- Telemetry: anonymous crash reporting (Sentry) only — disclosed in the privacy policy.

## Conventions
- Privacy-first, local-first (SQLite storage — see `docs/decisions/storage.md`).
- `components/ui/` holds reusable primitives.
