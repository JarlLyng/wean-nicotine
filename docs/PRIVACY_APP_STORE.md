# Store privacy answers: App Store and Google Play

Purpose:

- Say what each store's privacy answers should be, in one place, so the App Store privacy label,
  Google Play's Data safety form and the privacy policy describe the same app

Audience:

- Maintainers handling App Store Connect and Play Console privacy disclosures
- LLMs assisting with compliance or release tasks

Source of truth:

- Runtime behaviour: [`lib/sentry.ts`](../lib/sentry.ts), `updates` in [`app.config.js`](../app.config.js),
  and the library code paths named below
- The live answers: App Store Connect › App Privacy, and Play Console › Data safety (set by the owner)

Related files:

- [`website/src/pages/privacy.astro`](../website/src/pages/privacy.astro) and its `da`, `no` and `sv` versions
- [`docs/SENTRY.md`](./SENTRY.md)
- [`plugins/withPrivacyManifest.js`](../plugins/withPrivacyManifest.js)

Update when:

- Sentry, `expo-updates` or anything else that talks to a server changes
- The privacy policy wording changes
- Apple's or Google's categories change

Checked on 2026-11-14 (#442) against Expo SDK 58, `@sentry/react-native` 8.33 and `expo-updates` 58,
on both platforms. iOS and Android send the same things.

## What leaves the phone

Everything the person enters stays on the phone, in SQLite: the pouch log and triggers, the plan,
the price, reflection notes, reminder and theme settings. Reminders are local notifications, and no
push token is ever requested. Send Feedback opens the person's own mail app, and Export Data hands
a CSV to the share sheet, so both are sent by the person, not by the app.

Two things go over the network.

### 1. Sentry: crash reports, performance and sessions

Production builds have a DSN, so they send:

- errors and crashes, with stack traces and breadcrumbs (route names; touch and console text is
  scrubbed by `scrubBreadcrumb`);
- device and app context: model, OS version, app version and build, free memory and storage;
- performance traces for 20% of sessions (app start, screen loads);
- the start and end of each session, for crash-free rates;
- **a random installation ID.** When the app hasn't set a user, and Wean never calls `setUser`, the
  React Native SDK's native bridge puts the installation ID in `user.id`, and its `DeviceContext`
  integration copies it onto every JavaScript event. On iOS that's `fetchNativeDeviceContexts` in
  `@sentry/react-native/ios/RNSentry.mm`. On Android it's `InternalSentrySdk.serializeScope`, called
  from `RNSentryModuleImpl.java`. Sessions carry the same ID as their distinct ID (`SentryHub` in
  sentry-cocoa, `AndroidOptionsInitializer` in sentry-android). The ID is a random UUID kept in the
  app's own storage.

Not sent: anything the person enters (`PII_KEYS` and `scrubExtra` in `lib/sentry.ts`, tested in
`lib/__tests__/sentry-scrubber.test.ts`), screenshots or replays. `sendDefaultPii` is off, so the SDK
doesn't attach the IP address. Whether Sentry stores the IP a request arrives from is a project
setting, so see "Owner steps" below.

### 2. The update check: `expo-updates` asking `u.expo.dev`

At launch, `expo-updates` asks `updates.url` in `app.config.js` whether a newer JavaScript bundle exists for this
runtime version. The request carries the platform, runtime version, channel, the IDs of the
running and the embedded update, and **`EAS-Client-ID`**, a random UUID from `expo-eas-client` (kept
in `UserDefaults` on iOS and `SharedPreferences` on Android). If the last launch failed with a
fatal error, `Expo-Fatal-Error` carries its message, cut to 1,024 characters. See `FileDownloader`
in `expo-updates`, under `ios/EXUpdates/AppLoader/` and `android/.../updates/loader/`.

EAS uses the client ID to place a device in an update rollout and to count installs per update, so
treat it as stored, not processed ephemerally. The check is a feature Wean uses: updates were
published to the `production` channel for runtime versions 1.2.0 and 1.3.0.

## The answers, side by side

| Data                                           | App Store privacy label                                                                | Google Play Data safety                                                                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Crash reports (Sentry)                         | Diagnostics › **Crash Data**. Purpose: App Functionality. Used for tracking: No.       | App info and performance › **Crash logs**. Collected, not shared. Purpose: Analytics. Required.                                                           |
| Performance traces and sessions (Sentry)       | Diagnostics › **Performance Data**. Purpose: App Functionality. Used for tracking: No. | App info and performance › **Diagnostics**. Collected, not shared. Purpose: Analytics. Required.                                                          |
| Sentry's installation ID and the EAS client ID | Identifiers › **Device ID**. Purpose: App Functionality. Used for tracking: No.        | **Device or other IDs**. Collected, not shared. Purposes: App functionality (updates) and Analytics (crash reports). Required. Not processed ephemerally. |
| Linked to the person                           | The open decision below.                                                               | Play doesn't ask.                                                                                                                                         |
| Everything the person enters                   | Not collected.                                                                         | Not collected.                                                                                                                                            |

Why these categories:

- **Apple.** Device ID is "the device's advertising identifier, or other device-level ID", and both IDs are
  per installation, not per person or account, so Device ID fits better than User ID. App
  Functionality includes minimising crashes and improving performance. Third-party SDKs count as
  the app's own collection.
- **Google.** Device or other IDs are "identifiers that relate to an individual device, browser or
  app". Data that libraries send off the device counts as collected. Sentry and Expo process the data on
  Wean's behalf, so under the service-provider exemption it isn't "shared". "Required" because the
  app has no switch to turn either off.

Play's other questions:

- **Encrypted in transit?** Yes. Both go over HTTPS.
- **Can people ask for their data to be deleted?** Proposed: No. The reports and IDs can't be traced
  back to a person, and Sentry removes events after the plan's retention period. Everything on the
  phone is deleted with Start Over or by deleting the app.
- **Account creation:** none.

## The open decision: linked or not linked (App Store)

Apple counts data as linked to a person unless direct identifiers, "such as user ID or name", are
stripped before collection. It also counts anything that privacy law treats as personal data as
linked, and under the GDPR a persistent online ID can be personal data. Sentry sends the
installation ID as `user.id`, and the update check sends the EAS client ID. So as the app is built
today:

- **A. Keep the IDs.** Set Crash Data, Performance Data and Device ID to **Linked to you: Yes**, and
  tracking stays No. The listing then shows "Data Linked to You" instead of "Data Not Linked to You". No
  code change. The privacy policy (2026-11-14) describes this build.
- **B. Keep "Not Linked to You".** The app has to stop sending both IDs. Drop `event.user` in
  `beforeSend`. Turn off Sentry's session tracking, since sessions carry the same ID, and that loses
  crash-free rates. Switch off `expo-updates`, which means no more over-the-air fixes. Then take the
  Device ID row out of both stores and the two paragraphs out of the policy.

Before #442 this doc set the label to Diagnostics only, not linked. That matches neither option, so
the label needs changing whichever the owner picks.

## Owner steps

1. **App Store Connect › App Privacy:** add Identifiers › Device ID, and set "linked" to match the
   decision above. Apple's definitions are on
   [App privacy details](https://developer.apple.com/app-store/app-privacy-details/).
2. **Play Console › Data safety:** the answers above, when the app is created there.
3. **Sentry › project settings › Security & Privacy:** confirm that "Prevent Storing of IP Addresses"
   is on. The SDK doesn't send the IP (`sendDefaultPii: false`), but the server setting decides
   whether Sentry stores the address a request comes from.
4. **The iOS privacy manifest:** `plugins/withPrivacyManifest.js` writes an empty
   `NSPrivacyCollectedDataTypes`. Once the decision is made, it should list Crash Data, Performance
   Data and, under option A, Device ID, with the same answers as the label. That's a code change for
   its own issue.

## Worth knowing

On Android, `android:allowBackup` is `true` (Expo's default). Android's own backup can copy the
app's data, including the SQLite log and both IDs, to the person's Google account, as an iCloud
device backup can on iPhone. That's the person's own backup, not something Wean sends. Whether the policy
should mention backups belongs with the wording in #305. If the log should never leave the phone,
set `android.allowBackup: false` in `app.config.js`.
