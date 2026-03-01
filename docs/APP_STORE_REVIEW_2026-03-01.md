# App Store Readiness Review — Taper
Date: 2026-03-01

## Scope
- App config and plugins (`app.json`, `app.config.js`, `plugins/withProductionPushEntitlements.js`, `plugins/withPrivacyManifest.js`)
- iOS runtime settings (prebuild output and Info.plist/entitlements in local `ios/`)
- Data flows, privacy, and external services (`lib/sentry.ts`, `lib/analytics.ts`, `lib/notifications.ts`)
- Release metadata and checklists (`docs/RELEASE_CHECKLIST.md`, `docs/PRIVACY_APP_STORE.md`)

## Executive Summary
**Overall status:** Mostly ready for App Store submission, **provided** privacy disclosures and App Store metadata are completed and Sentry is handled correctly.  
No code-level blockers were found in the current repo. The main remaining risks are privacy disclosures for Sentry, App Store metadata completeness, and final build verification (privacy manifest and build number).

## Blockers (must fix before submission)
1. **App Store metadata completeness**  
   The release checklist shows required App Store Connect fields are not fully completed (subtitle, description, keywords, category, support/marketing URLs, screenshots, age rating). These are hard requirements to submit.  
   References: `docs/RELEASE_CHECKLIST.md`

2. **Privacy disclosures must match Sentry behavior**  
   If `EXPO_PUBLIC_SENTRY_DSN` is set in production, data is sent off-device (crash/performance diagnostics). App Store privacy labels and public privacy policy must reflect this.  
   References: `lib/sentry.ts`, `docs/PRIVACY_APP_STORE.md`

## High Risk (likely review delays if missed)
1. **Privacy manifest must be present in the final IPA**  
   You have a config plugin that writes `PrivacyInfo.xcprivacy`, but App Review checks the **built binary**. Verify the manifest is included and Xcode 15+ does not warn about missing privacy manifests.  
   References: `plugins/withPrivacyManifest.js`, `app.config.js`

2. **Build number must increment for every submission**  
   EAS uses `app.json` for versioning (`appVersionSource: local`). Ensure `ios.buildNumber` is higher than the last uploaded build.  
   References: `app.json`, `eas.json`, `docs/RELEASE_CHECKLIST.md`

## Medium Risk / Quality
1. **Security: local secrets in `.env`**  
   `.env` contains a real Sentry auth token in this workspace. It is ignored by git, but if it was ever committed, rotate it immediately. Also keep `.env` out of any release artifacts.  
   References: `.env`, `.gitignore`

2. **Health/cessation positioning**  
   The app is nicotine/snUS tapering guidance. Ensure App Store description and in-app copy emphasize harm reduction and avoid medical claims. If any medical guidance is implied, add a short disclaimer (not medical advice).  
   References: `app/(onboarding)/welcome.tsx`, `docs/RELEASE_CHECKLIST.md`

3. **New Architecture risk**  
   `newArchEnabled: true` with RN 0.81 and Reanimated 4.x is fine, but App Store builds should be tested on real devices to catch runtime-only regressions.  
   References: `app.json`, `package.json`

## Low Risk / Observations
1. **Local-only analytics and data deletion**  
   Analytics and user data are local-only and can be cleared via “Start Over”, which aligns well with App Store privacy expectations.  
   References: `lib/analytics.ts`, `app/(tabs)/settings/reset-taper.tsx`

2. **Notifications**  
   Only local notifications are scheduled; permission flow is explicit and handled. No additional iOS usage descriptions are required for local notifications.  
   References: `lib/notifications.ts`

3. **Encryption declaration**  
   `ITSAppUsesNonExemptEncryption` is set to `false`. This is standard for apps using only HTTPS/TLS.  
   References: `app.json`

## App Store Approval Assessment
**Likely to be approved** if:
- App Store Connect metadata and screenshots are complete.
- Privacy labels match actual data flows (especially Sentry when enabled).
- Privacy manifest is included in the final build.
- Build number is incremented for submission.

**Potential review questions** could focus on:
- Data collection vs. "local-only" claims (Sentry).
- Health-related claims in metadata (nicotine tapering). Avoid clinical claims.

## Recommended Next Steps (prioritized)
1. **Decide on Sentry in production**  
   - If enabled: update App Store privacy labels + public privacy policy to include crash/performance data.  
   - If disabled: keep "no data collected" stance consistent everywhere.  
   References: `docs/PRIVACY_APP_STORE.md`

2. **Validate the production build**  
   - Build a production/TestFlight IPA and verify: privacy manifest present, notifications work, "Start Over" clears data, onboarding and progress flows are stable.  
   References: `docs/RELEASE_CHECKLIST.md`

3. **Finish App Store metadata**  
   - Subtitle, description, keywords, category, support URL, marketing URL, screenshots, age rating.  
   References: `docs/RELEASE_CHECKLIST.md`

4. **Rotate Sentry auth token if ever shared**  
   - Keep `.env` local only; do not include it in any archive or repo.  
   References: `.env`, `.gitignore`

## Residual Risks / Not Verified
- I did not run a production build or TestFlight install.
- I did not verify actual App Store Connect configuration or privacy labels.
- I did not inspect the final IPA for privacy manifest inclusion.
