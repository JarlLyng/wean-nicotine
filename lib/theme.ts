/**
 * Theme tokens for Taper app
 * Provides spacing, typography, colors, shadows, borders, and animations
 * 
 * Design principles:
 * - Calm and supportive (not clinical)
 * - Clear visual hierarchy
 * - Accessible contrast ratios
 * 
 * Gradient usage:
 * - Use gradients sparingly in header areas only (not entire screens)
 * - Primary gradient: accentStart → accentMid → accentEnd (vertical)
 * - Subtle gradient: low-contrast fade for gentle backgrounds
 * - Keep content areas on flat surfaces (white/neutral) for readability
 * 
 * Surface usage:
 * - Use flat white surfaces for cards and content areas
 * - Deep calm background (#0F172A) only for gradient headers
 * - Maintain high contrast between text and backgrounds
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    allowFontScaling: true,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    allowFontScaling: true,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    allowFontScaling: true,
  },
  // Keep existing scale for backward compatibility
  xs: {
    fontSize: 12,
    lineHeight: 16,
    allowFontScaling: true,
  },
  sm: {
    fontSize: 14,
    lineHeight: 20,
    allowFontScaling: true,
  },
  base: {
    fontSize: 16,
    lineHeight: 24,
    allowFontScaling: true,
  },
  lg: {
    fontSize: 18,
    lineHeight: 28,
    allowFontScaling: true,
  },
  xl: {
    fontSize: 20,
    lineHeight: 30,
    allowFontScaling: true,
  },
  '2xl': {
    fontSize: 24,
    lineHeight: 32,
    allowFontScaling: true,
  },
  '3xl': {
    fontSize: 30,
    lineHeight: 36,
    allowFontScaling: true,
  },
  '4xl': {
    fontSize: 36,
    lineHeight: 44,
    allowFontScaling: true,
  },
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const colors = {
  // Core color tokens for gradient-based design
  background: '#0F172A', // Deep calm background
  surface: '#FFFFFF', // White surface for content
  textPrimary: '#0F172A', // Primary text color
  textSecondary: '#475569', // Secondary text color
  
  // Gradient accent colors (teal → green → mint)
  accentStart: '#0EA5A4', // Teal
  accentMid: '#34D399', // Green
  accentEnd: '#6EE7B7', // Mint
  
  // Legacy support (keep for backward compatibility)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  accent: {
    primary: '#0EA5A4',
    primaryDark: '#0F172A',
    primaryLight: '#6EE7B7',
  },
  semantic: {
    success: {
      main: '#10b981',
      light: '#d1fae5',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#dbeafe',
      dark: '#2563eb',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
      dark: '#dc2626',
    },
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// iOS-style shadows (subtle elevation)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Android
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation timings (calm, not rushed)
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
} as const;

// Easing curves (smooth, natural)
export const easing = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
