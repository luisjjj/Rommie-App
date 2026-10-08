module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Canonical for Reanimated 4.x on SDK 57 (react-native-reanimated/plugin is a deprecated shim of this).
    plugins: ['react-native-worklets/plugin'],
  };
};
