/**
 * Expo config: extends app.json with config plugins for App Store compliance.
 * - Production push entitlement (aps-environment)
 * - Privacy manifest (PrivacyInfo.xcprivacy)
 *
 * Sentry DSN is read from EXPO_PUBLIC_SENTRY_DSN at build time (EAS Secret) and
 * embedded in extra so the app always has it at runtime, also when Metro doesn't
 * inline process.env in the bundle.
 */
const base = require('./app.json');

module.exports = {
  ...base,
  expo: {
    ...base.expo,
    extra: {
      ...base.expo?.extra,
      // Inlined at build time when EAS sets EXPO_PUBLIC_SENTRY_DSN; guarantees DSN in production build
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
    },
    plugins: [
      ...base.expo.plugins,
      './plugins/withProductionPushEntitlements.js',
      './plugins/withPrivacyManifest.js',
    ],
  },
};
