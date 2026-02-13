import { useColorScheme } from 'react-native';
import { useMemo } from 'react';

const lightColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F8FA',
  primary: '#1B6B4A',
  primaryLight: '#E8F5EE',
  primaryDark: '#145237',
  accent: '#D4A853',
  accentLight: '#FFF8E7',
  danger: '#E54545',
  dangerLight: '#FFF0F0',
  warning: '#F5A623',
  warningLight: '#FFF7E6',
  success: '#34C759',
  successLight: '#E8FAF0',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  textTertiary: '#AEAEB2',
  border: '#E5E5EA',
  borderLight: '#F0F0F5',
  shadow: '#000000',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E5E5EA',
  tabBarInactive: '#8E8E93',
  statusBar: 'dark',
  overlay: 'rgba(0,0,0,0.4)',
  chartLine: '#1B6B4A',
  chartFill: 'rgba(27,107,74,0.1)',
  gradientStart: '#1B6B4A',
  gradientEnd: '#2A9D6E',
};

const darkColors = {
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  primary: '#34C759',
  primaryLight: '#1A3A2A',
  primaryDark: '#30B350',
  accent: '#FFD60A',
  accentLight: '#3A3520',
  danger: '#FF453A',
  dangerLight: '#3A1A1A',
  warning: '#FF9F0A',
  warningLight: '#3A2E1A',
  success: '#30D158',
  successLight: '#1A3A2A',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  border: '#38383A',
  borderLight: '#2C2C2E',
  shadow: '#000000',
  card: '#1C1C1E',
  tabBar: '#1C1C1E',
  tabBarBorder: '#38383A',
  tabBarInactive: '#636366',
  statusBar: 'light',
  overlay: 'rgba(0,0,0,0.6)',
  chartLine: '#34C759',
  chartFill: 'rgba(52,199,89,0.15)',
  gradientStart: '#1B6B4A',
  gradientEnd: '#34C759',
};

export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  return { colors, isDark };
}

export { lightColors, darkColors };
