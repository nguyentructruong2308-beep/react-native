// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 1. Hỗ trợ file .mjs
config.resolver.sourceExts.push('mjs');

// 2. Can thiệp vào quá trình giải quyết module (Resolver)
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Nếu bất kỳ thư viện nào gọi 'tslib'
  if (moduleName === 'tslib') {
    return {
      // Ép buộc trả về file tslib.js gốc (CommonJS) nằm ở root
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.js'),
      type: 'sourceFile',
    };
  }
  // Các module khác xử lý bình thường
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;