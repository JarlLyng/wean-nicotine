# App Store privacy — Sentry & data

If **Sentry is enabled in production** (by setting the EAS secret `EXPO_PUBLIC_SENTRY_DSN`), the app sends error and performance data to Sentry. You must reflect this in:

1. **App Store Connect — App Privacy**
   - Declare “Crash Data” and “Performance Data” (or equivalent) as collected.
   - Purpose: App functionality / analytics as appropriate.
   - See [App Store privacy labels](https://developer.apple.com/app-store/app-privacy-details/).

2. **Public privacy policy** (`https://taper.iamjarl.com/privacy/`)
   - State that error/crash data may be sent to Sentry when the app is used in production.
   - Include link to [Sentry’s privacy policy](https://sentry.io/privacy/) if required.

If Sentry is **not** set in production (no `EXPO_PUBLIC_SENTRY_DSN`), the app does not send any data off-device and you can keep a “no data collected” / “local only” stance in App Store and privacy policy.

See `lib/sentry.ts` for runtime behavior (Sentry only initializes when DSN is set).
