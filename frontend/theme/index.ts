/**
 * Theme System - Main Export
 * Centralized theme configuration for the entire application
 */

// Import all theme modules
import { colors, palette } from './colors';
import {
  typography,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,
} from './typography';
import { spacing, layout, borderRadius, shadows, zIndex } from './spacing';
import {
  duration,
  easing,
  animations,
  transitions,
  animationUtils,
} from './animations';
import {
  breakpoints,
  deviceType,
  screen,
  responsive,
  layouts,
  orientation,
} from './breakpoints';
import { button, input, card, modal, list, tabBar, toast } from './components';

// Main theme object
export const theme = {
  // Color system
  colors,
  palette,

  // Typography system
  typography,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing,

  // Spacing system
  spacing,
  layout,
  borderRadius,
  shadows,
  zIndex,

  // Animation system
  duration,
  easing,
  animations,
  transitions,
  animationUtils,

  // Responsive system
  breakpoints,
  deviceType,
  screen,
  responsive,
  layouts,
  orientation,

  // Component styles
  components: {
    button,
    input,
    card,
    modal,
    list,
    tabBar,
    toast,
  },
} as const;

// Theme utilities
export const themeUtils = {
  // Get color with opacity
  getColorWithOpacity: (color: string, opacity: number): string => {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // Handle rgba colors
    if (color.startsWith('rgba')) {
      return color.replace(/[\d\.]+\)$/g, `${opacity})`);
    }

    // Handle rgb colors
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }

    return color;
  },

  // Create responsive style
  createResponsiveStyle: <T>(
    styles: {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      '2xl'?: T;
    },
    fallback: T
  ): T => {
    return responsive.getValue(styles, fallback);
  },

  // Get shadow for elevation
  getShadowForElevation: (elevation: number) => {
    if (elevation <= 1) return shadows.xs;
    if (elevation <= 2) return shadows.sm;
    if (elevation <= 4) return shadows.base;
    if (elevation <= 6) return shadows.md;
    if (elevation <= 10) return shadows.lg;
    return shadows.xl;
  },

  // Create component variant
  createVariant: <T extends Record<string, any>>(
    base: T,
    variant: Partial<T>
  ): T => {
    return { ...base, ...variant };
  },

  // Merge theme styles
  mergeStyles: <T>(...styles: (T | undefined)[]): T => {
    return Object.assign({}, ...styles.filter(Boolean)) as T;
  },
} as const;

// Theme hooks (for use with React Context)
export const createThemeContext = () => {
  return {
    theme,
    utils: themeUtils,
  };
};

// Export individual modules for direct access
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './animations';
export * from './breakpoints';
export * from './components';

// Export theme as default
export default theme;

// Type definitions
export type Theme = typeof theme;
export type ThemeUtils = typeof themeUtils;
export type ThemeContext = ReturnType<typeof createThemeContext>;
