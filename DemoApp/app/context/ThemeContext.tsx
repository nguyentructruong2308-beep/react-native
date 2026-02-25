import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// 🎨 Định nghĩa màu sắc cho Light và Dark mode
export const lightTheme = {
  mode: 'light' as const,
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    primary: '#FF7622',
    primaryLight: '#FFF3E0',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    inputBg: '#F5F5F5',
    shadow: '#000000',
    tabBar: '#FFFFFF',
    statusBar: 'dark-content' as const,
  }
};

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    card: '#252525',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB',
    textMuted: '#888888',
    primary: '#FF7622',
    primaryLight: '#3D2A1A',
    border: '#333333',
    divider: '#2A2A2A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    inputBg: '#2A2A2A',
    shadow: '#000000',
    tabBar: '#1A1A1A',
    statusBar: 'light-content' as const,
  }
};

export type Theme = typeof lightTheme | typeof darkTheme;
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(savedMode => {
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
      setIsLoaded(true);
    });
  }, []);

  // Determine actual theme based on mode
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  // Save theme preference
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook để sử dụng theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook shortcut để lấy colors
export const useColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};
