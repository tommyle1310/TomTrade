/**
 * TomTrade Design System - CSS Utilities
 * 
 * Provides reusable CSS utility constants for:
 * - Border radius (rounded corners)
 * - Shadows (elevation effects)
 * - Gradients (linear gradients)
 * - Typography (fonts, sizes, weights)
 * - Spacing/Sizing (common dimensions)
 * 
 * All utilities reference CSS custom properties or provide
 * consistent values aligned with the design system.
 */

// ============================================================================
// BORDER RADIUS
// ============================================================================

/**
 * Border radius constants - consistent rounded corner values
 * Maps to Tailwind's radius scale and CSS custom properties
 */
export const ROUNDED_NONE = '0';
export const ROUNDED_SM = 'calc(var(--radius) - 4px)';
export const ROUNDED_MD = 'calc(var(--radius) - 2px)';
export const ROUNDED_LG = 'var(--radius)';
export const ROUNDED_XL = 'calc(var(--radius) + 4px)';
export const ROUNDED_2XL = 'calc(var(--radius) + 8px)';
export const ROUNDED_FULL = '9999px';

/**
 * Border radius object for easy access
 */
export const rounded = {
  none: ROUNDED_NONE,
  sm: ROUNDED_SM,
  md: ROUNDED_MD,
  lg: ROUNDED_LG,
  xl: ROUNDED_XL,
  '2xl': ROUNDED_2XL,
  full: ROUNDED_FULL,
};

// ============================================================================
// SHADOWS
// ============================================================================

/**
 * Shadow constants - consistent elevation effects
 * Provides shadows for different elevation levels
 */
export const SHADOW_NONE = 'none';
export const SHADOW_SM = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
export const SHADOW_MD = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
export const SHADOW_LG = '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)';
export const SHADOW_XL = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
export const SHADOW_2XL = '0 25px 50px -12px rgb(0 0 0 / 0.25)';
export const SHADOW_INNER = 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)';

/**
 * Shadow object for easy access
 */
export const shadow = {
  none: SHADOW_NONE,
  sm: SHADOW_SM,
  md: SHADOW_MD,
  lg: SHADOW_LG,
  xl: SHADOW_XL,
  '2xl': SHADOW_2XL,
  inner: SHADOW_INNER,
};

// ============================================================================
// GRADIENTS
// ============================================================================

/**
 * Linear gradient generator
 * @param direction - CSS gradient direction (e.g., 'to bottom', '45deg')
 * @param colorStops - Array of color stops [color, position] tuples
 * @returns CSS linear-gradient string
 * 
 * @example
 * ```tsx
 * const gradient = linearGradient('to bottom', [
 *   ['hsl(var(--success))', '0%'],
 *   ['hsl(var(--success) / 0.5)', '100%']
 * ]);
 * ```
 */
export const linearGradient = (
  direction: string,
  colorStops: [color: string, position: string][]
): string => {
  const stops = colorStops.map(([color, position]) => `${color} ${position}`).join(', ');
  return `linear-gradient(${direction}, ${stops})`;
};

/**
 * Gradient presets for common use cases
 */
export const gradients = {
  /**
   * Success gradient (green) - for positive states, gains
   */
  success: linearGradient('to bottom', [
    ['hsl(var(--success))', '0%'],
    ['hsl(var(--success) / 0.6)', '100%'],
  ]),
  
  /**
   * Danger gradient (red) - for negative states, losses
   */
  danger: linearGradient('to bottom', [
    ['hsl(var(--danger))', '0%'],
    ['hsl(var(--danger) / 0.6)', '100%'],
  ]),
  
  /**
   * Primary brand gradient
   */
  primary: linearGradient('to bottom', [
    ['hsl(var(--primary))', '0%'],
    ['hsl(var(--primary) / 0.8)', '100%'],
  ]),
  
  /**
   * Accent gradient - for highlights and emphasis
   */
  accent: linearGradient('to bottom', [
    ['hsl(var(--accent))', '0%'],
    ['hsl(var(--accent) / 0.7)', '100%'],
  ]),
  
  /**
   * Glass/frosted gradient - for glassmorphism effects
   */
  glass: linearGradient('to bottom', [
    ['hsl(var(--glass))', '0%'],
    ['hsl(var(--glass) / 0.4)', '100%'],
  ]),
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * Font family constants
 * Maps to CSS custom properties defined in globals.css
 */
export const FONT_SANS = 'var(--font-geist-sans)';
export const FONT_MONO = 'var(--font-geist-mono)';

export const fontFamily = {
  sans: FONT_SANS,
  mono: FONT_MONO,
};

/**
 * Font size scale - consistent text sizing
 * Aligned with Tailwind's text size scale
 */
export const FONT_SIZE_XS = '0.75rem';      // 12px
export const FONT_SIZE_SM = '0.875rem';     // 14px
export const FONT_SIZE_BASE = '1rem';       // 16px
export const FONT_SIZE_LG = '1.125rem';     // 18px
export const FONT_SIZE_XL = '1.25rem';      // 20px
export const FONT_SIZE_2XL = '1.5rem';      // 24px
export const FONT_SIZE_3XL = '1.875rem';    // 30px
export const FONT_SIZE_4XL = '2.25rem';     // 36px
export const FONT_SIZE_5XL = '3rem';        // 48px

export const fontSize = {
  xs: FONT_SIZE_XS,
  sm: FONT_SIZE_SM,
  base: FONT_SIZE_BASE,
  lg: FONT_SIZE_LG,
  xl: FONT_SIZE_XL,
  '2xl': FONT_SIZE_2XL,
  '3xl': FONT_SIZE_3XL,
  '4xl': FONT_SIZE_4XL,
  '5xl': FONT_SIZE_5XL,
};

/**
 * Font weight constants
 */
export const FONT_WEIGHT_LIGHT = '300';
export const FONT_WEIGHT_NORMAL = '400';
export const FONT_WEIGHT_MEDIUM = '500';
export const FONT_WEIGHT_SEMIBOLD = '600';
export const FONT_WEIGHT_BOLD = '700';
export const FONT_WEIGHT_EXTRABOLD = '800';

export const fontWeight = {
  light: FONT_WEIGHT_LIGHT,
  normal: FONT_WEIGHT_NORMAL,
  medium: FONT_WEIGHT_MEDIUM,
  semibold: FONT_WEIGHT_SEMIBOLD,
  bold: FONT_WEIGHT_BOLD,
  extrabold: FONT_WEIGHT_EXTRABOLD,
};

/**
 * Line height scale - consistent vertical rhythm
 */
export const LINE_HEIGHT_NONE = '1';
export const LINE_HEIGHT_TIGHT = '1.25';
export const LINE_HEIGHT_SNUG = '1.375';
export const LINE_HEIGHT_NORMAL = '1.5';
export const LINE_HEIGHT_RELAXED = '1.625';
export const LINE_HEIGHT_LOOSE = '2';

export const lineHeight = {
  none: LINE_HEIGHT_NONE,
  tight: LINE_HEIGHT_TIGHT,
  snug: LINE_HEIGHT_SNUG,
  normal: LINE_HEIGHT_NORMAL,
  relaxed: LINE_HEIGHT_RELAXED,
  loose: LINE_HEIGHT_LOOSE,
};

// ============================================================================
// SPACING / SIZING
// ============================================================================

/**
 * Component height constants - consistent heights for interactive elements
 */
export const HEIGHT_INPUT = '2.25rem';      // 36px - h-9
export const HEIGHT_BUTTON_SM = '2rem';     // 32px - h-8
export const HEIGHT_BUTTON_MD = '2.5rem';   // 40px - h-10
export const HEIGHT_BUTTON_LG = '2.75rem';  // 44px - h-11

export const componentHeight = {
  input: HEIGHT_INPUT,
  buttonSm: HEIGHT_BUTTON_SM,
  buttonMd: HEIGHT_BUTTON_MD,
  buttonLg: HEIGHT_BUTTON_LG,
};

/**
 * Icon size presets - consistent icon dimensions
 */
export const ICON_SIZE_XS = '0.75rem';   // 12px
export const ICON_SIZE_SM = '1rem';      // 16px
export const ICON_SIZE_MD = '1.25rem';   // 20px
export const ICON_SIZE_LG = '1.5rem';    // 24px
export const ICON_SIZE_XL = '2rem';      // 32px
export const ICON_SIZE_2XL = '2.5rem';   // 40px

export const iconSize = {
  xs: ICON_SIZE_XS,
  sm: ICON_SIZE_SM,
  md: ICON_SIZE_MD,
  lg: ICON_SIZE_LG,
  xl: ICON_SIZE_XL,
  '2xl': ICON_SIZE_2XL,
};

/**
 * Container width constants - max-width constraints
 */
export const CONTAINER_SM = '640px';
export const CONTAINER_MD = '768px';
export const CONTAINER_LG = '1024px';
export const CONTAINER_XL = '1280px';
export const CONTAINER_2XL = '1536px';

export const containerWidth = {
  sm: CONTAINER_SM,
  md: CONTAINER_MD,
  lg: CONTAINER_LG,
  xl: CONTAINER_XL,
  '2xl': CONTAINER_2XL,
};

/**
 * Spacing scale - consistent spacing values
 * Aligned with Tailwind's spacing scale (in rem)
 */
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

/**
 * Z-index scale - consistent layering
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

// ============================================================================
// TRANSITIONS
// ============================================================================

/**
 * Transition duration constants
 */
export const DURATION_FAST = '150ms';
export const DURATION_NORMAL = '300ms';
export const DURATION_SLOW = '500ms';

export const duration = {
  fast: DURATION_FAST,
  normal: DURATION_NORMAL,
  slow: DURATION_SLOW,
};

/**
 * Transition easing functions
 */
export const EASING_DEFAULT = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const EASING_IN = 'cubic-bezier(0.4, 0, 1, 1)';
export const EASING_OUT = 'cubic-bezier(0, 0, 0.2, 1)';
export const EASING_IN_OUT = 'cubic-bezier(0.4, 0, 0.2, 1)';

export const easing = {
  default: EASING_DEFAULT,
  in: EASING_IN,
  out: EASING_OUT,
  inOut: EASING_IN_OUT,
};

/**
 * Common transition presets
 */
export const transitions = {
  fast: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
  normal: `all ${DURATION_NORMAL} ${EASING_DEFAULT}`,
  slow: `all ${DURATION_SLOW} ${EASING_DEFAULT}`,
  color: `color ${DURATION_NORMAL} ${EASING_DEFAULT}`,
  transform: `transform ${DURATION_NORMAL} ${EASING_DEFAULT}`,
  opacity: `opacity ${DURATION_NORMAL} ${EASING_DEFAULT}`,
};
