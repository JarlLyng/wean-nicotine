# Development: versions, builds and store facts

Purpose:

- Collect what a maintainer or an assistant needs beyond the README's "Build and run": versions,
  release details, the Android build, and where the website's store facts come from

Audience:

- Maintainers shipping a build
- LLMs asked to bump a version, build, or touch the store button

Source of truth:

- [`app.config.js`](../app.config.js) for versions and identifiers, [`eas.json`](../eas.json) for build profiles

Related files:

- [`../README.md`](../README.md) ("Build and run"): setup and the iOS release steps
- [`.github/workflows/release.yml`](../.github/workflows/release.yml): the GitHub Release from a tag
- [`SENTRY.md`](./SENTRY.md) and [`PRIVACY_APP_STORE.md`](./PRIVACY_APP_STORE.md): telemetry

Update when:

- The release steps, the build profiles or the store-fact sync change

## Versions

`app.config.js` is the source of truth (`appVersionSource: local` in `eas.json`):

- `version` is the marketing version, shared by iOS and Android.
- `ios.buildNumber` rises with every build sent to App Store Connect.
- `android.versionCode` rises with every bundle uploaded to Google Play. Play never takes the same
  code twice, so a rebuilt bundle needs a new one.
- The iOS bundle ID stays `com.iamjarl.taper` and the Expo slug stays `Taper`, because both are
  locked. The Android package `com.iamjarl.weannicotine` is fixed for good too.

## iOS release details

The steps are in the README. Beyond them:

- A finished EAS build can be uploaded later with `eas submit --platform ios --id <build id>`.
- On Expo's free plan the submission can sit queued for a while after the build finishes, so a
  build that isn't in App Store Connect right away hasn't failed.
- Tag after the upload. The Release workflow fails if `CHANGELOG.md` has no section for the version.

## Android build

- `eas build --platform android --profile production` makes the app bundle for Google Play. Raise
  `android.versionCode` first.
- The `capture` profile makes the builds for screenshots, with a sample month seeded
  (`lib/capture-mode.ts`). A production build never has it.

## Store facts on the website

The store button, the facts line (price, OS floor), the campaign link and the JSON-LD `Offer` come
from the design system's registry: fragments in `website/src/store/`, rendered by
`StoreButton.astro`. `node website/scripts/sync-design.mjs vX.Y.Z` refreshes them, along with the
design system's kit, Wean's identity and the waterline for the tidal-flats photo, all served from
the site itself. Never hand-write a price or a store link next to a call to action.

The live price and version for a storefront:
`curl -s 'https://itunes.apple.com/lookup?id=6758867485&country=us'` (swap the country).

## Telemetry

Sentry only, with no identifier: one shared user (`anonymous`), no installation or device ID, no
sessions, no update check. It sends crash reports, performance traces and two anonymous feature
counts (`countFeatureUse`: a log entry saved, Edit plan opened), never a value from the log. The
privacy policy, `ios.privacyManifests` and the store labels name all of it as not linked.
