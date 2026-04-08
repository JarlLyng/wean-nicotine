# Engineering Review Snapshot

Purpose:
- Capture engineering findings and improvement ideas at a point in time

Audience:
- Maintainers prioritizing technical debt and product polish
- LLMs assisting with planning or review follow-up

Source of truth:
- Code is canonical; this document is a dated assessment

Related files:
- [`docs/AI_CONTEXT.md`](./AI_CONTEXT.md)
- [`lib/taper-plan.ts`](../lib/taper-plan.ts)
- [`lib/progress.ts`](../lib/progress.ts)
- [`app/(tabs)/home.tsx`](../app/(tabs)/home.tsx)
- [`lib/db.ts`](../lib/db.ts)

Update when:
- A finding is resolved or invalidated
- A major architectural change changes the assessment

Last reviewed:
- Original review: 2026-03-02
- Re-verified against current code: 2026-03-21

## Current Summary

Wean Nicotine has a coherent Expo/React Native structure with clear domain boundaries, local-first storage, and a consistent design-token system. The main remaining gaps are test coverage, some product configurability, and a few quality-of-life improvements on the home flow.

## Confirmed Strengths

- Clear separation between routes (`app/`), shared UI (`components/`), and business logic (`lib/`)
- Canonical domain types in [`lib/models.ts`](../lib/models.ts)
- Early Sentry initialization and root error boundary in [`app/_layout.tsx`](../app/_layout.tsx)
- Local-first SQLite storage with explicit migrations in [`lib/db.ts`](../lib/db.ts)
- Optimistic logging UX on the home screen

## Open Findings

### 1. No automated tests for core calculations

Status: Open

`lib/taper-plan.ts` and `lib/progress.ts` contain user-facing business logic, but the repository still has no test runner or automated coverage in `package.json`.

Recommended follow-up:
- Add a test runner
- Cover `calculateDailyAllowance`
- Cover progress aggregation and milestone calculations
- Include edge cases like zero baseline, future dates, and empty logs

### 2. Home screen state is still dense

Status: Open

[`app/(tabs)/home.tsx`](../app/(tabs)/home.tsx) coordinates multiple interdependent state values and loading branches. It works, but the state model is still heavier than necessary for long-term maintenance.

Recommended follow-up:
- Consider consolidating state with `useReducer` or a dedicated view-model hook

### 3. Weekly reduction is stored but not user-configurable in onboarding

Status: Open

`weeklyReductionPercent` is part of the domain model and settings UI, but onboarding still appears to assume the default plan rather than letting the user choose a taper pace.

Recommended follow-up:
- Add a taper pace step or preset selection during onboarding

### 4. No undo flow after pouch logging

Status: Open

The app supports fast one-tap logging, but there is no short undo window if the user taps accidentally.

Recommended follow-up:
- Add a transient undo affordance after `pouch_used`

### 5. `resetAllData` still uses manual SQL transaction control

Status: Open

[`lib/db.ts`](../lib/db.ts) manually issues `BEGIN`, `COMMIT`, and `ROLLBACK`. This is valid, but still a maintenance hotspot compared with a higher-level transaction helper if Expo’s SQLite API supports the needed semantics cleanly in the current SDK.

Recommended follow-up:
- Re-evaluate transaction helper support in the current Expo SQLite version before refactoring

## Resolved Or Invalidated Findings

### Analytics table indexing

Status: Resolved

The previous review noted missing analytics indexes. That is no longer accurate. [`lib/analytics.ts`](../lib/analytics.ts) now creates indexes for both `event_type` and `timestamp`.

## Product And UX Notes

- “Pouches Avoided” is derived from baseline, not from the current allowance. That is mathematically valid but may not match user intuition.
- The home screen could communicate “under allowance” vs. “over allowance” more explicitly.
- Tools remain somewhat hidden unless the user intentionally opens the Tools tab.

## Suggested Priority Order

| Priority | Task |
| --- | --- |
| High | Add automated tests for taper and progress calculations |
| Medium | Expose taper pace / reduction percent in onboarding |
| Medium | Add undo for pouch logging |
| Low | Simplify home-screen state management |
| Low | Revisit transaction API for `resetAllData` |
