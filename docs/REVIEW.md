# Code Review — Taper

**Dato:** 2026-03-02 (opdateret 2026-03-04)
**Scope:** Kodebase, arkitektur og produktkvalitet

---

## Overordnet vurdering

Taper er en velstruktureret React Native/Expo-app med klart formål og en god teknisk grundstruktur. Offline-first SQLite, Sentry-integration, og et konsistent design system (IAMJARL tokens).

**Styrker:**
- Klar separation af concerns (`lib/` vs. `components/` vs. `app/`)
- Strict TypeScript gennemgående
- Godt design system via `lib/design.ts`
- Fornuftig Sentry-integration med tidlig initialisering
- Optimistic UI på home screen

---

## Åbne forbedringer

### 1. Ingen tests — rammer beregningslogikken

`lib/taper-plan.ts` og `lib/progress.ts` indeholder forretningslogik, som direkte påvirker brugeroplevelsen. Der er ingen unit tests.

**Anbefaling:** Tilføj Jest og test de mest kritiske paths: `calculateDailyAllowance`, `calculateWeeklyProgress`, `calculateTotalProgressAndMilestones`, og edge cases som negativ tid og 0-baseline.

---

### 2. useReducer i home.tsx

Home screen har 7+ stykker state. `useReducer` ville gøre transitions eksplicitte og eliminere behovet for at koordinere multiple `setState`-kald.

---

### 3. `weeklyReductionPercent` er ikke konfigurerbar

Default er 5%, og onboarding eksponerer ikke valget. Tilføj et step med f.eks. "Blid (3%)", "Standard (5%)", "Aggressiv (10%)".

---

### 4. Ingen undo på pouch-logging

Vis en "Fortryd"-toast i 5 sekunder efter logging.

---

### 5. `resetAllData` bruger manuel transaction

`expo-sqlite` har `withTransactionAsync` som er mere idiomatisk og håndterer rollback automatisk.

---

### 6. Manglende index på analytics-tabel

Ingen indekser på analytics-tabellen. Når data vokser (30-dages retention), kan queries blive langsomme uden index på `timestamp` og `event_type`.

---

## Produkt & UX idéer

- **"Pouches Avoided"** er baseret på baseline, ikke dagens allowance. Overvej om det er det rigtige at kommunikere.
- **Ingen visuel markering** af "under limit" vs. "over limit". Farveskift på ringen ville give umiddelbar feedback.
- **Tools er svære at opdage** under et craving. Overvej et contextual link fra home screen.

---

## Prioritering

| Prioritet | Task |
|-----------|------|
| Høj | Tilføj unit tests for beregningslogik |
| Lav | `useReducer` i home.tsx |
| Lav | Konfigurerbar reduktionsprocent |
| Lav | "Fortryd"-toast efter pouch-log |
| Lav | `withTransactionAsync` i resetAllData |
| Lav | Analytics index |
