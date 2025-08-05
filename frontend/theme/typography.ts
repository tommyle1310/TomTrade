/**
 * Typography System
 * Comprehensive text styles with semantic naming
 */

import { TextStyle } from 'react-native';

// Font Families
export const fontFamily = {
  regular: 'System', // iOS: San Francisco, Android: Roboto
  medium: 'System', // Will use platform default medium weight
  semiBold: 'System', // Will use platform default semi-bold weight
  bold: 'System', // Will use platform default bold weight
  mono: 'Courier', // Monospace font
} as const;

// Font Weights
export const fontWeight = {
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
} as const;

// Font Sizes
export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
  '7xl': 48,
  '8xl': 64,
  '9xl': 72,
} as const;

// Line Heights
export const lineHeight = {
  xs: 12,
  sm: 16,
  base: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,
  '8xl': 80,
  '9xl': 96,
} as const;

// Letter Spacing
export const letterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

// Typography Variants
export const typography = {
  // Display Styles
  display: {
    large: {
      fontSize: fontSize['7xl'],
      lineHeight: lineHeight['7xl'],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    medium: {
      fontSize: fontSize['6xl'],
      lineHeight: lineHeight['6xl'],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    small: {
      fontSize: fontSize['5xl'],
      lineHeight: lineHeight['5xl'],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Heading Styles
  heading: {
    h1: {
      fontSize: fontSize['4xl'],
      lineHeight: lineHeight['4xl'],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSize['3xl'],
      lineHeight: lineHeight['3xl'],
      fontWeight: fontWeight.bold,
      letterSpacing: letterSpacing.tight,
    },
    h3: {
      fontSize: fontSize['2xl'],
      lineHeight: lineHeight['2xl'],
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontSize: fontSize.base,
      lineHeight: lineHeight.base,
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Body Text Styles
  body: {
    large: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: fontSize.base,
      lineHeight: lineHeight.base,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Label Styles
  label: {
    large: {
      fontSize: fontSize.base,
      lineHeight: lineHeight.base,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Caption Styles
  caption: {
    large: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Button Text Styles
  button: {
    large: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: fontSize.base,
      lineHeight: lineHeight.base,
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Navigation Text Styles
  navigation: {
    title: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
    tab: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      fontWeight: fontWeight.semiBold,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Input Text Styles
  input: {
    large: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: fontSize.base,
      lineHeight: lineHeight.base,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Code Text Styles
  code: {
    large: {
      fontSize: fontSize.base,
      lineHeight: lineHeight.base,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      fontFamily: fontFamily.mono,
      fontWeight: fontWeight.regular,
      letterSpacing: letterSpacing.normal,
    },
  },
} as const;

export type Typography = typeof typography;
export type FontFamily = typeof fontFamily;
export type FontWeight = typeof fontWeight;
export type FontSize = typeof fontSize;
export type LineHeight = typeof lineHeight;
export type LetterSpacing = typeof letterSpacing;
