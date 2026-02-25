module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Đây là dòng quan trọng bắt buộc phải có để chạy hiệu ứng mượt
      'react-native-reanimated/plugin', 
    ],
  };
};