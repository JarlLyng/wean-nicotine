# Wean Nicotine

Quick-start context for developers and AI assistants. Detailed specs in `docs/` (see `docs/ARCHITECTURE.md`).

## What is Wean Nicotine?

A calm, private iPhone app for **gradually reducing** snus and nicotine pouches (not quitting cold turkey). Local-first: no accounts, no cloud, no internet required. The tone is deliberately non-judgmental — it serves _reducers_, not _quitters_.

- **Developer:** [IAMJARL](https://iamjarl.com) (Jarl). The full personal name is never used in copy or docs; see `BRAND_LEGAL.md` in the hub.
- **Website:** [weannicotine.iamjarl.com](https://weannicotine.iamjarl.com)
- **License:** [MIT](LICENSE) — open source.
- **Price:** **29 DKK (~$4) one-time** — no subscription, no in-app purchases, no ads.
- **Platform:** iPhone (Expo / React Native — the portfolio's one non-SwiftUI app; chosen deliberately).
- **Current version:** **1.6.2** (iOS build 24) live in App Store since September 2026. `app.config.js` is the source of truth for the current build number; release history is in `CHANGELOG.md`.

## Boundaries: work only in this repo

- Commit, push and open pull requests **only in this repo**. Never edit, commit to, push to or
  open a pull request in another IAMJARL repo, and that includes `iamjarl-design`.
- To ask another repo for something, **open an issue there**. Public repos get findings, never
  measured numbers. If it is strategic, or not safe in public, it goes to the hub instead.
- The one place outside this repo you write is this app's own folder in the private hub
  (`WeanNicotine/`). Shared hub files (`PORTFOLIO.md`, the standards, `tools/`) are changed from inside
  the hub; if one needs changing, open an issue there.
- If a task seems to need a change in another repo, stop, open the issue, and carry on with what
  this repo can do.

## Strategy lives in the private hub

Target audience, positioning, pricing reasoning, SEO/ASO playbooks, and competitor analysis are **not** in this public repo — they're in the private [iamjarl-strategy](https://github.com/JarlLyng/iamjarl-strategy) hub (folder `WeanNicotine/`). Before doing any audience/positioning/pricing/marketing-planning work, read that repo's `CONVENTIONS.md` and write results there, not here. (This is already documented in `docs/README.md` and `docs/ARCHITECTURE.md`.)

### Read these hub files before the task they govern

The hub holds rules that this repo cannot follow unless it knows they exist. Read by task:

- **`VOICE.md`** before writing _any_ public copy: App Store text, site copy, release notes,
  community posts, replies. Hard rules: no em-dashes, no bullet lists in copy, minimal emojis,
  always pay-once framing (never "free" for a paid app), plus this app's overlay. Wean's is the
  gentlest voice in the portfolio: never guilt or shame, and no war metaphors (no fighting,
  battling or beating an addiction).
- **`BRAND_LEGAL.md`** before anything naming the maker, copyright or a third-party product.
  The public identity is IAMJARL; a human name is the first name only.
- **`DESIGN.md`** before App Store screenshots or any visual that carries the brand.
- **`ASO_GUIDANCE.md`** before touching App Store metadata; **`SEO_GUIDANCE.md`** before site SEO.
- **Public issues carry findings, never measured numbers.** No download, sales, revenue,
  rating-count or traffic figures in this repo or its issues. State the finding, drop the number.
  The hub's `tools/public_text_check.py` is the check.

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

- Expo / React Native. Bump `ios.buildNumber` (and `version` for a marketing release) in `app.config.js`, then either: **(a) EAS cloud build + auto-submit** — `eas build --profile production --platform ios --auto-submit` — which builds and uploads straight to App Store Connect via the stored ASC API key + `eas.json` `submit` config (this is what shipped 1.6.2, build 24); or **(b) local build → IPA → Transporter** upload.
- `eas` is the globally installed eas-cli (`npm install -g eas-cli`); `npx eas` does not work in this repo. On Expo's free plan the submission step can sit queued for a while after the build finishes, so a build missing from App Store Connect right away is not a failure.
- Telemetry: anonymous crash reporting (Sentry) only — disclosed in the privacy policy.

## Conventions

- Privacy-first, local-first (SQLite storage — see `docs/decisions/storage.md`).
- `components/ui/` holds reusable primitives.
