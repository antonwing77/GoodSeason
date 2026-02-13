/**
 * SeasonScope Mobile Design Tokens
 * Mirrors the web design system for consistent branding.
 */

export const colors = {
  primary: {
    50: '#f0f9f4',
    100: '#d9f0e3',
    200: '#b5e1c9',
    300: '#84cba8',
    400: '#52b183',
    500: '#319768',
    600: '#237a53',
    700: '#1d6244',
    800: '#1a4e38',
    900: '#16402f',
  },
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  success: '#22c55e',
  warning: '#f59e0b',
  caution: '#d97706',
  error: '#ef4444',
  background: '#fafaf9',
  surface: '#ffffff',
  text: '#1c1917',
  textSecondary: '#57534e',
  textMuted: '#a8a29e',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
