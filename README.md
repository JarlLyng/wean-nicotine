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

- **Taper, don’t punish**  
- **Progress over perfection**  
- **No shame, no streak anxiety**  
- **Offline‑first & private by default**  
- **Simple enough to use in 2 seconds**

---

## 📱 MVP feature set

### Onboarding
- Choose goal: *Gradual reduction* (default)
- Set baseline usage (pouches per day)
- Optional price per can (for savings tracking)
- Select common triggers (stress, coffee, after meals, etc.)

### Daily tracking
- One‑tap log: *Used a pouch*
- One‑tap log: *Craving resisted*
- Daily allowance based on taper plan
- Friendly nudges when limits are exceeded

### Taper plan
- Automatic reduction over time (weekly % reduction)
- Adjustable pace
- Smart suggestions if the plan is too aggressive

### Progress & motivation
- Pouches avoided vs baseline
- Money saved
- Time since last pouch (when applicable)
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
- **Local‑first storage** (SQLite / MMKV)
- **Expo Notifications**
- No backend in MVP

---

## 📂 Project structure

```
app/
  (onboarding)/
  (home)/
  (progress)/
  (tools)/
  (settings)/
components/
lib/
store/
```

(Structure will evolve as the app matures.)

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