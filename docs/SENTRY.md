# Sentry – sikre at det virker i Taper

Sentry er allerede integreret i projektet. Denne guide sikrer, at fejl og events når Sentry i **production**.

## Krav

- **EXPO_PUBLIC_SENTRY_DSN** skal være sat ved build (EAS Secret eller `.env` ved lokalt build).
- Sentry sender **ikke** events i `__DEV__` – kun i production builds.

## 1. Konfigurer DSN

- Gå til [sentry.io](https://sentry.io) → dit projekt → **Settings → Client Keys (DSN)**.
- Kopiér DSN (fx `https://xxx@xxx.ingest.sentry.io/xxx`).

**Lokal udvikling (valgfrit):**  
Kopiér `.env.example` til `.env` og sæt:

```bash
EXPO_PUBLIC_SENTRY_DSN=https://din-dsn@xxx.ingest.sentry.io/xxx
```

**Production (EAS build):** Opret EAS Secret så DSN er med i buildet:

```bash
eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://din-dsn@xxx.ingest.sentry.io/xxx" --environment production --visibility plaintext
```

Byg **kun efter** secret er oprettet (`eas env:list` for at tjekke).

## 2. Verificer at Sentry virker

- **Production build:** Når DSN er med i buildet (§1 og §4), sendes fejl og crashes automatisk til Sentry.
- **Tjek i Sentry:** Åbn dit projekt på [sentry.io](https://sentry.io). Events dukker op når der sker fejl i appen (fx efter TestFlight-brug). Ingen manuel “test-knap” i appen – verificer ved at se events i Sentry efter reel brug.

## 3. Hvor Sentry bruges i koden

| Sted | Formål |
|------|--------|
| `lib/sentry.ts` | Init, `captureError`, `captureMessage`, `testSentry` |
| `app/_layout.tsx` | `initSentry()` ved modul-load (før første render), `Sentry.ErrorBoundary` (fanger React crashes) |
| `hooks/useAppInitialize.ts` | `captureError()` ved init-fejl (Sentry er allerede initieret fra _layout) |
| `app/(tabs)/home.tsx` | `captureError()` ved load-/log-fejl |
| `lib/analytics.ts` / `lib/notifications.ts` / `app/index.tsx` | `captureError()` ved fejl |

Alle `capture*`-kald er no-op hvis DSN ikke er sat eller på web.

## 4. Lokalt build (IPA med Sentry) – vigtigt

Ved **`eas build --local`** hentes EAS Secrets ikke altid ind i build-miljøet på samme måde som ved sky-build. For at være **sikker** på at DSN er med i IPA’en:

1. Sæt variablen i terminalen **før** du kører build:
   ```bash
   export EXPO_PUBLIC_SENTRY_DSN="https://din-dsn@xxx.ingest.de.sentry.io/xxx"
   npx eas build --profile production --platform ios --local
   ```
2. Eller brug værdien fra din `.env` (kopiér DSN derfra).

Så indlejres DSN i `app.config.js` → `extra.sentryDsn` ved build, og TestFlight-buildet sender events til Sentry.

## 5. Fejlsøgning

**Ingen events i Sentry:**

1. **DSN i build:** Ved lokalt build skal du eksportere `EXPO_PUBLIC_SENTRY_DSN` i shell før build (§4). Ved sky-build: tjek `eas env:list --environment production`.
2. **Sentry-projekt:** Tjek at du kigger i det rigtige projekt/org på sentry.io, og at projektet ikke er sat på pause eller rate-limited.
3. **Netværk:** Enheden skal kunne nå Sentry (ingest URL). Vent 1–2 minutter efter en fejl.

## 6. Valgfrit: source maps

For læsbare stack traces i Sentry kan du uploade source maps med **SENTRY_AUTH_TOKEN** (se README og `.env.example`). Appen og error tracking virker også uden.

## 7. Før release – verificering

- **Events i production:** Efter build med DSN (EAS Secret eller `export EXPO_PUBLIC_SENTRY_DSN` ved lokalt build): installer via TestFlight, trigger en fejl (fx via Diagnostics-skærmen hvis `testSentry()` er tilgængelig, eller ved at reproducere en kendt fejl). Tjek på sentry.io at events ankommer.
- **Source maps:** Hvis du bruger `SENTRY_AUTH_TOKEN` og scriptet `sentry-expo-upload-sourcemaps` (se package.json), kør upload efter build og verificer i Sentry at stack traces viser kildefiler/linjenumre. Uden source maps virker error tracking stadig; traces er bare mindre læsbare.
