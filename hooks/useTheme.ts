import { palette, type ThemeColors } from '@/constants/theme';

/** The app uses one light, candy-coloured theme that matches the logo. */
export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  return { colors: palette.light, isDark: false };
}
