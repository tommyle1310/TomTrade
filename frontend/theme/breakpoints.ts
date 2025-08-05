/**
 * Breakpoints System
 * Responsive design breakpoints and utilities
 */

import { Dimensions } from 'react-native';

// Get device dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Breakpoint Values (in pixels)
export const breakpoints = {
  xs: 0, // Extra small devices
  sm: 576, // Small devices (landscape phones)
  md: 768, // Medium devices (tablets)
  lg: 992, // Large devices (desktops)
  xl: 1200, // Extra large devices (large desktops)
  '2xl': 1400, // Extra extra large devices
} as const;

// Device Type Detection
export const deviceType = {
  isSmallPhone: screenWidth < breakpoints.sm,
  isPhone: screenWidth < breakpoints.md,
  isTablet: screenWidth >= breakpoints.md && screenWidth < breakpoints.lg,
  isDesktop: screenWidth >= breakpoints.lg,
  isLargeScreen: screenWidth >= breakpoints.xl,
} as const;

// Screen Dimensions
export const screen = {
  width: screenWidth,
  height: screenHeight,

  // Safe area approximations (you might want to use react-native-safe-area-context for exact values)
  safeArea: {
    top: 44, // Status bar height (approximate)
    bottom: 34, // Home indicator height (approximate)
  },

  // Common aspect ratios
  aspectRatio: screenWidth / screenHeight,
  isLandscape: screenWidth > screenHeight,
  isPortrait: screenHeight > screenWidth,
} as const;

// Responsive Utilities
export const responsive = {
  // Get value based on screen size
  getValue: <T>(
    values: {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      '2xl'?: T;
    },
    fallback: T
  ): T => {
    if (screenWidth >= breakpoints['2xl'] && values['2xl'] !== undefined)
      return values['2xl'];
    if (screenWidth >= breakpoints.xl && values.xl !== undefined)
      return values.xl;
    if (screenWidth >= breakpoints.lg && values.lg !== undefined)
      return values.lg;
    if (screenWidth >= breakpoints.md && values.md !== undefined)
      return values.md;
    if (screenWidth >= breakpoints.sm && values.sm !== undefined)
      return values.sm;
    if (values.xs !== undefined) return values.xs;
    return fallback;
  },

  // Check if screen matches breakpoint
  matches: (breakpoint: keyof typeof breakpoints): boolean => {
    return screenWidth >= breakpoints[breakpoint];
  },

  // Get responsive padding
  getPadding: () => {
    if (deviceType.isSmallPhone) return 12;
    if (deviceType.isPhone) return 16;
    if (deviceType.isTablet) return 24;
    return 32;
  },

  // Get responsive font size
  getFontSize: (base: number) => {
    const scale = responsive.getValue(
      {
        xs: 0.9,
        sm: 1,
        md: 1.1,
        lg: 1.2,
        xl: 1.3,
      },
      1
    );
    return Math.round(base * scale);
  },

  // Get responsive spacing
  getSpacing: (base: number) => {
    const scale = responsive.getValue(
      {
        xs: 0.8,
        sm: 1,
        md: 1.2,
        lg: 1.4,
        xl: 1.6,
      },
      1
    );
    return Math.round(base * scale);
  },
} as const;

// Layout Presets
export const layouts = {
  // Container max widths
  container: {
    sm: Math.min(screenWidth - 32, 540),
    md: Math.min(screenWidth - 32, 720),
    lg: Math.min(screenWidth - 32, 960),
    xl: Math.min(screenWidth - 32, 1140),
    '2xl': Math.min(screenWidth - 32, 1320),
  },

  // Grid system
  grid: {
    columns: responsive.getValue(
      {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 6,
      },
      1
    ),

    gutter: responsive.getValue(
      {
        xs: 8,
        sm: 12,
        md: 16,
        lg: 20,
        xl: 24,
      },
      16
    ),
  },

  // Common layout patterns
  sidebar: {
    width: responsive.getValue(
      {
        xs: screenWidth * 0.8,
        sm: 280,
        md: 320,
        lg: 360,
      },
      280
    ),
  },

  modal: {
    width: responsive.getValue(
      {
        xs: screenWidth - 32,
        sm: Math.min(screenWidth - 64, 400),
        md: Math.min(screenWidth - 64, 500),
        lg: Math.min(screenWidth - 64, 600),
      },
      screenWidth - 32
    ),

    maxHeight: screenHeight * 0.9,
  },
} as const;

// Orientation utilities
export const orientation = {
  current: screen.isLandscape ? 'landscape' : 'portrait',

  // Listen to orientation changes
  addListener: (callback: (orientation: 'portrait' | 'landscape') => void) => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const newOrientation =
        window.width > window.height ? 'landscape' : 'portrait';
      callback(newOrientation);
    });

    return subscription;
  },
} as const;

export type Breakpoints = typeof breakpoints;
export type DeviceType = typeof deviceType;
export type Screen = typeof screen;
export type Responsive = typeof responsive;
export type Layouts = typeof layouts;
export type Orientation = typeof orientation;
