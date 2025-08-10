const { getDefaultConfig } = require('expo/metro-config');

// Load environment variables from .env file
require('dotenv').config();

const config = getDefaultConfig(__dirname);

// Add resolver configuration for socket.io-client
config.resolver.alias = {
  ...config.resolver.alias,
  'url': require.resolve('react-native-url-polyfill'),
};

// Add resolver configuration for problematic modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
