/**
 * SeasonScope Design System – Design Tokens
 *
 * Typography Scale (rem, base 16px):
 *   xs:   0.75rem (12px)
 *   sm:   0.875rem (14px)
 *   base: 1rem (16px)
 *   lg:   1.125rem (18px)
 *   xl:   1.25rem (20px)
 *   2xl:  1.5rem (24px)
 *   3xl:  1.875rem (30px)
 *   4xl:  2.25rem (36px)
 *   5xl:  3rem (48px)
 *
 * Spacing Scale (rem):
 *   0:   0
 *   0.5: 0.125rem
 *   1:   0.25rem
 *   2:   0.5rem
 *   3:   0.75rem
 *   4:   1rem
 *   5:   1.25rem
 *   6:   1.5rem
 *   8:   2rem
 *   10:  2.5rem
 *   12:  3rem
 *   16:  4rem
 *   20:  5rem
 *   24:  6rem
 *
 * Border Radius:
 *   sm:   0.375rem
 *   md:   0.5rem
 *   lg:   0.75rem
 *   xl:   1rem
 *   2xl:  1.5rem
 *   full: 9999px
 */

export const colors = {
  // Primary – Deep green, nature-inspired
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
    950: '#0b241a',
  },
  // Neutral – Warm gray
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
    950: '#0c0a09',
  },
  // Accent – Earth tones
  earth: {
    sand: '#e8dcc8',
    terracotta: '#c4724e',
    sage: '#9cad8e',
    clay: '#b07d62',
    moss: '#6b7f5e',
  },
  // Semantic
  success: '#22c55e',
  warning: '#f59e0b',
  caution: '#d97706', // Used for water-risk (calm, not alarmist)
  error: '#ef4444',
  info: '#3b82f6',

  // Backgrounds
  background: '#fafaf9',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',

  // Text
  textPrimary: '#1c1917',
  textSecondary: '#57534e',
  textMuted: '#a8a29e',
  textInverse: '#fafaf9',
} as const;

export const typography = {
  fontFamily: {
    sans: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const spacing = {
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
} as const;

export type BadgeVariant =
  | 'in_season'
  | 'off_season'
  | 'co2e_low'
  | 'co2e_medium'
  | 'co2e_high'
  | 'quality_high'
  | 'quality_medium'
  | 'quality_low'
  | 'water_risk_low'
  | 'water_risk_medium'
  | 'water_risk_high'
  | 'greenhouse';

export const badgeStyles: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  in_season:         { bg: '#f0f9f4', text: '#237a53', border: '#b5e1c9' },
  off_season:        { bg: '#f5f5f4', text: '#78716c', border: '#d6d3d1' },
  co2e_low:          { bg: '#f0f9f4', text: '#237a53', border: '#b5e1c9' },
  co2e_medium:       { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  co2e_high:         { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  quality_high:      { bg: '#f0f9f4', text: '#237a53', border: '#b5e1c9' },
  quality_medium:    { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  quality_low:       { bg: '#f5f5f4', text: '#78716c', border: '#d6d3d1' },
  water_risk_low:    { bg: '#f0f9f4', text: '#237a53', border: '#b5e1c9' },
  water_risk_medium: { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  water_risk_high:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  greenhouse:        { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
};

/**
 * Button Variants:
 *
 * primary:    Deep green bg, white text. Main CTAs.
 * secondary:  Outlined, green border/text. Secondary actions.
 * ghost:      No bg, subtle hover. Tertiary/inline.
 * danger:     Red for destructive actions (rare in this app).
 *
 * Sizes: sm (h-8, text-sm), md (h-10, text-base), lg (h-12, text-lg)
 */
export const buttonVariants = {
  primary: {
    base: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
    disabled: 'bg-neutral-200 text-neutral-400 cursor-not-allowed',
  },
  secondary: {
    base: 'border border-primary-300 text-primary-700 hover:bg-primary-50 active:bg-primary-100',
    disabled: 'border-neutral-200 text-neutral-400 cursor-not-allowed',
  },
  ghost: {
    base: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
    disabled: 'text-neutral-400 cursor-not-allowed',
  },
} as const;
