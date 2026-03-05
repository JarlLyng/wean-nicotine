/**
 * Theme tokens for Taper app
 * 
 * Now based on IAMJARL Design System (https://jarllyng.github.io/iamjarl-design/)
 * 
 * This file provides backward-compatible exports while using IAMJARL tokens as the source of truth.
 * For new code, prefer using `useDesignTokens()` hook from `@/lib/design` for automatic light/dark mode support.
 * 
 * Design principles:
 * - Follow IAMJARL Design System strictly
 * - Always support light + dark mode
 * - Use design tokens, never hardcode values
 * - Use Phosphor icons with regular weight by default
 */

import { designTokens, getColors } from './design';
import { useColorScheme } from '@/hooks/use-color-scheme';

// IAMJARL spacing tokens (source of truth)
export const spacing = {
  xs: designTokens.spacing.xs,
  sm: designTokens.spacing.sm,
  md: designTokens.spacing.md,
  lg: designTokens.spacing.lg,
  xl: designTokens.spacing.xl,
  xxl: designTokens.spacing.xxl,
  xxxl: designTokens.spacing.xxxl,
} as const;

// IAMJARL typography tokens mapped to React Native format
export const typography = {
  // IAMJARL sizes
  xs: {
    fontSize: designTokens.typography.sizes.xs,
    lineHeight: designTokens.typography.lineHeights.sm,
    fontWeight: `${designTokens.typography.weights.regular}`,
    allowFontScaling: true,
  },
  sm: {
    fontSize: designTokens.typography.sizes.sm,
    lineHeight: designTokens.typography.lineHeights.tight,
    fontWeight: `${designTokens.typography.weights.regular}`,
    allowFontScaling: true,
  },
  base: {
    fontSize: designTokens.typography.sizes.base,
    lineHeight: designTokens.typography.lineHeights.normal,
    fontWeight: `${designTokens.typography.weights.regular}`,
    allowFontScaling: true,
  },
  lg: {
    fontSize: designTokens.typography.sizes.lg,
    lineHeight: designTokens.typography.lineHeights.relaxed,
    fontWeight: `${designTokens.typography.weights.regular}`,
    allowFontScaling: true,
  },
  xl: {
    fontSize: designTokens.typography.sizes.xl,
    lineHeight: designTokens.typography.lineHeights.normal,
    fontWeight: `${designTokens.typography.weights.semibold}`,
    allowFontScaling: true,
  },
  xxl: {
    fontSize: designTokens.typography.sizes.xxl,
    lineHeight: designTokens.typography.lineHeights.xxl,
    fontWeight: `${designTokens.typography.weights.semibold}`,
    allowFontScaling: true,
  },
  // Backward compatibility aliases
  title: {
    fontSize: designTokens.typography.sizes.xxl,
    lineHeight: designTokens.typography.lineHeights.xxl,
    fontWeight: `${designTokens.typography.weights.bold}`,
    allowFontScaling: true,
  },
  body: {
    fontSize: designTokens.typography.sizes.base,
    lineHeight: designTokens.typography.lineHeights.normal,
    fontWeight: `${designTokens.typography.weights.regular}`,
    allowFontScaling: true,
  },
  caption: {
    fontSize: designTokens.typography.sizes.sm,
    lineHeight: designTokens.typography.lineHeights.tight,
    fontWeight: `${designTokens.typography.weights.regular}`,
    allowFontScaling: true,
  },
  '2xl': {
    fontSize: designTokens.typography.sizes.xl, // Kept at xl (24) for backward compat — used in inputs
    lineHeight: designTokens.typography.lineHeights.normal,
    fontWeight: `${designTokens.typography.weights.semibold}`,
    allowFontScaling: true,
  },
  '3xl': {
    fontSize: 28, // Not in IAMJARL, keeping for backward compatibility
    lineHeight: 36,
    fontWeight: `${designTokens.typography.weights.bold}`,
    allowFontScaling: true,
  },
  '4xl': {
    fontSize: designTokens.typography.sizes.xxl,
    lineHeight: designTokens.typography.lineHeights.xxl,
    fontWeight: `${designTokens.typography.weights.bold}`,
    allowFontScaling: true,
  },
} as const;

// IAMJARL font weights
export const fontWeights = {
  regular: `${designTokens.typography.weights.regular}`,
  semibold: `${designTokens.typography.weights.semibold}`,
  bold: `${designTokens.typography.weights.bold}`,
  // Backward compatibility
  medium: '500' as const,
} as const;

/**
 * Colors - WARNING: This is a static export that defaults to light mode.
 * For proper light/dark mode support, use `useDesignTokens()` hook instead.
 * 
 * This export is kept for backward compatibility but will be deprecated.
 * New code should use `useDesignTokens()` from `@/lib/design`.
 */
const lightColors = getColors('light');
export const colors = {
  // IAMJARL primary color (light mode default)
  primary: lightColors.primary,
  
  // IAMJARL text colors (light mode default)
  text: {
    primary: lightColors.text.primary,
    secondary: lightColors.text.secondary,
    tertiary: lightColors.text.tertiary,
    inverse: lightColors.text.inverse,
  },
  
  // IAMJARL border colors (light mode default)
  border: {
    subtle: lightColors.border.subtle,
    default: lightColors.border.default,
  },
  
  // IAMJARL shared semantic colors
  success: designTokens.colors.shared.success,
  warning: designTokens.colors.shared.warning,
  error: designTokens.colors.shared.error,
  
  // Backward compatibility aliases (deprecated - use IAMJARL tokens via useDesignTokens())
  // These are flat strings for compatibility with existing code
  background: lightColors.background.app,
  surface: lightColors.surface.default,
  textPrimary: lightColors.text.primary,
  textSecondary: lightColors.text.secondary,
  
  // IAMJARL background and surface (for new code, prefer useDesignTokens())
  backgroundApp: lightColors.background.app,
  backgroundMuted: lightColors.background.muted,
  backgroundCard: lightColors.background.card,
  surfaceRaised: lightColors.surface.raised,
  
  // Legacy gradient colors - DEPRECATED: Use primary instead
  accentStart: lightColors.primary, // Using IAMJARL primary
  accentMid: lightColors.primary, // Using IAMJARL primary
  accentEnd: lightColors.primary, // Using IAMJARL primary
  
  // Legacy support (deprecated)
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
    primary: lightColors.primary,
    primaryDark: designTokens.colors.modes.dark.primary,
    primaryLight: lightColors.primary,
  },
  semantic: {
    success: {
      main: designTokens.colors.shared.success,
      light: '#d1fae5',
      dark: '#059669',
    },
    warning: {
      main: designTokens.colors.shared.warning,
      light: '#fef3c7',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#dbeafe',
      dark: '#2563eb',
    },
    error: {
      main: designTokens.colors.shared.error,
      light: '#fee2e2',
      dark: '#dc2626',
    },
  },
} as const;

// IAMJARL radius tokens
export const borderRadius = {
  none: 0,
  sm: designTokens.radius.sm,
  md: designTokens.radius.md,
  lg: designTokens.radius.lg,
  // Backward compatibility
  xl: 16, // Same as lg in IAMJARL
  '2xl': 20,
  '3xl': 24,
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
