/**
 * Webpack config to exclude expo-sqlite from web builds
 * This prevents the WASM module error on web
 */

const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Create a stub module for expo-sqlite on web
  const stubPath = path.resolve(__dirname, 'lib/db-web-stub.js');
  
  // Add expo-sqlite to externals so it's never bundled
  if (!config.externals) {
    config.externals = [];
  }
  // Make expo-sqlite an external dependency (won't be bundled)
  config.externals.push(function ({ request }, callback) {
    if (request === 'expo-sqlite' || request?.includes('expo-sqlite')) {
      return callback(null, 'commonjs ' + stubPath);
    }
    callback();
  });

  // Use IgnorePlugin to completely ignore expo-sqlite web worker and WASM files
  config.plugins = config.plugins || [];
  
  // Ignore expo-sqlite package entirely
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^expo-sqlite$/,
    })
  );
  
  // Ignore expo-sqlite web worker and WASM files
  config.plugins.push(
    new webpack.IgnorePlugin({
      checkResource(resource, context) {
        if (!resource || typeof resource !== 'string') return false;
        
        // Ignore expo-sqlite web worker and WASM files
        if (context && context.includes('expo-sqlite')) {
          if (resource.includes('worker') || 
              resource.includes('wa-sqlite') ||
              resource.endsWith('.wasm')) {
            return true;
          }
        }
        
        // Also ignore if resource path includes these
        if (resource.includes('expo-sqlite/web/worker') || 
            resource.includes('wa-sqlite/wa-sqlite.wasm')) {
          return true;
        }
        
        return false;
      },
    })
  );

  // Replace expo-sqlite with stub using alias (highest priority)
  config.resolve.alias = {
    ...config.resolve.alias,
    'expo-sqlite': stubPath,
    'expo-sqlite/web/worker': stubPath,
  };

  // Use NormalModuleReplacementPlugin as fallback
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /expo-sqlite/,
      stubPath
    )
  );

  // Ignore expo-sqlite in module resolution
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  config.resolve.fallback['expo-sqlite'] = false;

  return config;
};
