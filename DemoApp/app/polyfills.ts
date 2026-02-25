// app/polyfills.ts
import { Platform } from 'react-native';

// Chỉ chạy trên điện thoại (iOS/Android)
if (Platform.OS !== 'web') {
  // @ts-ignore
  if (typeof window === 'undefined') {
    // @ts-ignore
    global.window = {};
  }
  
  // @ts-ignore
  if (!window.navigator) {
    // @ts-ignore
    window.navigator = {};
  }
  
  // @ts-ignore
  if (!window.navigator.userAgent) {
    // @ts-ignore
    window.navigator.userAgent = "ReactNative";
  }
}