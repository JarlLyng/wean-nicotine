/**
 * Webpack config to exclude expo-sqlite from web builds
 * This prevents the WASM module error on web
 */

const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Exclude expo-sqlite from web bundle completely
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo-sqlite': false,
  };

  // Also add to externals to prevent bundling
  if (!config.externals) {
    config.externals = [];
  }
  config.externals.push('expo-sqlite');

  // Ignore expo-sqlite in module resolution
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  config.resolve.fallback['expo-sqlite'] = false;

  return config;
};
