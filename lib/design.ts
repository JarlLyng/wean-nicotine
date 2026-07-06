/**
 * IAMJARL Design System Tokens for React Native
 *
 * Source of truth: https://jarllyng.github.io/iamjarl-design/
 *
 * This file maps the IAMJARL design tokens to React Native-compatible format
 * with full light/dark mode support.
 *
 * Rules:
 * - Do NOT invent new colors, spacing, radius or typography values
 * - Always support light + dark mode using the tokens
 * - Use Phosphor icons and follow the icon rules in design.md
 */

import { useColorScheme } from '@/hooks/use-color-scheme';

// IAMJARL Design Tokens (from tokens.json)
// Version: v0.2.0 (source of truth: https://jarllyng.github.io/iamjarl-design/tokens.json)
// Updated: 2026-04-20
export const designTokens = {
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 24,
      xxl: 36,
    },
    // IAMJARL line-height pairings: every size has a matching line height
    // (xs 12/16, sm 14/20, base 16/24, lg 18/28, xl 24/32, xxl 36/44).
    // Legacy aliases (tight/normal/relaxed) are kept for backward compat with
    // existing call sites and map to the closest IAMJARL pair; new code should
    // use the IAMJARL-keyed names matching the font size.
    lineHeights: {
      xs: 16,
      sm: 20,
      base: 24,
      lg: 28,
      xl: 32,
      xxl: 44,
      // legacy aliases — do not use in new code
      tight: 20,
      normal: 24,
      relaxed: 28,
    },
    weights: {
      regular: 400,
      semibold: 600,
      bold: 700,
    },
    family: {
      ui: 'system-ui',
      mono: 'ui-monospace',
    },
  },
  colors: {
    static: {
      black: '#000000',
      white: '#FFFFFF',
      // Fixed dark snackbar surface (iOS pattern) — same in light and dark
      // mode so Toast contrast is guaranteed regardless of theme.
      toastSurface: '#1C1C1E',
    },
    shared: {
      success: '#4CAF50',
      onSuccess: '#000000',
      warning: '#FF6B35',
      onWarning: '#000000',
      error: '#FF3B30',
      onError: '#FFFFFF',
    },
    modes: {
      light: {
        primary: '#A435D2',
        onPrimary: '#FFFFFF',
        text: {
          primary: '#000000',
          secondary: 'rgba(0, 0, 0, 0.70)',
          tertiary: 'rgba(0, 0, 0, 0.55)',
          inverse: '#FFFFFF',
        },
        background: {
          app: '#FFFFFF',
          muted: 'rgba(0, 0, 0, 0.04)',
          card: 'rgba(0, 0, 0, 0.04)',
        },
        surface: {
          default: '#FFFFFF',
          raised: 'rgba(0, 0, 0, 0.02)',
        },
        border: {
          subtle: 'rgba(0, 0, 0, 0.10)',
          default: 'rgba(0, 0, 0, 0.16)',
        },
      },
      dark: {
        primary: '#D0FF00',
        onPrimary: '#000000',
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.75)',
          tertiary: 'rgba(255, 255, 255, 0.60)',
          inverse: '#000000',
        },
        background: {
          app: '#000000',
          muted: 'rgba(255, 255, 255, 0.05)',
          card: 'rgba(255, 255, 255, 0.05)',
        },
        surface: {
          default: '#000000',
          raised: 'rgba(255, 255, 255, 0.03)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.12)',
          default: 'rgba(255, 255, 255, 0.18)',
        },
      },
    },
  },
  icons: {
    library: 'phosphor',
    defaultWeight: 'regular',
    weightsAllowed: ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'],
    defaultSizes: [16, 20, 24, 28],
  },
} as const;

/**
 * Get color mode tokens based on current color scheme
 * @param colorScheme - 'light' | 'dark' | null (defaults to 'light')
 * @returns Color tokens for the specified mode
 */
export function getColors(colorScheme: 'light' | 'dark' | null = 'light') {
  const mode = colorScheme === 'dark' ? 'dark' : 'light';
  return {
    ...designTokens.colors.modes[mode],
    static: designTokens.colors.static,
    shared: designTokens.colors.shared,
    // Backward-compatible aliases for shared semantic colors
    success: designTokens.colors.shared.success,
    warning: designTokens.colors.shared.warning,
    error: designTokens.colors.shared.error,
    // Semantic on-colors (design system requirement for colored backgrounds)
    onSuccess: designTokens.colors.shared.onSuccess,
    onWarning: designTokens.colors.shared.onWarning,
    onError: designTokens.colors.shared.onError,
  };
}

/**
 * Hook to get IAMJARL design tokens with automatic light/dark mode support
 * @returns All design tokens with colors matching current color scheme
 */
export function useDesignTokens() {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);

  return {
    colors,
    spacing: designTokens.spacing,
    radius: designTokens.radius,
    typography: designTokens.typography,
    icons: designTokens.icons,
  };
}

/**
 * Get spacing token value
 */
export const spacing = designTokens.spacing;

/**
 * Get radius token value
 */
export const radius = designTokens.radius;

/**
 * Get typography tokens
 */
export const typography = designTokens.typography;

/**
 * Get icon configuration
 */
export const icons = designTokens.icons;
