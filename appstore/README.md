# App Store screenshots

Posters for the App Store listing, built to the portfolio standard in the private hub
(`DESIGN.md`, "App Store screenshots", implemented by `tools/appstore_screenshots.py`). Capture
happens here, composition happens there, so every IAMJARL app shares one look. The captions and
why each shot is there are in [`docs/APP_STORE_SCREENSHOT_CAPTIONS.md`](../docs/APP_STORE_SCREENSHOT_CAPTIONS.md).

## Layout

- `raw/`: unretouched simulator captures from the capture build, `<screen>.png`, 1320 × 2868
- `manifest.json`: what gets composed, in upload order, with the caption for each shot
- `1.7.1/`: the composed posters, `iphone-6.9-<n>.png`, 1320 × 2868, English

Superseded sets are deleted rather than kept. Git history has them.

## Wean's settings

| Setting  | Value                                                    | Why                                                                               |
| -------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Slot     | `iphone-6.9`                                             | Apple scales the 6.9" set down to every smaller iPhone, so one set covers them    |
| Mode     | `light`                                                  | Wean is light only: a calm app, a calm poster                                     |
| Ground   | `#E6ECEF`                                                | Wean's misty grey-blue, from its identity in `iamjarl-design`                     |
| Accent   | `#F140FE`                                                | Wean's magenta, for strokes and fills with black on it                            |
| Emphasis | a chip, `[phrase]`                                       | `*phrase*` would set magenta text on a light ground. At most one per poster       |
| Shapes   | off                                                      | Magenta blurs would tint the grey-blue toward pink. The plain ground reads calmer |
| Layout   | captions alternate top and bottom, bleed on the top ones | The hub's rhythm for a set, so six posters don't read as one template             |

The screens inside the posters are light too, to match.

## Remaking the set

### 1. A capture build, on a simulator of its own

The capture build replaces its database with a calm sample month on every launch
(`lib/capture-mode.ts`), so every number on screen is one the app computed. Never install it on a
device that holds a real plan. `CAPTURE_CURRENCY=USD` prices the sample can in dollars, since the
English set is the one every storefront falls back to. Without it the sample month is in kroner,
as on the site.

A local build needs no EAS build quota. `/ios` is generated and ignored by git:

```bash
export EAS_BUILD_PROFILE=capture CAPTURE_CURRENCY=USD SENTRY_DISABLE_AUTO_UPLOAD=true LANG=en_US.UTF-8
npx expo prebuild --platform ios --no-install
pod install --project-directory=ios
xcodebuild -workspace ios/WeanNicotine.xcworkspace -scheme WeanNicotine -configuration Release \
  -sdk iphonesimulator -destination 'id=<UDID>' -derivedDataPath build/capture \
  CODE_SIGNING_ALLOWED=NO IPHONEOS_DEPLOYMENT_TARGET=18.0 ONLY_ACTIVE_ARCH=YES build
```

Two things about Xcode 27, neither of which touches the App Store build (EAS builds that with its
own Xcode):

- `IPHONEOS_DEPLOYMENT_TARGET=18.0` is for this simulator build only. At the app's own 15.1, three
  pods are older than Xcode 27 accepts and expo-router uses an API the iOS 27 SDK marks as iOS 16.
- **Run it on an iOS 26.5 simulator, not iOS 27.** An app built with the iOS 27 SDK has to adopt the
  UIScene lifecycle, and on an iOS 27 simulator this build stops at launch without it.

Delete `ios/` and `build/` afterwards, so the next normal build starts clean.

The simulator is an iPhone 17 Pro Max (6.9", 1320 × 2868), in English with a 12-hour clock:

```bash
xcrun simctl create "Wean Posters" com.apple.CoreSimulator.SimDeviceType.iPhone-17-Pro-Max com.apple.CoreSimulator.SimRuntime.iOS-26-5
xcrun simctl boot <UDID>
xcrun simctl spawn <UDID> defaults write -g AppleLocale -string en_US
xcrun simctl spawn <UDID> defaults write -g AppleLanguages -array en
xcrun simctl shutdown <UDID> && xcrun simctl boot <UDID>
xcrun simctl ui <UDID> appearance light
xcrun simctl status_bar <UDID> override --time 9:41 --batteryState discharging --batteryLevel 100 --cellularBars 4 --wifiBars 3 --operatorName ""
xcrun simctl install <UDID> build/capture/Build/Products/Release-iphonesimulator/WeanNicotine.app
```

The status bar override does not survive a reboot, so set it last.

### 2. The captures

The app starts dark, and its Light Mode switch is stored with the plan, which the seed replaces on
every launch. So after each launch, turn Light Mode on in Settings, then take every capture in that
same session without relaunching.

In order, each in the same session after Light Mode is on:

| Raw            | How to get there                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `today.png`    | Today, before any tap: 2 of 6                                                                         |
| `progress.png` | Progress, then **Last Week** (a whole week, whatever day it is; This Week holds only the days so far) |
| `settings.png` | Settings, scrolled to the top: the reminder, Light Mode, Your Plan and Export                         |
| `patterns.png` | Progress, scrolled until the Patterns card sits under the title, with Milestones below it             |
| `tools.png`    | Tools                                                                                                 |
| `export.png`   | Settings, then Export: the share sheet with the CSV file. Close it afterwards without sending         |

Wait for any system banner to go before a capture (a new simulator shows one for Apple
Intelligence), and check each raw for one afterwards. Every simulator capture also has a 3 × 3
black dot in its top-left pixel; the poster's rounded screen corners cover it, so the raws are
left as they are.

```bash
xcrun simctl io <UDID> screenshot appstore/raw/<screen>.png
```

### 3. The posters

From the repo root, with the hub cloned alongside (`../iamjarl-strategy`):

```bash
../iamjarl-strategy/.venv/bin/python ../iamjarl-strategy/tools/appstore_screenshots.py batch appstore/manifest.json
```

Then check the result before uploading: the captions against the hub's `VOICE.md`, no warnings
from the tool, and no `kr.` anywhere in the English set.

## Uploading

Through the Asset Library in App Store Connect, on its own or with a release, on the owner's
choice. The 6.5" set comes off in the same step, so no size keeps the old screenshots. Log the
date of a standalone change here, since it won't show up as a release date.

## Recapture when the app's copy changes

The raws are screenshots of real screens, so they carry the app's copy at the moment they were
taken. Any release that changes a string or a screen shown on a poster should retake that raw.
