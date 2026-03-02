# Code Review — Taper

**Dato:** 2026-03-02
**Reviewer:** Claude Code
**Scope:** Fuld gennemgang af kodebase, arkitektur og produktkvalitet

---

## Overordnet vurdering

Taper er en velstruktureret React Native/Expo-app med klart formål og en god teknisk grundstruktur. Koden afspejler bevidste designbeslutninger: offline-first, SQLite, Sentry-integration, og et konsistent design system. Der er dog et antal konkrete forbedringer, primært i datahåndtering og state management, der vil gøre koden mere robust fremadrettet.

**Styrker:**
- Klar separation af concerns (`lib/` vs. `components/` vs. `app/`)
- Strict TypeScript gennemgående
- Godt design system (IAMJARL tokens via `lib/design.ts`)
- Fornuftig Sentry-integration med tidlig initialisering
- Optimistic UI på home screen

**Primære forbedringsområder:**
- Ingen tests (kritisk for beregningslogik)
- ~~Skrøbelig DB-migrationsstrategi~~ ✅ Fikset 2026-03-02
- Kompleks state management i `home.tsx` (delvist forbedret)
- ~~Milestone-logik med forkert `achievedAt`~~ ✅ Fikset 2026-03-02

---

## 1. Kritiske fund

### 1.1 Ingen tests — rammer beregningslogikken

`lib/taper-plan.ts` og `lib/progress.ts` indeholder forretningslogik, som direkte påvirker brugeroplevelsen. Der er ingen unit tests i hele projektet.

**Problem:** Fejl i `calculateDailyAllowance` eller `calculateWeeklyProgress` opdages kun, hvis en bruger rapporterer det.

**Anbefaling:** Tilføj Jest og skriv tests for de mest kritiske paths:

```ts
// __tests__/taper-plan.test.ts
describe('calculateDailyAllowance', () => {
  it('should return baseline on day 0', () => {
    const settings = { baselinePouchesPerDay: 10, weeklyReductionPercent: 5, startDate: Date.now() };
    expect(calculateDailyAllowance(settings, new Date())).toBe(10);
  });

  it('should reduce by 5% after 1 full week', () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const settings = { baselinePouchesPerDay: 10, weeklyReductionPercent: 5, startDate: startDate.getTime() };
    const result = calculateDailyAllowance(settings, new Date());
    expect(result).toBe(9.5);
  });
});
```

Prioritér at teste: `calculateDailyAllowance`, `calculateWeeklyProgress`, `calculateTotalProgress`, og edge cases som negativ tid og 0-baseline.

---

### 1.2 ✅ DB-migration via try/catch — fikset 2026-03-02

~~I [lib/db.ts:87-96](lib/db.ts#L87) bruges `ALTER TABLE` med stille fejlhåndtering.~~

**Løsning implementeret:** `runMigrations()` med `schema_version`-tabel. Fremtidige schema-ændringer tilføjes som entries i `MIGRATIONS`-arrayet i [lib/db.ts](lib/db.ts). `ignoreError: true` bruges kun til de to eksisterende legacy-migrationer.

---

### 1.3 ✅ Milestones har forkert `achievedAt` — fikset 2026-03-02

**Løsning implementeret:** `detectMilestones` i [lib/progress.ts](lib/progress.ts) bruger nu ét pass over alle dage for at finde præcist hvornår en tærskel blev krydset:
- Pouches avoided: scanner dage kronologisk og registrerer den dag kumulativt underskud passerede tærsklen
- Cravings resisted: `achievedAt` = timestamp på det N'te craving-log
- Money saved: beregnet ud fra samme pas som pouches avoided
- Bonus: fjerner også det dobbelte DB-query (`calculateTotalProgress` blev kaldt internt)

---

## 2. State Management (home.tsx)

[app/(tabs)/home.tsx](app/(tabs)/home.tsx) har vokset sig kompleks med 7+ stykker state, to refs til at forhindre race conditions, og en 50ms timeout i finally-blokken.

### 2.1 ✅ StyleSheet oprettes inde i komponenten — fikset 2026-03-02

**Løsning implementeret:** Styles er nu wrapped i `useMemo(() => StyleSheet.create({...}), [colors])`.

### 2.2 ✅ devLog genopbygges ved hvert render — fikset 2026-03-02

**Løsning implementeret:** `devLog` er flyttet til module scope i [app/(tabs)/home.tsx](app/(tabs)/home.tsx).

### 2.3 setTimeout i finally-blok er et code smell

[app/(tabs)/home.tsx:150](app/(tabs)/home.tsx#L150):

```ts
setTimeout(() => {
  setIsLoading(false);
  isLoadingRef.current = false;
}, 50);
```

50ms-forsinkelsen indikerer en race condition der er arbejdet udenom fremfor løst. I React 18 batcher `setState`-kald automatisk, så dette burde ikke være nødvendigt. Overvej at fjerne timeoutet og validere at det stadig fungerer korrekt — det løser sandsynligvis mere end det skaber.

### 2.4 Anbefaling: useReducer

Den samlede state i home.tsx vil egne sig bedre til `useReducer`, hvilket gør transitions eksplicitte og eliminerer behovet for at koordinere 5+ `setState`-kald:

```ts
type HomeState =
  | { status: 'loading' }
  | { status: 'ready'; dailyAllowance: number; pouchesUsed: number; cravingsResisted: number; baseline: number }
  | { status: 'no-plan' };

type HomeAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: {...} }
  | { type: 'LOAD_ERROR' }
  | { type: 'POUCH_LOGGED' }
  | { type: 'CRAVING_LOGGED' };
```

---

## 3. Arkitektur & design

### 3.1 `weeklyReductionPercent` er ikke konfigurerbar for brugeren

I [lib/taper-plan.ts:49](lib/taper-plan.ts#L49) er default 5%, og onboarding eksponerer ikke dette valg. Brugeren kan ikke justere reduktionshastighed, selv om det er det centrale parameter i et taper-program.

**Anbefaling (roadmap):** Tilføj et step i onboarding hvor brugeren vælger reduktionshastighed — f.eks. "Blid (3%)", "Standard (5%)", "Aggressiv (10%)". Det øger personalisering markant uden at øge kompleksitet.

### 3.2 Ingen undo på pouch-logging

Brugeren kan fejlagtigt trykke "Used a pouch". Der er ingen mulighed for at fortryde den seneste log-entry.

**Anbefaling:** Vis en "Fortryd"-toast i 5 sekunder efter logging (optimistisk UI allerede implementeret, så dette ville passe naturligt ind).

### 3.3 `detectMilestones` kalder `calculateTotalProgress` internt

[lib/progress.ts:272](lib/progress.ts#L272):

```ts
const totalProgress = await calculateTotalProgress(settings);
```

Kaldt inde i `detectMilestones`, som allerede har fetched alle logs. `calculateTotalProgress` fetcher logene igen — dvs. double DB-query for det samme data.

**Anbefaling:** Accept `totalProgress` som parameter, eller refaktorér til at beregne alt fra én log-fetch.

### 3.4 `settingsId`-state er kun til debugging

[app/(tabs)/home.tsx:33](app/(tabs)/home.tsx#L33):

```ts
const [settingsId, setSettingsId] = useState<number | null>(null); // Track settings ID for debugging
```

Denne bruges til `screenKey` for force remount, men kommentaren siger "for debugging". Det er lidt uklart. Overvej at navngive formålet mere eksplicit, f.eks. `settingsVersion`.

---

## 4. Database

### 4.1 `resetAllData` bruger manuel transaction

[lib/db.ts:149-163](lib/db.ts#L149):

```ts
await database.runAsync('BEGIN');
// ...
await database.runAsync('COMMIT');
```

expo-sqlite har `withTransactionAsync`-helper:

```ts
await database.withTransactionAsync(async () => {
  await database.runAsync('DELETE FROM log_entries');
  await database.runAsync('DELETE FROM taper_settings');
  // ...
});
```

Det er mere idiomatisk og håndterer rollback automatisk.

### 4.2 `getDatabase` vs `initDatabase` — to entry points

Både `getDatabase` og `initDatabase` eksisteres. `getDatabase` kalder `initDatabase` internt. Det er lidt redundant. Overvej at eksportere kun `getDatabase` og gøre `initDatabase` privat.

### 4.3 Manglende index på analytics-tabel

Analytics-tabellen nævnes i koden, men der oprettes ingen indekser på den (i modsætning til `log_entries`). Når analytics-data vokser (30-dages retention), kan queries blive langsomme uden index på `timestamp` og `event_type`.

---

## 5. Smårenser og code style

### 5.1 `any` i db.ts

[lib/db.ts:13](lib/db.ts#L13) — `runAsync` har `params?: any[]`. Med SQLite kan params typiseres som `(string | number | null)[]`. Det ville give bedre type-sikkerhed.

### 5.2 ✅ `__DEV__` console.log i progress.ts — fikset 2026-03-02

Debug-loggen i `calculateWeeklyProgress` er fjernet.

### 5.3 ✅ `pouchesPerCan = 20` er magic number — fikset 2026-03-02

**Løsning implementeret:** `POUCHES_PER_CAN = 20` som module-level konstant i [lib/progress.ts](lib/progress.ts). Fremtidig mulighed: gøres bruger-konfigurerbar (snus-dåser varierer: 20, 24 stk.).

### 5.4 ✅ Duplicate dayKey-format — fikset 2026-03-02

**Løsning implementeret:** `toDayKey(date: Date)` helper i [lib/progress.ts](lib/progress.ts) med korrekt padded format (`2026-01-05`). `getMonth() + 1` så måneder er 1-indekserede.

---

## 6. Produkt & UX

### 6.1 "Pouches Avoided" vs baseline kan virke demotiverende

"Avoided = baseline - actual" betyder, at en bruger der bruger 8 af 10 tilladt ser "2 avoided" — men mod baseline på 15 ser de "7 avoided". Det er positivt framing, men baseret på baseline (før taper), ikke dagens allowance. Overvej om det er det rigtige at kommunikere.

### 6.2 Ingen indikation af at man er under limit

Progress ring viser brugt/total, men der er ingen distinkt visuel markering af "du er under dit limit i dag" vs. "du er over". Et farve-skift på ringen (grøn → gul/rød) ville give umiddelbar feedback.

### 6.3 Tools-sektionen er svær at opdage

Tools ligger i tab 3. Mange brugere, der trænger til dem under et craving, vil ikke intuitivt kigge der. Overvej et contextual link fra home screen: "Kæmper du? [Prøv et redskab]".

---

## 7. Roadmap og prioritering

Baseret på reviewet er her en anbefalet prioritering:

| Prioritet | Task | Status |
|-----------|------|--------|
| 🔴 Høj | Tilføj unit tests for `taper-plan.ts` og `progress.ts` | ⏳ Åben |
| 🔴 Høj | Fix `achievedAt` i milestone-logik | ✅ Fikset 2026-03-02 |
| 🟡 Medium | DB-migrationsstrategi med version tracking | ✅ Fikset 2026-03-02 |
| 🟡 Medium | Ekstraher `pouchesPerCan` til navngivet konstant | ✅ Fikset 2026-03-02 |
| 🟡 Medium | Fix dayKey-format (korrekt padded, 1-indekseret måned) | ✅ Fikset 2026-03-02 |
| 🟢 Lav | `useReducer` i home.tsx | ⏳ Åben |
| 🟢 Lav | `StyleSheet.create` i `useMemo` | ✅ Fikset 2026-03-02 |
| 🟢 Lav | Konfigurerbar reduktionsprocent i onboarding | ⏳ Åben |
| 🟢 Lav | "Fortryd"-toast efter pouch-log | ⏳ Åben |

---

## Sammenfatning

Taper er en solid, velovervejet app. Kodebasen er ren, arkitekturen er sund, og der er tydelige spor af bevidste produktbeslutninger. Efter review-rettelserne (2026-03-02) er den kritiske migrationsstrategi og alle konkrete bugs fikset. Det eneste tilbageværende must-have er tests.

De resterende åbne punkter er forbedringer — ikke blokkere.
