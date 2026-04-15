# Sentry – error tracking i Wean Nicotine

Purpose:
- Explain how Sentry is configured and how to verify it in builds

Audience:
- Maintainers handling diagnostics and release verification
- LLMs assisting with build or monitoring setup

Source of truth:
- Runtime behavior in [`lib/sentry.ts`](../lib/sentry.ts)
- Build-time environment handling in [`app.config.js`](../app.config.js)

Related files:
- [`app/_layout.tsx`](../app/_layout.tsx)
- [`hooks/useAppInitialize.ts`](../hooks/useAppInitialize.ts)
- [`docs/PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md)

Update when:
- DSN handling changes
- Build workflow changes
- Sentry SDK behavior or project policy changes

---

## Architecture

Sentry is configured in three layers:

1. **`initSentry()`** — called at module level in `app/_layout.tsx` before first render
2. **`Sentry.wrap()`** — wraps the root `RootLayout` component for native crash capture
3. **`Sentry.ErrorBoundary`** — wraps the React tree for JS error fallback UI

### Integrations

- **Default integrations** are enabled (ANR detection, app start timing, native crash handling, screenshots)
- **`reactNavigationIntegration`** tracks screen transitions via Expo Router's navigation container
  - `enableTimeToInitialDisplay: true` measures render time per screen
- **`tracesSampleRate`**: 20% in production (was 10% in v1.0)

### Error capture coverage

All catch blocks in the app report to Sentry in production:

| File | Context |
|------|---------|
| `app/_layout.tsx` | ErrorBoundary (automatic) |
| `app/index.tsx` | App routing |
| `app/(tabs)/home.tsx` | Load data, log pouch, log craving |
| `app/(tabs)/progress.tsx` | Load progress data |
| `app/(tabs)/settings/index.tsx` | Load data, notification status, toggle checkin |
| `app/(tabs)/settings/notifications.tsx` | Load status, toggle checkin, toggle trigger reminders |
| `app/(tabs)/settings/reset-taper.tsx` | Start over + data verification |
| `app/(onboarding)/index.tsx` | Onboarding routing |
| `app/(onboarding)/triggers.tsx` | Complete onboarding |
| `hooks/useAppInitialize.ts` | App initialization |
| `lib/analytics.ts` | Log event, get events, clear old, delete all |
| `lib/notifications.ts` | All schedule/cancel operations |
| `lib/db-settings.ts` | JSON parse triggers |

---

## Krav

- **EXPO_PUBLIC_SENTRY_DSN** skal være sat ved build (EAS Secret eller `.env` ved lokalt build).
- Sentry sender **ikke** events i `__DEV__` – kun i production builds.

## 1. Konfigurer DSN

- Gå til [sentry.io](https://sentry.io) → dit projekt → **Settings → Client Keys (DSN)**.
- Kopiér DSN (fx `https://xxx@xxx.ingest.sentry.io/xxx`).

**Lokal udvikling (valgfrit):**
Kopiér `.env.example` til `.env` og sæt:

```bash
EXPO_PUBLIC_SENTRY_DSN=https://din-dsn@xxx.ingest.de.sentry.io/xxx
```

**Production (EAS build):** Opret EAS Secret:

```bash
eas env:create --name EXPO_PUBLIC_SENTRY_DSN --value "https://din-dsn@xxx.ingest.sentry.io/xxx" --environment production --visibility plaintext
```

## 2. Verificer at Sentry virker

- **Production build:** Når DSN er med i buildet, sendes fejl og crashes automatisk.
- **Tjek i Sentry:** Åbn dit projekt på [sentry.io](https://sentry.io). Events dukker op efter reel brug eller TestFlight.
- **Navigation breadcrumbs:** Screen transitions vises automatisk i event-detaljer.

## 3. Lokalt build (IPA med Sentry)

Ved **`eas build --local`** skal DSN sættes i terminalen:

```bash
export EXPO_PUBLIC_SENTRY_DSN="https://din-dsn@xxx.ingest.de.sentry.io/xxx"
npx eas build --profile production --platform ios --local
```

## 4. Fejlsøgning

**Ingen events i Sentry:**

1. **DSN i build:** Ved lokalt build: `export EXPO_PUBLIC_SENTRY_DSN` i shell. Ved sky-build: `eas env:list --environment production`.
2. **Sentry-projekt:** Tjek at du kigger i det rigtige projekt/org, og at projektet ikke er pauseret.
3. **Netværk:** Enheden skal kunne nå Sentry ingest URL. Vent 1–2 minutter.

## 5. Valgfrit: source maps

For læsbare stack traces upload source maps med **SENTRY_AUTH_TOKEN**. Appen virker også uden.
