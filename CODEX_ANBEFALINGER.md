# CODEX_ANBEFALINGER

Dato: 2026-04-28  
Scope: Expo-appen, dokumentation, GitHub-opsætning, EAS/Expo-opsætning og marketing-sitet i `website/`.

## Kort konklusion

Projektet er i god grundform: moderne Expo SDK 55, CNG-lignende setup uden committed `ios/` og `android/`, lokal SQLite-arkitektur, Sentry, typed routes, React Compiler, tests for central forretningslogik og et fungerende Astro-site.

De vigtigste forbedringer handler ikke om feature-kode, men om professionalisering og risikoreduktion:

1. GitHub mangler branch protection, Dependabot alerts, code scanning og en egentlig CI for appen.
2. Website-afhængigheder har aktive `npm audit` findings, inklusive high severity transitive sårbarheder.
3. Sentry/privacy-dokumentationen siger, at plan- og brugsdata ikke sendes, men enkelte Sentry-calls sender brugerrelaterede værdier som `baseline`, `price`, `currency` og rå `triggers`.
4. Expo-opsætningen er tæt på grøn, men `expo-doctor` fandt patch-version drift for `expo` og `expo-notifications`.
5. Dokumentationen er nyttig, men har nogle konkrete stale/redundante dele: README-licens modsiger `LICENSE`, `AI_CONTEXT.md` nævner et forkert testantal, og `website/marketing-site.md` ligner en gammel build-spec efter sitet allerede findes.

## Verificeret lokalt

- `npm test -- --runInBand`: bestod, 34 tests.
- `npm run lint`: bestod.
- `npx tsc --noEmit`: bestod.
- `npm run build` i `website/`: bestod, 33 sider bygget.
- `npx expo-doctor`: 17/18 checks bestod. Fejl: `expo` forventes `~55.0.18`, fundet `55.0.17`; `expo-notifications` forventes `~55.0.21`, fundet `55.0.20`.
- `npm audit --omit=dev` i root: 11 moderate findings via Expo-transitive dependencies (`postcss`, `uuid`). `npm audit fix --force` foreslår en breaking downgrade til Expo 49 og bør ikke køres ukritisk.
- `npm audit --omit=dev` i `website/`: 6 findings, heraf 3 high. `npm audit fix` forventes at kunne løse dem uden `--force`.
- GitHub remote: private repo med god beskrivelse, homepage og relevante topics.
- GitHub API-checks: `main` er ikke branch protected, Dependabot alerts er disabled, code scanning er disabled, `delete_branch_on_merge` er false.

## Anbefalinger med høj prioritet

### 1. Gør GitHub sikkert og professionelt

Repoet har kun `.github/workflows/deploy-website.yml`. Det betyder, at PRs og pushes ikke automatisk validerer appen.

Anbefalinger:

- Tilføj `.github/workflows/ci.yml` for pull requests og push til `main`:
  - root: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm test -- --runInBand`, `npx expo-doctor`.
  - website: `npm ci`, `npm run build`.
- Slå branch protection/ruleset til for `main`:
  - kræv pull request før merge.
  - kræv grøn CI.
  - blokér force-push og branch deletion.
  - overvej linear history og signed commits, hvis workflowet passer til dig.
- Slå Dependabot alerts og Dependabot security updates til.
- Tilføj `.github/dependabot.yml` for:
  - root `npm`.
  - `website` `npm`.
  - `github-actions`.
- Slå code scanning til, helst GitHub CodeQL default setup for JavaScript/TypeScript.
- Slå secret scanning/push protection til, hvis planen understøtter det.
- Tilføj `SECURITY.md`, `CODEOWNERS` og en kort PR template.
- Slå `delete_branch_on_merge` til.
- Slå GitHub Wiki fra, medmindre den aktivt bruges. Dokumentationen ligger allerede i repoet, og en wiki bliver let en ekstra stale source of truth.

### 2. Luk website-sårbarhederne først

`website` har konkrete audit findings:

- `astro <6.1.6` moderate.
- `defu <=6.1.4` high.
- `picomatch` high.
- `postcss <8.5.10` moderate.
- `smol-toml <1.6.1` moderate.
- `vite 7.0.0 - 7.3.1` high.

Anbefalinger:

- Kør `npm audit fix` i `website/`.
- Kør derefter `npm run build` i `website/`.
- Commit både `website/package.json` og `website/package-lock.json`.
- Overvej et fast månedligt dependency-maintenance issue eller Dependabot grouping, så SEO-sitet ikke bliver en stille sikkerhedsrisiko.

### 3. Stram Sentry og privacy op

Privacy-dokumentationen siger, at Sentry ikke sender brugerens logs eller planindstillinger. Koden sender dog brugerrelateret metadata i mindst disse tilfælde:

- `app/(onboarding)/triggers.tsx`: `baseline`, `price`, `currency`.
- `lib/db-settings.ts`: rå `triggers` ved JSON parse-fejl.

Derudover er performance tracing aktivt i production (`tracesSampleRate: 0.2`), så App Store privacy bør ikke omtale Performance Data som kun "valgfrit", medmindre tracing slås fra.

Anbefalinger:

- Fjern brugerdata fra `captureError(..., extra)` og brug kun tekniske kontekstnøgler, fx `context`, `screen`, `operation`.
- Tilføj en central scrubber i `beforeSend`, der dropper eller redigerer `event.extra` for kendte følsomme felter.
- Sæt eksplicit Sentry privacy-valg i `Sentry.init`, fx `sendDefaultPii: false`, og tag stilling til screenshots/session replay/performance data.
- Opdater `docs/PRIVACY_APP_STORE.md`, `docs/SENTRY.md` og privacy-siderne, så de matcher den faktiske runtime-adfærd.
- Hvis tracing bevares, registrér Performance Data under App Store Connect Diagnostics.

## Expo og EAS

### 4. Ret Expo patch-version drift

`expo-doctor` forventer:

- `expo ~55.0.18`, fundet `55.0.17`.
- `expo-notifications ~55.0.21`, fundet `55.0.20`.

Anbefaling:

- Kør `npx expo install expo expo-notifications`.
- Kør derefter `npx expo-doctor`, `npm test -- --runInBand`, `npm run lint` og `npx tsc --noEmit`.

### 5. Beslut en klar EAS Update-politik

Projektet har `expo-updates`, `runtimeVersion: { policy: 'appVersion' }`, `updates.url` og EAS channels (`preview`, `production`). Det er godt, men policyen kræver disciplin: hvis native runtime ændrer sig uden app-version bump, kan en OTA-update blive inkompatibel.

Anbefalinger:

- Hvis OTA-updates bruges aktivt: dokumentér en releaseproces for `eas update`, preview-kanal, rollout og rollback.
- Overvej `runtimeVersion` policy `fingerprint`, hvis du vil reducere risikoen for inkompatible updates ved native dependency/config-ændringer.
- Hvis OTA ikke bruges: overvej at fjerne `expo-updates` og `updates.url`, så appens runtimeflade er mindre og releaseprocessen enklere.

### 6. Ryd op i web/webpack-artefakter

`webpack.config.js` refererer `@expo/webpack-config` og `webpack`, men ingen af dem findes som root dependencies. Expo SDK 55 bruger Metro-web, og `app.config.js` har `web.output = 'static'`.

Anbefaling:

- Fjern `webpack.config.js`, hvis den ikke bruges.
- Behold `metro.config.js`, fordi den aktivt løser `expo-sqlite` til web-stub.
- Dokumentér at Expo-web kun er en preview/design fallback, mens det offentlige website er Astro i `website/`.

### 7. Gør releaseværktøjer reproducerbare

Der er ingen `engines` eller `packageManager` i root/website packages. Lokalt kørte Node `v24.5.0`, mens GitHub Actions bruger Node 22.

Anbefalinger:

- Tilføj `.nvmrc` eller `.node-version` med Node 22.
- Tilføj `engines.node` og `packageManager` i både root og `website/package.json`.
- Overvej scripts som:
  - `check`: lint + typecheck + test.
  - `doctor`: `expo-doctor`.
  - `website:build`: build af Astro-site fra root.

### 8. Afklar Android-strategien

Repoet har Android-konfiguration og `android` script, men README siger iPhone-first, og `app.config.js` mangler `android.package`.

Anbefaling:

- Hvis Android er fremtidig platform: tilføj `android.package`, release-noter, EAS submit-strategi og testplan.
- Hvis Android ikke er mål nu: skriv tydeligt at Android-konfiguration kun er placeholder, eller fjern Android-releaseoverfladen for at undgå forvirring.

## Dokumentation

### 9. Ret konkrete unøjagtigheder

Anbefalinger:

- README siger "License not yet specified", men repoet har `LICENSE` med MIT, og GitHub viser MIT. Ret README til MIT eller skift licensen, hvis MIT ikke er intentionen.
- `docs/AI_CONTEXT.md` siger, at taper-plan ændringer ikke bør bryde "20 existing unit tests"; der er nu 34 tests. Undgå hårdkodede testantal eller opdater tallet.
- README bruger stadig "MVP feature set", selvom v1.3-funktioner som pace-valg, edit plan og undo er live. Omdøb til "Current feature set".
- `docs/PRIVACY_APP_STORE.md` skal afspejle at Sentry performance tracing er aktiv, hvis den bevares.

### 10. Fjern eller arkivér redundant dokumentation

`website/marketing-site.md` er en gammel implementeringsspec for et site, der allerede findes. Den nævner bl.a. en foreslået `taper-site/` struktur og design-token detaljer, som kan afvige fra den aktuelle Astro-kode.

Anbefaling:

- Slet filen, hvis den ikke længere bruges.
- Alternativt flyt den til `docs/archive/` og marker den eksplicit som historisk.

### 11. Stram dokumentationshierarkiet

Docs-kontrakten i `docs/README.md` er god. Problemet er primært, at README, `AI_CONTEXT.md`, Sentry-docs, App Store metadata og website-copy gentager mange sandheder.

Anbefalinger:

- Lad `docs/AI_CONTEXT.md` være arkitekturkort, ikke changelog.
- Lad README være onboarding + commands + releaseproces, ikke fuld produktstrategi.
- Lad App Store- og privacy-docs kun indeholde copy/compliance, ikke generelle tekniske forklaringer.
- Brug links frem for gentagelser, især for Sentry, privacy og release steps.

## Projektkvalitet og testdækning

### 12. Udvid testdækning til risikoområder

De eksisterende tests dækker centrale pure functions. Det er godt, men de mest risikable flows er ikke testet.

Anbefalinger:

- Tilføj tests for database migrations og `resetAllData`/`deleteAllAnalytics`.
- Tilføj tests for notification scheduling/cancel behavior med mock af `expo-notifications`.
- Tilføj tests for Sentry scrubber, når privacy-oprydningen laves.
- Overvej enkelte hook/screen integrationstests for onboarding completion og home logging/undo.

### 13. Fjern personlig editor-konfiguration

`.claude/launch.json` er tracked og indeholder en absolut lokal sti:

`/Users/jarl.l/.nvm/versions/node/v24.5.0/bin/npx`

Anbefaling:

- Fjern `.claude/launch.json` fra repoet eller gør den portabel.
- Hvis editor-filer skal deles, behold kun team-neutrale filer som `.vscode/extensions.json`.

## Lavere prioritet

- `babel.config.js` indeholder kun `babel-preset-expo`. Vurder om den stadig er nødvendig i SDK 55. Hvis ikke, kan den fjernes.
- `website/package.json` har `lint: "expo lint"`. Det passer dårligt til et Astro-site. Erstat med et Astro-/ESLint-relevant check eller fjern scriptet.
- `sentry.properties` har placeholder `SET_YOUR_ORG` og `SET_YOUR_PROJECT`. Enten dokumentér at env vars altid skal overstyre dem, eller brug rigtige ikke-hemmelige slugs.
- Overvej `eas submit`-metadata for iOS, hvis upload skal flyttes fra Transporter til EAS Submit.

## Foreslået rækkefølge

1. Fix website-audit med `npm audit fix` i `website/`.
2. Ret Sentry privacy-læk og opdater privacy/App Store docs.
3. Tilføj GitHub CI og branch protection på `main`.
4. Slå Dependabot alerts/security updates og code scanning til.
5. Ret Expo patch-versionerne og kør `expo-doctor` igen.
6. Ryd op i `webpack.config.js`, `website/marketing-site.md`, README-licens og `AI_CONTEXT.md` testantal.
7. Pin Node/npm toolchain og tilføj samlede `check` scripts.

## Kilder

- Expo CNG: https://docs.expo.dev/workflow/continuous-native-generation/
- Expo runtime versions og updates: https://docs.expo.dev/eas-update/runtime-versions/
- Expo EAS Update med EAS Build: https://docs.expo.dev/build/updates/
- Expo app config: https://docs.expo.dev/versions/latest/config/app/
- GitHub protected branches: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- GitHub Dependabot alerts: https://docs.github.com/en/code-security/concepts/supply-chain-security/about-dependabot-alerts
- GitHub Dependabot version updates: https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configuring-dependabot-version-updates
- GitHub CodeQL/code scanning: https://docs.github.com/en/code-security/concepts/code-scanning/codeql/about-code-scanning-with-codeql
