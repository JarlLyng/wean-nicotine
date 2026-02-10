/**
 * Expo config: extends app.json with config plugins for App Store compliance.
 * - Production push entitlement (aps-environment)
 * - Privacy manifest (PrivacyInfo.xcprivacy)
 */
const base = require('./app.json');

module.exports = {
  ...base,
  expo: {
    ...base.expo,
    plugins: [
      ...base.expo.plugins,
      './plugins/withProductionPushEntitlements.js',
      './plugins/withPrivacyManifest.js',
    ],
  },
};
