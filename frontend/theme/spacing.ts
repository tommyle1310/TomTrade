/**
 * Spacing System
 * Consistent spacing scale for margins, padding, and positioning
 */

// Base spacing unit (4px)
const BASE_UNIT = 4;

// Spacing Scale
export const spacing = {
  0: 0,
  0.5: BASE_UNIT * 0.5, // 2px
  1: BASE_UNIT * 1, // 4px
  1.5: BASE_UNIT * 1.5, // 6px
  2: BASE_UNIT * 2, // 8px
  2.5: BASE_UNIT * 2.5, // 10px
  3: BASE_UNIT * 3, // 12px
  3.5: BASE_UNIT * 3.5, // 14px
  4: BASE_UNIT * 4, // 16px
  5: BASE_UNIT * 5, // 20px
  6: BASE_UNIT * 6, // 24px
  7: BASE_UNIT * 7, // 28px
  8: BASE_UNIT * 8, // 32px
  9: BASE_UNIT * 9, // 36px
  10: BASE_UNIT * 10, // 40px
  11: BASE_UNIT * 11, // 44px
  12: BASE_UNIT * 12, // 48px
  14: BASE_UNIT * 14, // 56px
  16: BASE_UNIT * 16, // 64px
  20: BASE_UNIT * 20, // 80px
  24: BASE_UNIT * 24, // 96px
  28: BASE_UNIT * 28, // 112px
  32: BASE_UNIT * 32, // 128px
  36: BASE_UNIT * 36, // 144px
  40: BASE_UNIT * 40, // 160px
  44: BASE_UNIT * 44, // 176px
  48: BASE_UNIT * 48, // 192px
  52: BASE_UNIT * 52, // 208px
  56: BASE_UNIT * 56, // 224px
  60: BASE_UNIT * 60, // 240px
  64: BASE_UNIT * 64, // 256px
  72: BASE_UNIT * 72, // 288px
  80: BASE_UNIT * 80, // 320px
  96: BASE_UNIT * 96, // 384px
} as const;

// Semantic Spacing
export const layout = {
  // Container Spacing
  container: {
    padding: spacing[5], // 20px
    paddingHorizontal: spacing[5], // 20px
    paddingVertical: spacing[6], // 24px
  },

  // Screen Spacing
  screen: {
    padding: spacing[4], // 16px
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[6], // 24px
    safeArea: spacing[2], // 8px
  },

  // Card Spacing
  card: {
    padding: spacing[4], // 16px
    paddingHorizontal: spacing[4], // 16px
    paddingVertical: spacing[4], // 16px
    margin: spacing[3], // 12px
    gap: spacing[3], // 12px
  },

  // List Spacing
  list: {
    itemPadding: spacing[4], // 16px
    itemGap: spacing[2], // 8px
    sectionGap: spacing[6], // 24px
  },

  // Form Spacing
  form: {
    fieldGap: spacing[4], // 16px
    groupGap: spacing[6], // 24px
    labelGap: spacing[2], // 8px
  },

  // Button Spacing
  button: {
    paddingHorizontal: {
      small: spacing[3], // 12px
      medium: spacing[4], // 16px
      large: spacing[6], // 24px
    },
    paddingVertical: {
      small: spacing[2], // 8px
      medium: spacing[3], // 12px
      large: spacing[4], // 16px
    },
    gap: spacing[2], // 8px (between icon and text)
  },

  // Navigation Spacing
  navigation: {
    tabBar: {
      padding: spacing[4], // 16px
      paddingHorizontal: spacing[5], // 20px
      paddingVertical: spacing[4], // 16px
      gap: spacing[2], // 8px
    },
    header: {
      padding: spacing[4], // 16px
      paddingHorizontal: spacing[4], // 16px
    },
  },

  // Modal Spacing
  modal: {
    padding: spacing[6], // 24px
    margin: spacing[5], // 20px
    gap: spacing[4], // 16px
  },

  // Input Spacing
  input: {
    paddingHorizontal: spacing[3], // 12px
    paddingVertical: spacing[3], // 12px
    gap: spacing[2], // 8px
  },
} as const;

// Border Radius Scale
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 32,
  full: 9999,
} as const;

// Shadow Definitions
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
export type ZIndex = typeof zIndex;
