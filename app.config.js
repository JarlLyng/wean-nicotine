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
 * - SDK 55 required config plugins (Sentry, expo-image, expo-sqlite,
 *   expo-web-browser)
 * - Custom plugins (production push entitlements, privacy manifest)
 */

module.exports = {
  expo: {
    name: 'Wean Nicotine',
    // Intentionally kept as 'Taper' — Expo's slug is immutable after a
    // project is created (tied to the EAS projectId below). Changing it
    // breaks EAS project linking. Like bundleIdentifier, this is a
    // legacy technical identifier that users never see.
    slug: 'Taper',
    version: '1.3.0',
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
      buildNumber: '16',
      icon: {
        light: './assets/images/ios-light.png',
        dark: './assets/images/ios-dark.png',
        tinted: './assets/images/ios-tinted.png',
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#000000',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      versionCode: 14,
      predictiveBackGestureEnabled: false,
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
      // SDK 55 required config plugins
      '@sentry/react-native',
      'expo-image',
      'expo-sqlite',
      'expo-web-browser',
      // Custom plugins for App Store compliance
      './plugins/withProductionPushEntitlements.js',
      './plugins/withPrivacyManifest.js',
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
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/3061ae96-5632-452f-8d9d-97054286aaac',
    },
  },
};
