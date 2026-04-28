# App Store privacy — Sentry & data

Purpose:
- Explain how App Store privacy answers should be filled when Sentry is enabled

Audience:
- Maintainers handling App Store Connect privacy disclosures
- LLMs assisting with compliance or release tasks

Source of truth:
- Actual runtime behavior in [`lib/sentry.ts`](../lib/sentry.ts)
- Final disclosure state in App Store Connect

Related files:
- [`docs/SENTRY.md`](./SENTRY.md)
- [`docs/APP_STORE_METADATA.md`](./APP_STORE_METADATA.md)
- [`website/src/pages/privacy.astro`](../website/src/pages/privacy.astro)

Update when:
- Sentry behavior changes
- Privacy policy wording changes
- Apple privacy categories or requirements change

Vi bruger **Sentry i production** til at modtage fejl og crashes, så vi kan forbedre appen. Der sendes ingen brugerdata, kun tekniske diagnostics.

## 1. App Store Connect — App Privacy (skal udfyldes)

Når `EXPO_PUBLIC_SENTRY_DSN` er sat ved build, sender appen data til Sentry. Du **skal** opdatere App Privacy, ellers risikerer du afvisning.

### Trin for trin

1. Gå til **App Store Connect** → din app **Wean Nicotine** → **App Privacy**.
2. Klik **Edit** ved "Data Types".
3. Vælg **"Data is collected from this app"** (ikke "Data Not Collected").
4. Klik **"Add Data Type"** (eller "Add new data type").
5. Vælg kategori **Diagnostics**.
6. Afkryds **Crash Data**.
   - **Purpose:** Vælg "App Functionality". Kort beskrivelse fx: *"We collect crash data to fix bugs and improve app stability. No personal data is included."*
   - **Linked to user identity:** Vælg **No** (vi linker ikke crashes til bruger-ID).
   - **Used for tracking:** **No**.
7. **Tilføj også Performance Data** under Diagnostics med samme indstillinger. Vores nuværende `lib/sentry.ts`-konfiguration har `tracesSampleRate: 0.2` aktiv i production, hvilket sender 20 % af transaktions-spans til Sentry. Spans indeholder skærmnavne og timing — ikke brugsdata.
8. Gem og publicer ændringen.

### Reference fra Apple

- [App Privacy details](https://developer.apple.com/app-store/app-privacy-details/)
- Under "Diagnostics" findes Crash Data og Performance Data.

## 2. Privacy Policy (offentlig side)

Din privacy policy på **https://weannicotine.iamjarl.com/privacy/** bør indeholde:

- At appen primært gemmer data lokalt på enheden.
- At vi i production builds sender **crash- og fejllogs** til Sentry (tredjepart) udelukkende for at finde og rette fejl. Ingen tracking, ingen reklamer, ingen salg af data.
- Link til [Sentry's privacy policy](https://sentry.io/privacy/).
- At brugeren kan nulstille/slette alt appdata via "Start Over" i appen.

Hvis Sentry **ikke** er slået til (ingen DSN i production), kan du beholde "no data collected" i både App Store og privacy policy.

## 3. Teknisk (til reference)

- **Sentry init:** `lib/sentry.ts` (kun aktiv når DSN er sat).
- **Data som sendes:** exception messages, stack traces, device/model, OS version, app version, skærmnavne i transaktions-spans (ved tracing).
- **Data som IKKE sendes:** brugsdata (pouch logs, baseline, kvote, pris, valuta, triggere). `sendDefaultPii: false` slår automatisk indsamling af IP/cookies fra. En `beforeSend`-scrubber i `lib/sentry.ts` fjerner desuden alle kendte brugerdata-nøgler fra `extra` som defense-in-depth — testet i `lib/__tests__/sentry-scrubber.test.ts`.
- Se også [`docs/SENTRY.md`](./SENTRY.md) for DSN-opsætning og TestFlight-verifikation.
