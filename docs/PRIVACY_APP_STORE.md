# Store privacy answers: App Store and Google Play

Purpose:

- Say what each store's privacy answers should be, in one place, so the App Store privacy label,
  Google Play's Data safety form, the iOS privacy manifest and the privacy policy describe the same app

Audience:

- Maintainers handling App Store Connect and Play Console privacy disclosures
- LLMs assisting with compliance or release tasks

Source of truth:

- Runtime behaviour: [`lib/sentry.ts`](../lib/sentry.ts) and `updates` and `ios.privacyManifests` in
  [`app.config.js`](../app.config.js)
- The live answers: App Store Connect › App Privacy, and Play Console › Data safety (set by the owner)

Related files:

- [`website/src/pages/privacy.astro`](../website/src/pages/privacy.astro) and its `da`, `no` and `sv` versions
- [`docs/SENTRY.md`](./SENTRY.md)

Update when:

- Sentry or anything else that talks to a server changes, or a feature count is added
- The privacy policy wording changes
- Apple's or Google's categories change

This describes the first release with #444 and #448: no identifiers, and two anonymous feature
counts. The portfolio's rules (the hub's `PROJECT_STANDARDS.md`, "Privacy-first") are that no
identifier leaves the device, nothing is stored on the device just to measure, only counts,
durations and coarse facts are sent, nothing watches, and the policy, the manifest and the label
name every kind of data, not linked and not used for tracking.

## What leaves the phone

Everything the person enters stays on the phone, in SQLite: the pouch log and triggers, the plan,
the price, reflection notes, reminder and theme settings. Reminders are local notifications, and no
push token is ever requested. Send Feedback opens the person's own mail app, and Export Data hands
a CSV to the share sheet, so both are sent by the person, not by the app. The app doesn't check for
updates (`updates.enabled: false`), so it never calls `u.expo.dev`.

Only Sentry receives anything, and only from builds with a DSN:

- errors and crashes, with stack traces and breadcrumbs (route names; touch and console text is
  scrubbed by `scrubBreadcrumb`);
- device and app context: model, OS version, app version and build, free memory and storage;
- performance traces for 20% of screen loads and app starts;
- **two anonymous feature counts** (`countFeatureUse`): `log_entry_saved`, with `kind` set to
  `pouch_used` or `craving_resisted`, and `edit_plan_opened`. Each carries the app version,
  environment and SDK, and the time it happened. `beforeSendMetric` (`filterMetric`) drops any other
  metric, any other attribute, and the user.

What doesn't leave the phone:

- **No installation or device ID.** Every event carries the same user, `{ id: 'anonymous' }`
  (`initialScope`, and `setUser` in `onReady` for the native scope). `anonymizeEvent` drops
  `contexts.device.id` (Android) and `contexts.app.device_app_hash` (iOS) from JavaScript events.
  For events made natively (a native crash, an ANR), a Sentry Advanced Data Scrubbing rule removes
  the same two fields on arrival, before anything is stored.
- **No sessions** (`enableAutoSessionTracking: false`), since a session carries the installation ID.
- **No IP address** in a report (`sendDefaultPii: false`). Sentry's "Prevent Storing of IP Addresses"
  decides what it stores from the request itself.
- Nothing the person enters (`PII_KEYS` and `scrubExtra`), and no screenshots, replays or view
  hierarchy.

Environments: `production` only for a `production` EAS build on a real phone, `simulator` for the
iOS Simulator or an Android emulator, `internal` for preview, capture and local builds, and
`development` for dev builds. TestFlight and Play's internal track install the store binary, so
they report as `production`.

## The answers, side by side

| Data                         | App Store privacy label                                                              | Google Play Data safety                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Crash reports                | Diagnostics › **Crash Data**. App Functionality. Not linked. No tracking.            | App info and performance › **Crash logs**. Collected, not shared. Analytics. Required.  |
| Performance traces           | Diagnostics › **Performance Data**. App Functionality. Not linked. No tracking.      | App info and performance › **Diagnostics**. Collected, not shared. Analytics. Required. |
| Device and app context       | Diagnostics › **Other Diagnostic Data**. App Functionality. Not linked. No tracking. | Part of Diagnostics above.                                                              |
| Feature counts               | Usage Data › **Product Interaction**. Analytics. Not linked. No tracking.            | App activity › **App interactions**. Collected, not shared. Analytics. Required.        |
| IDs                          | None.                                                                                | None.                                                                                   |
| Everything the person enters | Not collected.                                                                       | Not collected.                                                                          |

Why these categories:

- **Apple.** Data is linked unless identifiers are stripped before collection. No identifier is
  sent or stored, so nothing is linked. Product Interaction is "such as app launches, taps, clicks,
  scrolling information". App Functionality covers crash and performance data. Third-party SDKs
  count as the app's own collection. `ios.privacyManifests` declares the same four types, the same
  way, and Sentry's own manifest declares the three diagnostics types, so Xcode's privacy report
  agrees.
- **Google.** Data that libraries send off the device counts as collected. Sentry processes it on
  Wean's behalf, so under the service-provider exemption it isn't "shared". "Required" because the
  app has no switch to turn it off. Check "App interactions" against Google's help on the day.

Play's other questions:

- **Encrypted in transit?** Yes, over HTTPS.
- **Can people ask for their data to be deleted?** No. Nothing sent can be traced back to a person,
  and Sentry removes events after the plan's retention period. Everything on the phone is deleted
  with Start Over or by deleting the app.
- **Account creation:** none.

## Owner steps on release day

1. **App Store Connect › App Privacy:** Diagnostics (Crash Data, Performance Data, Other Diagnostic
   Data) and Usage Data (Product Interaction), all not linked and not used for tracking, and no
   Identifiers. Apple's definitions are on
   [App privacy details](https://developer.apple.com/app-store/app-privacy-details/).
2. **Play Console › Data safety:** the answers above, before the first Play release.
3. **Sentry, once:** the Advanced Data Scrubbing rule for `contexts.device.id` and
   `contexts.app.device_app_hash`, and "Prevent Storing of IP Addresses" on.

## History

1.7.2 and earlier sent Sentry's installation ID (as `user.id`, the session's distinct ID and, on
Android, `contexts.device.id`), the iOS `device_app_hash`, and an `EAS-Client-ID` on every update
check to `u.expo.dev`. The app's own iOS privacy manifest was written by a plugin that never added
it to the Xcode project, so it didn't ship. #442, #444 and #448 changed all of this.

## Worth knowing

On Android, `android:allowBackup` is `true` (Expo's default). Android's own backup can copy the
app's data, including the SQLite log, to the person's Google account, as an iCloud device backup
can on iPhone. That's the person's own backup, not something Wean sends. Whether the policy should
mention backups belongs with the wording in #305. If the log should never leave the phone, set
`android.allowBackup: false` in `app.config.js`.
