# Wean Nicotine

**Wean Nicotine** is a mobile app that helps people gradually reduce and eventually stop using snus (nicotine pouches) through a calm, supportive, and non‑judgmental approach.

Instead of quitting cold turkey, Wean focuses on **tapering** — reducing usage step by step, at your own pace.

[![Co-created with AI](https://madebyhuman.iamjarl.com/badges/co-created-white.svg)](https://madebyhuman.iamjarl.com)

## Documentation

If you need to understand the repository quickly:

- Start with [`docs/README.md`](./docs/README.md) for the documentation map.
- Read [`docs/AI_CONTEXT.md`](./docs/AI_CONTEXT.md) for the canonical architecture and domain summary.
- Use code as source of truth for exact behavior.

---

## ✨ Core idea

Quitting snus doesn’t have to be all or nothing.

Wean helps users:
- set a realistic baseline
- follow a gradual reduction plan
- track progress without shame
- recover quickly from slip‑ups
- stay motivated through time, money, and habit insights

---

## 🎯 Target audience

- Daily snus / nicotine pouch users
- People who want to **reduce first**, not quit abruptly
- Users who prefer a calm, minimalist, and private experience

---

## 🧠 Product principles

- **Wean, don't punish**  
- **Progress over perfection**  
- **No shame, no streak anxiety**  
- **Offline‑first & private by default**  
- **Simple enough to use in 2 seconds**

---

## 📱 Current feature set

### Onboarding
- Set baseline usage (pouches per day)
- Optional price per can (for savings tracking)
- Select common triggers (stress, coffee, after meals, etc.)

### Daily tracking
- One‑tap log: *Used a pouch*
- One‑tap log: *Craving resisted*
- Daily allowance based on taper plan
- Calm, non-judgmental UI even if you go over the limit

### Taper plan
- Automatic reduction over time (weekly % reduction)
- Default pace is intentionally simple (MVP)

### Progress & motivation
- Pouches avoided vs baseline
- Money saved
- Small, supportive milestones (not aggressive streaks)

### Support tools
- Short breathing exercises
- Urge‑surfing guidance
- Simple reflection prompts

### Notifications (optional)
- Daily check‑in
- Trigger‑based reminders
- Gentle encouragement — never guilt

---

## 🏗️ Tech stack

- **Expo** (React Native)
- **Expo Router** (file‑based navigation)
- **Local‑first storage** (SQLite via `expo-sqlite`)
- **Expo Notifications**
- **Sentry** (error tracking & monitoring)
- No backend in MVP

**Note:** This app is designed for mobile (iOS/Android) only. SQLite is not available on web browsers.
Initial release focus is **iPhone**.

**New Architecture:** This app runs on React Native's New Architecture by default in Expo SDK 55, which is required by `react-native-reanimated` 4.x.


## 🔗 Links

- **Marketing site**: `https://weannicotine.iamjarl.com/`
- **Privacy policy**: `https://weannicotine.iamjarl.com/privacy/`

---

## 📂 Project structure

```
app/
  (onboarding)/          # Onboarding flow screens
    welcome.tsx
    baseline.tsx
    price.tsx
    triggers.tsx
  (tabs)/                # Main app screens (tab navigation)
    home.tsx             # Today / Daily allowance screen
    progress.tsx         # Progress tracking screen
    tools/               # Support tools
      breathing.tsx
      urge-surfing.tsx
      reflection.tsx
    settings/            # Settings screens
      index.tsx
      reset-taper.tsx
      notifications.tsx
components/             # Reusable UI components
lib/                    # Business logic & utilities
  db*.ts                # Database operations
  theme.ts              # Design tokens
docs/                   # Documentation
```

See [`docs/README.md`](./docs/README.md) for the documentation index and [`docs/decisions/storage.md`](./docs/decisions/storage.md) for storage architecture details.

---

## 🚫 Out of scope (MVP)

- Accounts / login
- Cloud sync
- Community features
- Medical advice
- AI personalization

---

## 🌍 Internationalization

- App language: English (initially)
- Neutral, inclusive tone
- Designed for international App Store distribution

---

## 🚀 Getting started (dev)

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npx expo start
```

### Environment Variables

#### Development (Local)
Kopiér `.env.example` til `.env` og udfyld værdierne. Relevant for Sentry:

- **EXPO_PUBLIC_SENTRY_DSN** – DSN fra Sentry (Client Keys). Bruges af appen til at sende fejl.
- **SENTRY_AUTH_TOKEN** – (valgfrit) Auth token fra Sentry (User settings → Auth Tokens). Bruges af Sentry CLI fx til upload af source maps, så stack traces vises læsbart i Sentry.

Sentry-events sendes **ikke** i development mode – de logges kun i konsollen.

#### Production (EAS Build – lokalt eller sky)
Ved `eas build` (både `--local` og uden) bruges **EAS Secrets** – ikke `.env`. Opret secret før build:

```bash
eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://din-dsn@xxx.ingest.sentry.io/xxx" --environment production --visibility plaintext
```

Lokal `.env` er til dev og evt. andre værktøjer; EAS injicerer kun variabler fra EAS Secrets under build.

**Note:** Sentry is optional. The app will work without it, but errors won't be tracked in production. Konfiguration og verifikation: **`docs/SENTRY.md`**. DSN indlejres ved build via `app.config.js` → `extra.sentryDsn`.

### Testing Notifications

Notifications require a development build and do not work in Expo Go. To test notifications:

**iOS:**
```bash
npx expo run:ios
```

**Android:**
```bash
npx expo run:android
```

---

## 📦 Build & release (iOS)

**Foretrukket workflow:** Lokalt build → IPA-fil → upload via **Transporter** til App Store Connect.

- **Bundle ID:** `com.iamjarl.taper`
- **Lokalt build (IPA) – Expo fra terminal:**
  1. **Build-nummer:** I `app.config.js` skal `ios.buildNumber` være højere end det sidste build uploadet til App Store Connect. Version (`version`) er bruger-synlig (aktuelt `1.3.0`) og bumpes kun ved en egentlig app-opdatering.
  2. **Sentry:** Opret EAS Secret så DSN er med i buildet:  
     `eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://din-dsn@xxx.ingest.sentry.io/xxx" --environment production --visibility plaintext`
  3. Fra projektroden:
     ```bash
     npx eas build --profile production --platform ios --local
     ```
     Buildet kører på din Mac og producerer en IPA (EAS viser stien når det er færdigt).
  4. Upload IPA til App Store Connect via **Transporter** (Mac App Store).

- **Kun Xcode (hvis du har `ios/` og foretrækker det):** Åbn `ios/Taper.xcworkspace` → **Product → Archive** → **Distribute App** / **Export** → IPA i **Transporter**. Sørg for at build-nummer i Xcode/Info.plist matcher eller overstiger sidst uploadet.

- **Sentry:** DSN kommer fra EAS env (production). Ved lokalt build: sæt `export EXPO_PUBLIC_SENTRY_DSN="https://..."` i terminalen før `eas build --local`. Fejlsøgning: `docs/SENTRY.md`.

**Alternativ (sky-build):** `npx eas build --profile production --platform ios` (uden `--local`) – bygger i skyen. Samme EAS Secret. Derefter fx `npx eas submit --platform ios --latest` eller download IPA og brug Transporter.

Ingen secrets eller credentials ligger i repoet. Brug EAS Secrets for `EXPO_PUBLIC_SENTRY_DSN` (og evt. andre) til builds.

---

## 🗺️ Roadmap

All planned work is tracked in [GitHub Issues](https://github.com/JarlLyng/wean-nicotine/issues) with priority labels (P1/P2/P3) and category labels (seo, aso, website, marketing, enhancement).

---

## 📄 License

[MIT](./LICENSE) © 2026 IAMJARL.

---

Built with care under the **IAMJARL** project.

