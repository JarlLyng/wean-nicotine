/**
 * Expo config plugin: set aps-environment to production for App Store builds.
 * Fixes BLOCKER: Push notification entitlement must be production, not development.
 */
const { withEntitlementsPlist } = require('expo/config-plugins');

function withProductionPushEntitlements(config) {
  return withEntitlementsPlist(config, (config) => {
    config.modResults['aps-environment'] = 'production';
    return config;
  });
}

module.exports = withProductionPushEntitlements;
