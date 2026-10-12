# Site captures: the Today loop and the tour screens

Purpose:

- Explain how the home page's Today loop and tour screens are recorded from the app

Audience:

- Maintainers redoing the captures after the app's screens change
- LLMs asked to update the site's app imagery

Source of truth:

- The sample month in [`lib/capture-mode.ts`](../lib/capture-mode.ts) and the `capture` profile in [`eas.json`](../eas.json)

Related files:

- [`scripts/encode-loop.swift`](../scripts/encode-loop.swift)
- [`app.config.js`](../app.config.js) (`extra.captureMode`)

Update when:

- The capture profile, the sample month or the encoding steps change

---

How the home page's loop (`website/public/site/today-loop.mp4` and its poster) and tour screens
(`website/src/assets/site/tour-*.jpg`) are made (#396). Every number in them is one the app
computed from the capture-mode sample month, not one drawn by hand (#338).

## 1. A capture build

```bash
eas build --profile capture --platform ios
```

The `capture` profile builds for the simulator and sets `extra.captureMode`, which makes the app
replace its database with a calm sample month on every launch (`lib/capture-mode.ts`): a 10-a-day
plan at 10% a week, four weeks in, every day under its allowance, today at 2 of 6. Sentry and the
review prompt stay off. Never install a capture build on a phone that holds a real plan.

Download the simulator build from the EAS build page, unpack it and install the `.app`.

## 2. A simulator for captures

Use a separate simulator, so the seed never lands on one you use for testing. English, a
12-hour clock and the usual 9:41 status bar:

```bash
xcrun simctl create "Wean Capture" "iPhone 16e"
xcrun simctl spawn <UDID> defaults write -g AppleLocale -string en_US
xcrun simctl spawn <UDID> defaults write -g AppleLanguages -array en
xcrun simctl status_bar <UDID> override --time 9:41 --batteryState discharging --batteryLevel 100 --cellularBars 4 --wifiBars 3 --operatorName ""
```

Reboot the simulator after the locale change. The status bar override does not survive a reboot,
so set it last.

## 3. The Today loop

Launch the app (each launch reseeds), start recording, tap Used a pouch once, wait about six
seconds and stop with Ctrl-C:

```bash
xcrun simctl io <UDID> recordVideo --codec h264 --force today-raw.mov
```

The simulator only writes a frame when the screen changes, so the recording is one still frame up
to the tap. Start the loop half a second before the tap and encode it with
`scripts/encode-loop.swift`, which needs nothing beyond macOS:

```bash
swift scripts/encode-loop.swift today-raw.mov website/public/site/today-loop.mp4 602 400 <tap - 0.5> 5.85 website/public/site/today-loop-poster.jpg <tap - 0.5>
```

That gives a silent H.264 loop at 602 px wide of about 300 KB: 2 of 6, the tap, 3 of 6 with the
undo toast and the optional trigger chips. The poster is the frame before the tap.

## 4. The tour screens

```bash
xcrun simctl io <UDID> screenshot tour-today.png
```

Take Today straight after a fresh launch, Progress with **Last Week** selected (a whole week,
whatever day it is; This Week holds only the days so far), and Tools. Then scale them to the
loop's width:

```bash
sips -s format jpeg -s formatOptions 82 --resampleWidth 602 tour-today.png --out website/src/assets/site/tour-today.jpg
```

The app is not localized yet (#315), so the captures are English on every locale's page.
