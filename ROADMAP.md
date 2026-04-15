# Wean Nicotine — Roadmap

Purpose:
- Describe the planned evolution of the product across phases

Audience:
- Maintainers prioritizing future work
- LLMs helping with planning or scoping

Source of truth:
- This document is forward-looking planning, not a guarantee of implemented behavior
- Current behavior is defined by code and summarized in [`docs/AI_CONTEXT.md`](./docs/AI_CONTEXT.md)

Related files:
- [`README.md`](./README.md)
- [`docs/AI_CONTEXT.md`](./docs/AI_CONTEXT.md)
- [`docs/RELEASE_CHECKLIST.md`](./docs/RELEASE_CHECKLIST.md)

Update when:
- A roadmap phase is completed, added, removed, or reprioritized

This roadmap describes the planned development of **Wean Nicotine**, from initial foundation to a polished MVP and beyond.

The roadmap is **phase-based**, not date-based, to allow calm, iterative development and room for learning.

## Progress tracker (Updated 2026-03-21)

This section is the “at a glance” view of where the project stands right now.

### Overall status
- [x] Phase 0 — Foundation (Setup & Structure)
- [x] Phase 1 — Core Taper Flow (MVP core)
- [x] Phase 2 — Progress & Motivation
- [x] Phase 3 — Support & Resilience
- [x] Phase 4 — Notifications & Polish
- [x] Phase 4.5 — Design & Visual Polish (App icons & splash screens updated)
- [x] Phase 5 — Release Preparation (v1.1 released; Sentry configured)
- [x] Phase 6 — Tools Expansion (v1.2: Breathing, Urge Surfing, Reflection, Cost Savings)
- [x] Phase 6.1 — v1.2 Submission (build 15, live on TestFlight & App Store)

### Phase 5 — what’s done vs pending
- [x] EAS Build configured (`eas.json`); production iOS builds succeed
- [x] App Store Connect app created (Bundle ID: `com.iamjarl.taper`); listing name: **Wean Nicotine**
- [x] Build submitted to App Store Connect (v1.1 Live)
- [x] Sentry production setup (EAS secrets configured)
- [x] App Store metadata finalised (v1.1)
- [x] Submit for App Review when ready (v1.1 approved and released)

---

## Phase 0 — Foundation (Setup & Structure)

**Goal:** Establish a solid technical and conceptual foundation.

### Deliverables
- Expo project set up and running
- Expo Router configured (file-based navigation)
- Global app layout (safe areas, basic theming)
- Local storage strategy decided: **SQLite** (via `expo-sqlite`)
- Initial data models:
  - UserPlan
  - TaperSettings
  - LogEntry
- Basic app screens scaffolded (empty states)

### Success criteria
- App runs on iOS simulator/device
- Navigation between placeholder screens works
- Data can be written and read locally

---

## Phase 1 — Core Taper Flow (MVP core)

**Goal:** Allow a user to set up a taper plan and track daily usage.

### Deliverables
#### Onboarding
- Welcome screen explaining tapering
- Baseline input (pouches per day)
- Optional price per can
- Trigger selection
- Default taper plan generation (weekly reduction)

#### Home / Today screen
- Display daily allowance
- Show used vs remaining
- One-tap “Used a pouch”
- One-tap “Craving resisted”

#### Logging
- Timestamped log entries
- Simple daily overview
- Friendly handling of exceeding limits

### Success criteria
- User can complete onboarding in < 2 minutes
- Daily usage updates correctly
- No blocking flows or dead ends

---

## Phase 2 — Progress & Motivation

**Goal:** Make progress visible and rewarding without pressure.

### Deliverables
- Weekly progress view
- Pouches avoided vs baseline
- Money saved calculation
- Gentle milestones (e.g. first full day under limit)
- Time-based stats (days since last adjustment, etc.)

### UX principles
- No aggressive streaks
- No red “failure” states
- Focus on trends, not perfection

### Success criteria
- Users can understand progress at a glance
- Progress feels encouraging, not stressful

---

## Phase 3 — Support & Resilience

**Goal:** Help users through cravings and setbacks.

### Deliverables
- Support tools section:
  - Breathing exercise
  - Urge surfing explanation
  - Short reflection prompts
- “Start Over” flow (full data reset + return to onboarding)
- Smart suggestions:
  - Slow down taper if limits are consistently exceeded

### Success criteria
- Slip-ups do not break the app experience
- Users feel guided, not judged

---

## Phase 4 — Notifications & Polish

**Goal:** Improve retention and readiness for release.

### Deliverables
- Optional daily check-in notification
- Trigger-based reminder notifications
- Polished copy and microcopy
- Accessibility pass (VoiceOver + labels; do final Dynamic Type/contrast sweep before submission)
- App icon + launch screen
- Basic analytics (local only, no tracking)

### Success criteria
- Notifications feel helpful, not annoying
- App feels complete and calm

---

## Phase 4.5 — Design & Visual Polish

**Goal:** Create a cohesive, calming visual design that supports the app's purpose.

### Deliverables
#### Design System
- Complete color palette (primary, secondary, semantic colors)
- Typography scale with proper hierarchy
- Spacing system refinement
- Component library:
  - Buttons (primary, secondary, ghost)
  - Cards (elevated, flat, outlined)
  - Input fields
  - Progress indicators
  - Badges & chips
  - Empty states
  - Loading states

#### Visual Design
- Home screen redesign:
  - Daily allowance visualization (progress ring/circle?)
  - Usage stats cards with better hierarchy
  - Action buttons with improved affordance
- Progress screen redesign:
  - Weekly progress charts/visualizations
  - Milestone cards with icons
  - Money saved visualization
- Onboarding flow redesign:
  - Welcome illustrations/icons
  - Input field styling
  - Progress indicators
- Tools screen redesign:
  - Breathing exercise animation
  - Tool cards with icons
- Settings screen redesign:
  - Clean list layout
  - Toggle switches styling

#### Design Principles
- Calm, supportive aesthetic (not clinical)
- Clear visual hierarchy
- Consistent spacing and alignment
- Subtle animations/transitions
- Accessible contrast ratios
- Support for dark mode (optional)

### Success criteria
- All screens have cohesive visual design
- Design feels calming and supportive
- Components are reusable and consistent
- App looks polished and professional

---

## Phase 5 — Release Preparation

**Goal:** Prepare for App Store submission.

### Deliverables
- App Store description & keywords
- Screenshots
- Privacy policy (live): `https://weannicotine.iamjarl.com/privacy/`
- TestFlight build
- Final bug fixes
- EAS Build configuration
- Sentry production setup
- Complete testing (functional, performance, accessibility)

### Success criteria
- App is ready for public release
- No critical crashes
- Clear value proposition on App Store page

### Detailed Checklist
See `docs/RELEASE_CHECKLIST.md` for a comprehensive release checklist covering all technical, legal, and submission requirements.

---

## Future ideas (Post-MVP)

All post-MVP ideas are tracked as GitHub Issues with the `enhancement` + `P3` labels.
See: https://github.com/JarlLyng/Taper/issues?q=is%3Aopen+label%3Aenhancement+label%3AP3

---

## Guiding principle

> Build slowly. Reduce friction.  
> The app should feel like support — not supervision.
