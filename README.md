# Taper

**Taper** is a mobile app that helps people gradually reduce and eventually stop using snus (nicotine pouches) through a calm, supportive, and non‑judgmental approach.

Instead of quitting cold turkey, Taper focuses on **tapering** — reducing usage step by step, at your own pace.

---

## ✨ Core idea

Quitting snus doesn’t have to be all or nothing.

Taper helps users:
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

- **Taper, don't punish**  
- **Progress over perfection**  
- **No shame, no streak anxiety**  
- **Offline‑first & private by default**  
- **Simple enough to use in 2 seconds**

---

## 📱 MVP feature set

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

See `docs/decisions/storage.md` for storage architecture details.

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
Create a `.env` file in the root directory with your Sentry DSN (optional for local development):

```bash
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**Note:** Sentry events are **not sent** in development mode - they're only logged to console. The `.env` file is only needed if you want to test Sentry integration locally.

#### Production (EAS Build)
For production builds, use **EAS Secrets** instead of `.env` files:

```bash
# Set the secret for your project
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "https://your-sentry-dsn@sentry.io/project-id"

# Or for a specific environment
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "https://your-sentry-dsn@sentry.io/project-id" --type string --environment production
```

Get your Sentry DSN from [sentry.io](https://sentry.io) → Your Project → Settings → Client Keys (DSN).

**Note:** Sentry is optional. The app will work without it, but errors won't be tracked in production.

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

## 🗺️ Roadmap

See `ROADMAP.md` for planned milestones and future ideas.

---

## 📄 License

TBD

---

Built with care under the **IAMJARL** project.