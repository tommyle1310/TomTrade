/**
 * Color Palette
 * Comprehensive color system with semantic naming
 */

// Base Color Palette - From Coolors Palette
export const palette = {
  // Light Colors (Primary Set)
  blueViolet: {
    50: '#F3F0FF',
    100: '#E9E3FF',
    200: '#D6CCFF',
    300: '#BBA8FF',
    400: '#9B7AFF',
    500: '#7C3AED', // Main brand color
    600: '#6D28D9',
    700: '#5B21B6',
    800: '#4C1D95',
    900: '#3C1A78',
  },

  folly: {
    50: '#FEF2F4',
    100: '#FDE6EA',
    200: '#FBD0D9',
    300: '#F7AAB8',
    400: '#F17A93',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  asparagus: {
    50: '#F6F8F2',
    100: '#EBF1E3',
    200: '#D8E3C8',
    300: '#BBCFA1',
    400: '#9FB77A',
    500: '#83AC46',
    600: '#6B8F37',
    700: '#54712C',
    800: '#455A26',
    900: '#3A4C22',
  },

  azure: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  gamboge: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Dark Colors (Secondary Set)
  tropicalIndigo: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  imperialRed: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#F14141',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  avocado: {
    50: '#F7F8F3',
    100: '#EDF0E6',
    200: '#D9E1CC',
    300: '#BBCBA6',
    400: '#97B07A',
    500: '#668D2B',
    600: '#5A7A24',
    700: '#4A651E',
    800: '#3D521B',
    900: '#334419',
  },

  ruddyBlue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Neutral Colors
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#8E8E93', // iOS gray
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },

  // System Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Semantic Color Mapping
export const colors = {
  // Primary Brand Colors (Blue Violet as main, Tropical Indigo as dark variant)
  primary: palette.blueViolet[500], // #7C3AED
  primaryLight: palette.blueViolet[400], // Lighter blue violet
  primaryDark: palette.tropicalIndigo[400], // #A78BFA (dark variant)

  // Background Colors
  background: {
    primary: palette.white,
    secondary: palette.gray[50],
    tertiary: palette.gray[100],
    overlay: 'rgba(0, 0, 0, 0.5)',
    blur: 'rgba(255, 255, 255, 0.9)',
  },

  // Text Colors
  text: {
    primary: palette.gray[900],
    secondary: palette.gray[700],
    tertiary: palette.gray[600],
    disabled: palette.gray[400],
    inverse: palette.white,
    link: palette.blueViolet[500],
  },

  // Border Colors
  border: {
    primary: palette.gray[200],
    secondary: palette.gray[300],
    focus: palette.blueViolet[500],
    error: palette.imperialRed[500],
  },

  // Surface Colors
  surface: {
    primary: palette.white,
    secondary: palette.gray[50],
    elevated: palette.white,
    overlay: 'rgba(255, 255, 255, 0.95)',
  },

  // Status Colors (Using the new palette)
  status: {
    success: palette.asparagus[500], // Green from asparagus
    warning: palette.gamboge[500], // Orange/yellow from gamboge
    error: palette.folly[500], // Red from folly
    info: palette.azure[500], // Blue from azure
  },

  // Interactive Colors
  interactive: {
    primary: palette.blueViolet[500],
    primaryHover: palette.blueViolet[600],
    primaryPressed: palette.blueViolet[700],
    secondary: palette.gray[100],
    secondaryHover: palette.gray[200],
    secondaryPressed: palette.gray[300],
    disabled: palette.gray[300],
  },

  // Shadow Colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    heavy: 'rgba(0, 0, 0, 0.25)',
  },

  // Additional themed colors for variety
  accent: {
    folly: palette.folly[500], // #F43F5E
    asparagus: palette.asparagus[500], // #83AC46
    azure: palette.azure[500], // #3B82F6
    gamboge: palette.gamboge[500], // #F59E0B
    tropicalIndigo: palette.tropicalIndigo[400], // #A78BFA
    imperialRed: palette.imperialRed[500], // #F14141
    avocado: palette.avocado[500], // #668D2B
    ruddyBlue: palette.ruddyBlue[400], // #60A5FA
    amber: palette.amber[400], // #FBBF24
  },
} as const;

export type ColorPalette = typeof palette;
export type Colors = typeof colors;
