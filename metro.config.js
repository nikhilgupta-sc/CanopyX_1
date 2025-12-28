const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// MANDATORY FOR RN 0.79 + NODE 22
// Disabling this prevents Metro from trying to resolve the "exports" field
// which is what triggers Node to look for the .types files.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;