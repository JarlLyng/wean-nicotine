

# Taper — Roadmap

This roadmap describes the planned development of **Taper**, from initial foundation to a polished MVP and beyond.

The roadmap is **phase-based**, not date-based, to allow calm, iterative development and room for learning.

---

## Phase 0 — Foundation (Setup & Structure)

**Goal:** Establish a solid technical and conceptual foundation.

### Deliverables
- Expo project set up and running
- Expo Router configured (file-based navigation)
- Global app layout (safe areas, basic theming)
- Local storage strategy decided (SQLite or MMKV)
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
- “Reset taper” flow after slip-ups
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
- Accessibility pass (Dynamic Type, contrast)
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
- Privacy policy (local-only data)
- TestFlight build
- Final bug fixes

### Success criteria
- App is ready for public release
- No critical crashes
- Clear value proposition on App Store page

---

## Future ideas (Post-MVP)

- iCloud / optional cloud sync
- Widgets (daily allowance, progress)
- Live Activities (iOS)
- Multiple taper plans / experiments
- Export data (CSV)
- Broader nicotine support (gum, lozenges)
- Android release

---

## Guiding principle

> Build slowly. Reduce friction.  
> The app should feel like support — not supervision.