# Review af Taper (ny runde)

Fokus: fejlrisici, adfaerdsregressioner og manglende tests/afdaekning.

## Findings (prioriteret)

### Mellem prioritet

1. **Reset fjerner triggers uden at det er tilsigtet**
   - Fil: `app/(tabs)/settings/reset-taper.tsx:36`
   - Fil: `lib/db-settings.ts:32`
   - Problem: `handleReset` opretter `newSettings` uden `triggers`, og `saveTaperSettings` serialiserer `triggers` til `null`. Det nulstiller brugerens triggers ved reset af planen.
   - Risiko: Brugeren mister sine trigger-data, selvom reset kun handler om planens startdato.
   - Anbefaling: Medtag `currentSettings.triggers` i `newSettings`, eller lad `saveTaperSettings` beholde eksisterende triggers hvis feltet er `undefined`.

2. **Daglig allowance kan blive stoerre end baseline**
   - Fil: `lib/taper-plan.ts:11`
   - Problem: `getWeeksBetween` returnerer fraktionelle uger og kan blive negativ, hvis `currentDate` er foer `startDate` (fx tidszone eller device clock). Det giver et `reductionFactor` > 1, saa allowance stiger over baseline.
   - Risiko: Brugeren ser en uventet stigning i allowance og plan-logik bliver inkonsistent med "ugentlig" reduktion.
   - Anbefaling: Clamp til `Math.max(0, weeksSinceStart)` og overvej at floor'e til hele uger for en rigtig ugentlig model.

### Lav prioritet

3. **O(n^2) log-filtrering i progress**
   - Fil: `lib/progress.ts:115`
   - Problem: For hver dag filtreres hele `usedLogs`. Ved mange logs vokser omkostningen kvadratisk.
   - Risiko: Progress-skaermen kan blive langsom paa enheder med lang historik.
   - Anbefaling: Pre-grupper logs pr. dag (Map/dict), og sla op pr. dag i O(1).

4. **Haptics afhanger af `process.env.EXPO_OS`**
   - Fil: `components/haptic-tab.tsx:9`
   - Problem: `process.env.EXPO_OS` er ikke garanteret ved runtime i alle builds, saa iOS-haptics kan fejle stille.
   - Risiko: Ingen haptic feedback paa iOS i prod builds.
   - Anbefaling: Brug `Platform.OS === 'ios'` i stedet for env-var.

5. **Dummy data paa web er ikke deterministisk**
   - Fil: `lib/db-web-dummy.ts:54`
   - Fil: `lib/db-log-entries.ts:38`
   - Problem: `getDummyLogEntries()` bruger `Math.random()` hver gang og kaldes ved hver fetch. UI kan skifte tal mellem renders.
   - Risiko: Ustabil preview paa web og vanskeligere visuel QA.
   - Anbefaling: Cache dummy data per session (memoize) eller brug seedet random.

## Testhuller

- Ingen tests for `calculateDailyAllowance` og `calculateWeeklyProgress` med edge cases (fx startDate i fremtiden, DST, 0/negative uger).
- Ingen tests for reset-flow (bevare triggers) og triggers-serialization i settings.

## Oabne spoergsmaal

- Skal reset af taper-plan bevare triggers, eller er det bevidst at nulstille dem?
- Oensker I en strikt ugentlig reduktion (trinvis) eller en glat daglig reduktion (fraktionelle uger)?

