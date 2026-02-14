/**
 * Expo config plugin: set aps-environment per build (Debug = development, Release = production).
 * EAS Build sets EXPO_CONFIGURATION; default production so App Store builds are safe.
 */
const { withEntitlementsPlist } = require('expo/config-plugins');

function withProductionPushEntitlements(config) {
  return withEntitlementsPlist(config, (config) => {
    const configuration = process.env.EXPO_CONFIGURATION || 'Release';
    config.modResults['aps-environment'] =
      configuration === 'Debug' ? 'development' : 'production';
    return config;
  });
}

module.exports = withProductionPushEntitlements;
