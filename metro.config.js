// Learn more https://docs.expo.dev/guides/customizing-metro

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolve expo-sqlite to stub on web to prevent WASM errors
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, replace expo-sqlite with stub
  if (platform === 'web' && moduleName === 'expo-sqlite') {
    return {
      type: 'sourceFile',
      filePath: require.resolve('./lib/db-web-stub.js'),
    };
  }
  
  // Use default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
