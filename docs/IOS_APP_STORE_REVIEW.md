# iOS / App Store Review — Taper
Date: 2026-02-10

## Remediation (2026-02)

All 10 findings have been addressed:

| # | Finding | Fix |
|---|---------|-----|
| 1 | Push entitlement development | Config plugin `plugins/withProductionPushEntitlements.js` sets `aps-environment` to `production`. |
| 2 | Missing privacy manifest | Config plugin `plugins/withPrivacyManifest.js` adds `PrivacyInfo.xcprivacy` at prebuild. |
| 3 | Sentry privacy | `docs/PRIVACY_APP_STORE.md` and comment in `lib/sentry.ts`; declare in App Store + policy if DSN set. |
| 4 | DB init twice | Single `initPromise` in `lib/db.ts`; `app/index.tsx` only calls `hasTaperSettings()` (no direct init). |
| 5 | Fractional weeks | `lib/taper-plan.ts`: normalize start/end to midnight, `Math.floor(weeksSinceStart)`. |
| 6 | Analytics retention | `clearOldAnalytics()` called in `useAppInitialize` after `initAnalytics()`. |
| 7 | Allowance display | Home shows one decimal via `formatAllowanceDisplay()`; state uses 1 decimal. |
| 8 | iOS min version | `app.json` `ios.deploymentTarget`: `"15.1"`. |
| 9 | Experimental features | `newArchEnabled`: false, `reactCompiler`: false for v1.0. |
| 10 | Notifications link | Settings index: "Notification options" button → `/(tabs)/settings/notifications`. |

Config is applied via `app.config.js` (extends `app.json`, adds the two plugins).

---

## Summary
This review focuses on App Store readiness for iOS, release risks, and correctness/performance concerns. I reviewed the config, iOS native project, and core data/notification flows.

## Findings (ordered by severity)

1. [BLOCKER] Push notification entitlement is set to development
Location: `ios/Taper/Taper.entitlements:5-6`
Why it matters: App Store builds must use the `production` APS environment (or not include the entitlement at all if you only use local notifications). A `development` entitlement can cause APNs misconfiguration and App Review delays.
Recommendation: Set `aps-environment` to `production` for Release builds, or remove the capability if you do not plan to use remote push.

2. [BLOCKER] Missing privacy manifest in repo
Location: Not found (no `PrivacyInfo.xcprivacy` in `ios/`)
Why it matters: Apple now requires Privacy Manifests for SDKs and “required reason” APIs. You use Expo modules and Sentry, which can trigger these requirements. Missing manifests can block submission or cause App Store warnings.
Recommendation: Add a top‑level `PrivacyInfo.xcprivacy` and verify aggregated privacy manifests are produced by the build (Xcode 15). Confirm there are no warnings during archive or App Store upload.

3. [BLOCKER] App Store privacy disclosures must match Sentry behavior
Location: `lib/sentry.ts:14-53`
Why it matters: If `EXPO_PUBLIC_SENTRY_DSN` is set in production, data leaves the device. This must be reflected in App Store privacy labels and the public privacy policy.
Recommendation: Either fully document Sentry data collection in App Store Connect + privacy policy, or disable Sentry in production if you want a “local only” claim.

4. [HIGH] Database initialization is performed twice on app launch
Location: `hooks/useAppInitialize.ts:23-31` and `app/index.tsx:24-29`
Why it matters: Concurrent `initDatabase()` calls can create duplicate opens and nondeterministic initialization timing. This increases cold‑start risk and complicates error handling.
Recommendation: Centralize DB init in a single place (prefer the root layout hook), and make `app/index.tsx` depend on a shared “app ready” signal.

5. [HIGH] “Weekly reduction” is applied continuously due to fractional weeks
Location: `lib/taper-plan.ts:15-41` and `lib/taper-plan.ts:53-54`
Why it matters: `weeksSinceStart` is fractional and `startDate` includes time‑of‑day. This can reduce the allowance earlier than expected (e.g., day 2 starts with a reduced allowance).
Recommendation: Normalize `startDate` to local midnight and use `Math.floor` on `weeksSinceStart` if you want stepwise weekly reduction.

6. [HIGH] Analytics table retention is defined but never executed
Location: `lib/analytics.ts:98-104` and `hooks/useAppInitialize.ts:23-31`
Why it matters: The analytics table will grow without bounds. This can cause storage bloat over long use and undermines the “minimal data” promise.
Recommendation: Call `clearOldAnalytics()` on app launch or on a periodic schedule.

7. [MEDIUM] Daily allowance display rounds to integer, but logic uses decimals
Location: `app/(tabs)/home.tsx:121-129` and `lib/taper-plan.ts:29-31`
Why it matters: Rounding can make the UI feel stricter than the underlying calculations (e.g., 2.4 shown as 2). This can create “over limit” confusion.
Recommendation: Display one decimal to match the model or explicitly floor and adjust progress/limits for consistency.

8. [MEDIUM] iOS min version appears inconsistent across config
Location: `ios/Taper/Info.plist:39-40` and `ios/Taper.xcodeproj/project.pbxproj` (deployment target 15.1)
Why it matters: `LSMinimumSystemVersion` shows 12.0 while the project targets 15.1. This mismatch can cause confusion and must not leak into the final binary metadata.
Recommendation: Ensure the final built `MinimumOSVersion` matches 15.1. Consider removing or updating the legacy `LSMinimumSystemVersion` entry.

9. [LOW] Experimental features enabled for production builds
Location: `app.json:57-60`
Why it matters: `reactCompiler` and the new architecture can be stable, but they carry regression risk around release if not thoroughly validated on device.
Recommendation: Keep only if you have tested a production (App Store) build across multiple devices and iOS versions; otherwise disable for v1.0.

10. [LOW] Notifications settings screen is not linked from Settings
Location: `app/(tabs)/settings/_layout.tsx:8` and `app/(tabs)/settings/index.tsx`
Why it matters: There is a dedicated Notifications screen but no navigation path to it from Settings UI, which can confuse QA and reviewers.
Recommendation: Either add a navigation link or remove the unused screen to reduce surface area.

## Test gaps (iOS/App Store)
1. No automated tests exist for taper plan or progress math. Consider unit tests for `lib/taper-plan.ts` and `lib/progress.ts` to prevent regression.
2. No documented release build smoke tests in repo. At minimum, verify the following in a production/TestFlight build: onboarding flow, notifications scheduling/canceling, start‑over data deletion, and cold‑start navigation.
3. App Store‑specific validation not captured in code: privacy manifest, privacy nutrition labels, and screenshots pipeline. Ensure these are done before submission.

## Open questions / assumptions
1. Do you plan to use Sentry in production? The privacy policy and App Store labels must reflect this if enabled.
2. Are you planning to support only local notifications? If so, you may be able to remove the push entitlement entirely.
3. Have you tested a production build with the new architecture and `reactCompiler` enabled on at least two iPhone sizes?

## Residual risks
I did not run a build or TestFlight install. There may be runtime issues specific to iOS release builds, notification permissions, or App Store privacy tooling that only appear during archive/upload.
