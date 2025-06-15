const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname);

// Add cjs extension support
config.resolver.sourceExts.push('cjs');

// Disable package exports (this might be needed for some auth libraries)
config.resolver.unstable_enablePackageExports = false;

// Export the config with NativeWind integration
module.exports = withNativeWind(config, { input: './app/global.css' });