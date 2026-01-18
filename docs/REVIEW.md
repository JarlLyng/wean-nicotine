# Review af Taper

Fokus: fejlrisici, adfaerdsregressioner og manglende tests/afdaekning.

## Findings (prioriteret)

### Mellem prioritet

1. **Trigger-data kan blive overskrevet med `null` ved settings-opdatering**
   - Fil: `lib/db-settings.ts:32`
   - Fil: `lib/db-settings.ts:37`
   - Problem: `saveTaperSettings` serialiserer `triggers` til `null`, hvis feltet er `undefined` eller tomt, og skriver altid `triggers = ?` ved update. Det betyder, at en opdatering af andre felter kan slette eksisterende triggers.
   - Risiko: Brugeren mister triggers uden at have valgt det.
   - Anbefaling: Bevar eksisterende triggers, hvis `settings.triggers` er `undefined`, eller haandter clear eksplicit (fx `triggers: []` => `null`).

2. **`daysSinceStart` kan blive negativ ved fremtidig startdato**
   - Fil: `lib/progress.ts:173`
   - Fil: `lib/progress.ts:185`
   - Problem: `calculateTotalProgress` bruger `Math.ceil` uden clamp. Hvis `startDate` ligger i fremtiden (device clock/fejl), bliver `daysSinceStart` negativ og kan vise negative dage i UI.
   - Risiko: Misvisende progress og tal (negative dage), potentielt forvirrende for brugeren.
   - Anbefaling: Clamp til `Math.max(0, ...)` og overvej om `Math.floor` giver mere stabil semantik for hele dage.

3. **Dark mode regressions pga. statiske eller hardcodede farver**
   - Fil: `app/(onboarding)/welcome.tsx:6`
   - Fil: `components/ui/StatCard.tsx:4`
   - Fil: `app/(tabs)/settings/notifications.tsx:168`
   - Fil: `app/(tabs)/settings/reset-taper.tsx:213`
   - Problem: Flere views bruger `colors` fra `lib/theme` (som er statisk light) eller hardcodede hex-vaerdier. Det bypasser `useDesignTokens` og dark mode.
   - Risiko: Ulæselig tekst og fejlende kontrast i dark mode.
   - Anbefaling: Flyt styles til `createStyles` baseret paa `useDesignTokens()` og erstat hardcodede farver med tokens (fx `colors.text.secondary`, `colors.background.muted`, `colors.shared.error`).

### Lav prioritet

4. **Milestone-detektion er O(n^2) over log-historik**
   - Fil: `lib/progress.ts:228`
   - Fil: `lib/progress.ts:230`
   - Problem: For hver dag filtreres hele `usedLogs`. Ved lange log-historikker bliver dette kvadratisk arbejde.
   - Risiko: Progress-skaermen bliver langsom paa enheder med mange logs.
   - Anbefaling: Pre-grupper `usedLogs` pr. dag (Map) og sla op i O(1), som i `calculateWeeklyProgress`.

5. **Meget debug-logging i produktion**
   - Fil: `app/(tabs)/home.tsx:36`
   - Fil: `app/(tabs)/progress.tsx:52`
   - Fil: `lib/db-log-entries.ts:180`
   - Problem: Mange `console.log`/`console.error` udskriver data om settings/logs i production builds.
   - Risiko: Performance overhead og mulig eksponering af brugerdata i logs.
   - Anbefaling: Gate logs bag `__DEV__` eller brug en logger med levels.

## Testhuller

- Ingen enhedstests for `calculateDailyAllowance`, `calculateWeeklyProgress` og `calculateTotalProgress` ved edge cases (fremtidig startdato, DST, 0 dage, store historikker).
- Ingen tests for `saveTaperSettings` der sikrer at `triggers` ikke slettes ved partielle updates.
- Ingen visuelle tests for dark mode paa onboarding og settings (welcome/reset/notifications/StatCard).

## Aabne spoergsmaal

- Skal opdatering af settings uden `triggers` bevare eksisterende triggers (forventet), eller nulstille dem?
- Skal progress beregnes mod baseline (som nu) eller mod planens daglige allowance for samme periode?

## Kort opsummering

Overordnet ser flowsne stabile ud, men der er konkrete risikoer for datatab (triggers), negative progress-tal ved fremtidig startdato samt dark-mode regressions i enkelte views.
