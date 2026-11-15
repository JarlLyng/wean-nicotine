/**
 * Expo config — single source of truth for app configuration.
 *
 * Consolidated from the previous app.json + app.config.js pair so that
 * expo-doctor passes cleanly and all runtime + build-time config lives in
 * one place.
 *
 * Runtime values:
 * - `extra.sentryDsn` is inlined from EXPO_PUBLIC_SENTRY_DSN at build time
 *   (set via EAS Secret in production) so the app always has the DSN even
 *   when Metro does not inline process.env in the bundle.
 *
 * Build-time plugins:
 * - expo-router, expo-splash-screen, expo-notifications, expo-font
 * - Config plugins the Expo SDK requires (Sentry, expo-image, expo-sqlite,
 *   expo-status-bar, expo-web-browser)
 * - Custom plugin: production push entitlements
 * - The iOS privacy manifest is `ios.privacyManifests`, which Expo writes and
 *   adds to the Xcode project (#444)
 */

module.exports = {
  expo: {
    name: 'Wean Nicotine',
    // Intentionally kept as 'Taper' — Expo's slug is immutable after a
    // project is created (tied to the EAS projectId below). Changing it
    // breaks EAS project linking. Like bundleIdentifier, this is a
    // legacy technical identifier that users never see.
    slug: 'Taper',
    version: '1.7.2',
    orientation: 'portrait',
    icon: './assets/images/ios-light.png',
    scheme: ['wean', 'taper'],
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: false,
      // Intentionally kept as com.iamjarl.taper — Apple locks the bundle
      // identifier after an app is published. Changing it would orphan
      // the App Store listing and break updates for existing users.
      bundleIdentifier: 'com.iamjarl.taper',
      buildNumber: '27',
      icon: {
        light: './assets/images/ios-light.png',
        dark: './assets/images/ios-dark.png',
        tinted: './assets/images/ios-tinted.png',
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      // Expo writes PrivacyInfo.xcprivacy and adds it to the Xcode project, so
      // it ships in the app. The old plugins/withPrivacyManifest.js only wrote
      // the file, which never reached the bundle (#444). Collected data is what
      // Sentry sends, as Sentry's own manifest declares it: not linked (no
      // installation or device ID, see lib/sentry.ts), no tracking. Keep this,
      // the App Store label and docs/PRIVACY_APP_STORE.md saying the same.
      privacyManifests: {
        NSPrivacyTracking: false,
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryFileTimestamp',
            NSPrivacyAccessedAPITypeReasons: ['C617.1', '0A2A.1', '3B52.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryDiskSpace',
            NSPrivacyAccessedAPITypeReasons: ['E174.1', '85F4.1'],
          },
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategorySystemBootTime',
            NSPrivacyAccessedAPITypeReasons: ['35F9.1'],
          },
        ],
        NSPrivacyCollectedDataTypes: [
          'NSPrivacyCollectedDataTypeCrashData',
          'NSPrivacyCollectedDataTypePerformanceData',
          'NSPrivacyCollectedDataTypeOtherDiagnosticData',
        ]
          .map((type) => ({
            NSPrivacyCollectedDataType: type,
            NSPrivacyCollectedDataTypeLinked: false,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: [
              'NSPrivacyCollectedDataTypePurposeAppFunctionality',
            ],
          }))
          .concat({
            // The anonymous feature counts (#448): that a feature was used, never
            // a value from the person's log. Not linked, no tracking.
            NSPrivacyCollectedDataType: 'NSPrivacyCollectedDataTypeProductInteraction',
            NSPrivacyCollectedDataTypeLinked: false,
            NSPrivacyCollectedDataTypeTracking: false,
            NSPrivacyCollectedDataTypePurposes: ['NSPrivacyCollectedDataTypePurposeAnalytics'],
          }),
      },
    },
    android: {
      // Fixed for good at the first upload to Google Play, and public in the
      // store URL. The owner's decision on #435; iOS stays com.iamjarl.taper.
      package: 'com.iamjarl.weannicotine',
      adaptiveIcon: {
        backgroundColor: '#000000',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      versionCode: 17,
      predictiveBackGestureEnabled: false,
      // Permissions the template and libraries bring along that Wean never
      // uses (#435): shared storage (the export is written to the app's own
      // cache), the dev-menu overlay, remote push (reminders are local), the
      // Play install referrer, and ShortcutBadger's launcher badges (Wean sets
      // no badge). What stays: the internet for crash reports and updates,
      // notifications and setting them again after a restart, vibration and
      // wake lock.
      blockedPermissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'com.google.android.c2dm.permission.RECEIVE',
        'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
        'android.permission.READ_APP_BADGE',
        'com.android.launcher.permission.READ_SETTINGS',
        'com.android.launcher.permission.WRITE_SETTINGS',
        'com.android.launcher.permission.INSTALL_SHORTCUT',
        'com.android.launcher.permission.UNINSTALL_SHORTCUT',
        'com.sec.android.provider.badge.permission.READ',
        'com.sec.android.provider.badge.permission.WRITE',
        'com.htc.launcher.permission.READ_SETTINGS',
        'com.htc.launcher.permission.UPDATE_SHORTCUT',
        'com.sonyericsson.home.permission.BROADCAST_BADGE',
        'com.sonymobile.home.permission.PROVIDER_INSERT_BADGE',
        'com.anddoes.launcher.permission.UPDATE_COUNT',
        'com.majeur.launcher.permission.UPDATE_BADGE',
        'com.huawei.android.launcher.permission.CHANGE_BADGE',
        'com.huawei.android.launcher.permission.READ_SETTINGS',
        'com.huawei.android.launcher.permission.WRITE_SETTINGS',
        'com.oppo.launcher.permission.READ_SETTINGS',
        'com.oppo.launcher.permission.WRITE_SETTINGS',
        'me.everything.badger.permission.BADGE_COUNT_READ',
        'me.everything.badger.permission.BADGE_COUNT_WRITE',
      ],
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon-light.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            image: './assets/images/splash-icon-dark.png',
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/ios-light.png',
          color: '#CE63FF',
          sounds: [],
        },
      ],
      'expo-font',
      // Config plugins the Expo SDK requires
      '@sentry/react-native',
      'expo-image',
      'expo-sqlite',
      'expo-status-bar',
      'expo-web-browser',
      // Custom plugin for App Store compliance
      './plugins/withProductionPushEntitlements.js',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '3061ae96-5632-452f-8d9d-97054286aaac',
      },
      // Inlined at build time when EAS sets EXPO_PUBLIC_SENTRY_DSN;
      // guarantees DSN in production build
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
      // Seeds a calm sample month for the site's screenshots (lib/capture-mode.ts, #396).
      // Only the `capture` EAS profile turns it on; a production build never can.
      captureMode: process.env.EAS_BUILD_PROFILE === 'capture',
      // The sample month's currency: kroner for the site, CAPTURE_CURRENCY=USD for the
      // App Store's English set (#409). Read only in capture mode.
      captureCurrency: process.env.CAPTURE_CURRENCY ?? 'DKK',
      // Which EAS profile made the build, for Sentry's environment (#448):
      // only `production` reports as production. A local build is `local`.
      buildProfile: process.env.EAS_BUILD_PROFILE ?? 'local',
      // A local test build can send one test event to check what reaches
      // Sentry (#444, #448): SENTRY_TEST_EVENT=1. EAS builds never set it.
      sentryTestEvent: process.env.SENTRY_TEST_EVENT === '1',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      // Off (#444): each check sends a random per-install ID (EAS-Client-ID) to
      // Expo, and the App Store label says no data is linked to the person.
      // Fixes ship through the stores. The URL stays so the check can come back.
      enabled: false,
      url: 'https://u.expo.dev/3061ae96-5632-452f-8d9d-97054286aaac',
    },
  },
};
