/**
 * Webpack config to exclude expo-sqlite from web builds
 * This prevents the WASM module error on web
 */

const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Exclude expo-sqlite from web bundle
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo-sqlite': false,
  };

  return config;
};
