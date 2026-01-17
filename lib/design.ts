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
    lineHeights: {
      tight: 20,
      normal: 24,
      relaxed: 28,
      xxl: 43.2,
      sm: 18,
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
    },
    shared: {
      success: '#4CAF50',
      warning: '#FF6B35',
      error: '#FF3B30',
    },
    modes: {
      light: {
        primary: '#00FF7B',
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
