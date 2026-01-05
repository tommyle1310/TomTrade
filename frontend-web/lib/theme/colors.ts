/**
 * TomTrade Design System - Color Constants
 * 
 * Provides a comprehensive color system with:
 * - Color intensity levels (400, 500, 600) for fine-grained control
 * - Entity-based colorsets for specific UI components
 * - Semantic color constants for trading-specific use cases
 * 
 * All colors reference CSS custom properties defined in globals.css
 * to ensure theme consistency and support light/dark mode switching.
 */

/**
 * Helper function to create color with opacity
 * @param cssVar - CSS variable name (e.g., '--success')
 * @param opacity - Opacity value (0-1)
 */
const withOpacity = (cssVar: string, opacity: number = 1): string => {
  if (opacity === 1) {
    return `hsl(var(${cssVar}))`;
  }
  return `hsl(var(${cssVar}) / ${opacity})`;
};

/**
 * Color intensity scale generator
 * Creates lighter (400), standard (500), and darker (600) variants
 */
const createColorScale = (baseVar: string) => ({
  400: withOpacity(baseVar, 0.7),  // Lighter/subtle variant
  500: withOpacity(baseVar, 1),    // Standard variant
  600: withOpacity(baseVar, 1),    // Darker variant (uses full opacity, darker shade should be in CSS)
});

// ============================================================================
// SEMANTIC COLORS WITH INTENSITY LEVELS
// ============================================================================

/**
 * Success colors (green) - used for gains, positive changes, confirmations
 * Maps to --success CSS variable
 */
export const success = {
  400: withOpacity('--success', 0.7),
  500: withOpacity('--success', 1),
  600: withOpacity('--success', 1),
  foreground: withOpacity('--success-foreground', 1),
};

/**
 * Danger colors (red) - used for losses, negative changes, errors, destructive actions
 * Maps to --danger CSS variable
 */
export const danger = {
  400: withOpacity('--danger', 0.7),
  500: withOpacity('--danger', 1),
  600: withOpacity('--danger', 1),
  foreground: withOpacity('--danger-foreground', 1),
};

/**
 * Warning colors (yellow/orange) - used for caution, warnings, pending states
 * Maps to --warning CSS variable
 */
export const warning = {
  400: withOpacity('--warning', 0.7),
  500: withOpacity('--warning', 1),
  600: withOpacity('--warning', 1),
  foreground: withOpacity('--warning-foreground', 1),
};

/**
 * Primary brand colors - main brand identity
 * Maps to --primary CSS variable
 */
export const primary = {
  400: withOpacity('--primary', 0.7),
  500: withOpacity('--primary', 1),
  600: withOpacity('--primary', 1),
  foreground: withOpacity('--primary-foreground', 1),
};

/**
 * Secondary brand colors - secondary brand identity
 * Maps to --secondary CSS variable
 */
export const secondary = {
  400: withOpacity('--secondary', 0.7),
  500: withOpacity('--secondary', 1),
  600: withOpacity('--secondary', 1),
  foreground: withOpacity('--secondary-foreground', 1),
};

/**
 * Accent colors - highlights and emphasis
 * Maps to --accent CSS variable
 */
export const accent = {
  400: withOpacity('--accent', 0.7),
  500: withOpacity('--accent', 1),
  600: withOpacity('--accent', 1),
  foreground: withOpacity('--accent-foreground', 1),
};

/**
 * Destructive colors - destructive actions, errors
 * Maps to --destructive CSS variable
 */
export const destructive = {
  400: withOpacity('--destructive', 0.7),
  500: withOpacity('--destructive', 1),
  600: withOpacity('--destructive', 1),
  foreground: withOpacity('--primary-foreground', 1),
};

// ============================================================================
// ENTITY-BASED COLORSETS
// ============================================================================

/**
 * Global colors - application-wide base colors
 */
export const global = {
  background: withOpacity('--background', 1),
  foreground: withOpacity('--foreground', 1),
  border: withOpacity('--border', 1),
  ring: withOpacity('--ring', 1),
  input: withOpacity('--input', 1),
};

/**
 * Text colors - typography color variants
 */
export const text = {
  primary: withOpacity('--foreground', 1),
  secondary: withOpacity('--muted-foreground', 1),
  muted: withOpacity('--muted-foreground', 0.7),
  disabled: withOpacity('--muted-foreground', 0.5),
  inverse: withOpacity('--background', 1),
};

/**
 * Brand colors - primary brand identity colors
 */
export const brand = {
  primary: withOpacity('--primary', 1),
  primaryForeground: withOpacity('--primary-foreground', 1),
  secondary: withOpacity('--secondary', 1),
  secondaryForeground: withOpacity('--secondary-foreground', 1),
};

/**
 * State colors - interactive state colors (hover, active, focus, disabled)
 */
export const state = {
  hover: withOpacity('--accent', 0.5),
  active: withOpacity('--accent', 1),
  focus: withOpacity('--ring', 1),
  disabled: withOpacity('--muted', 1),
  disabledText: withOpacity('--muted-foreground', 0.5),
};

/**
 * Button colors - button component color variants
 * Organized by variant type (default, primary, secondary, destructive, ghost, outline)
 */
export const btn = {
  default: {
    background: withOpacity('--primary', 1),
    foreground: withOpacity('--primary-foreground', 1),
    hover: withOpacity('--primary', 0.9),
    active: withOpacity('--primary', 0.8),
    disabled: withOpacity('--muted', 1),
    disabledText: withOpacity('--muted-foreground', 0.5),
  },
  secondary: {
    background: withOpacity('--secondary', 1),
    foreground: withOpacity('--secondary-foreground', 1),
    hover: withOpacity('--secondary', 0.8),
    active: withOpacity('--secondary', 0.7),
  },
  destructive: {
    background: withOpacity('--destructive', 1),
    foreground: withOpacity('--primary-foreground', 1),
    hover: withOpacity('--destructive', 0.9),
    active: withOpacity('--destructive', 0.8),
  },
  ghost: {
    background: 'transparent',
    foreground: withOpacity('--foreground', 1),
    hover: withOpacity('--accent', 1),
    active: withOpacity('--accent', 0.8),
  },
  outline: {
    background: 'transparent',
    foreground: withOpacity('--foreground', 1),
    border: withOpacity('--border', 1),
    hover: withOpacity('--accent', 1),
    active: withOpacity('--accent', 0.8),
  },
};

/**
 * Input/Form colors - input field and form element colors
 */
export const input = {
  background: withOpacity('--background', 1),
  foreground: withOpacity('--foreground', 1),
  border: withOpacity('--input', 1),
  borderFocus: withOpacity('--ring', 1),
  borderError: withOpacity('--destructive', 1),
  placeholder: withOpacity('--muted-foreground', 1),
  disabled: withOpacity('--muted', 1),
  disabledText: withOpacity('--muted-foreground', 0.5),
};

/**
 * Form colors - form container and label colors
 */
export const form = {
  label: withOpacity('--foreground', 1),
  labelOptional: withOpacity('--muted-foreground', 1),
  description: withOpacity('--muted-foreground', 1),
  error: withOpacity('--destructive', 1),
  success: withOpacity('--success', 1),
};

/**
 * Card colors - card component colors
 */
export const card = {
  background: withOpacity('--card', 1),
  foreground: withOpacity('--card-foreground', 1),
  border: withOpacity('--border', 1),
  headerBackground: withOpacity('--muted', 0.3),
  hover: withOpacity('--accent', 0.5),
};

/**
 * Table colors - table component colors
 */
export const table = {
  header: withOpacity('--muted', 1),
  headerText: withOpacity('--muted-foreground', 1),
  row: withOpacity('--card', 1),
  rowHover: withOpacity('--accent', 0.5),
  rowSelected: withOpacity('--accent', 0.8),
  border: withOpacity('--border', 1),
};

/**
 * Notification colors - notification/alert component colors
 * Organized by notification type (info, success, warning, error)
 */
export const notification = {
  info: {
    background: withOpacity('--primary', 0.1),
    foreground: withOpacity('--primary', 1),
    border: withOpacity('--primary', 0.3),
  },
  success: {
    background: withOpacity('--success', 0.1),
    foreground: withOpacity('--success', 1),
    border: withOpacity('--success', 0.3),
  },
  warning: {
    background: withOpacity('--warning', 0.1),
    foreground: withOpacity('--warning', 1),
    border: withOpacity('--warning', 0.3),
  },
  error: {
    background: withOpacity('--destructive', 0.1),
    foreground: withOpacity('--destructive', 1),
    border: withOpacity('--destructive', 0.3),
  },
};

/**
 * Modal colors - modal/dialog component colors
 */
export const modal = {
  overlay: withOpacity('--background', 0.8),
  background: withOpacity('--card', 1),
  foreground: withOpacity('--card-foreground', 1),
  border: withOpacity('--border', 1),
  headerBackground: withOpacity('--muted', 0.3),
};

/**
 * Icon colors - icon color variants
 */
export const icon = {
  primary: withOpacity('--foreground', 1),
  secondary: withOpacity('--muted-foreground', 1),
  muted: withOpacity('--muted-foreground', 0.7),
  success: withOpacity('--success', 1),
  danger: withOpacity('--danger', 1),
  warning: withOpacity('--warning', 1),
};

/**
 * Utility colors - dividers, overlays, skeletons, and other utilities
 */
export const utility = {
  divider: withOpacity('--border', 1),
  overlay: withOpacity('--background', 0.8),
  overlayDark: withOpacity('--foreground', 0.5),
  skeleton: withOpacity('--muted', 1),
  skeletonShimmer: withOpacity('--muted-foreground', 0.1),
  glass: withOpacity('--glass', 1),
  glassBorder: withOpacity('--glass-border', 1),
};

// ============================================================================
// TRADING-SPECIFIC CONSTANTS
// ============================================================================

/**
 * Gain color - used for positive price movements, profits, increases
 * @example
 * ```tsx
 * <div style={{ color: GAIN_COLOR }}>+5.2%</div>
 * ```
 */
export const GAIN_COLOR = success[500];

/**
 * Loss color - used for negative price movements, losses, decreases
 * @example
 * ```tsx
 * <div style={{ color: LOSS_COLOR }}>-3.1%</div>
 * ```
 */
export const LOSS_COLOR = danger[500];

/**
 * Neutral color - used for unchanged values, neutral states
 */
export const NEUTRAL_COLOR = text.secondary;

/**
 * Chart color palette - array of distinct colors for multi-series charts
 * Maps to --chart-* CSS variables
 * @example
 * ```tsx
 * CHART_COLORS.map((color, index) => (
 *   <Line key={index} stroke={color} dataKey={`series${index}`} />
 * ))
 * ```
 */
export const CHART_COLORS = [
  withOpacity('--chart-1', 1), // Primary blue
  withOpacity('--chart-2', 1), // Success green
  withOpacity('--chart-3', 1), // Danger red
  withOpacity('--chart-4', 1), // Warning yellow
  withOpacity('--chart-5', 1), // Purple
];

/**
 * Candlestick colors - specific colors for candlestick charts
 * Using rgba for better SVG compatibility
 */
export const candlestick = {
  gain: {
    fill: 'rgba(16, 185, 129, 0.6)',
    stroke: 'rgba(16, 185, 129, 1)',
    gradient: {
      start: 'rgba(16, 185, 129, 1)',
      end: 'rgba(5, 150, 105, 1)', // Darker shade
    },
  },
  loss: {
    fill: 'rgba(239, 68, 68, 0.6)',
    stroke: 'rgba(239, 68, 68, 1)',
    gradient: {
      start: 'rgba(239, 68, 68, 1)',
      end: 'rgba(220, 38, 38, 1)', // Darker shade
    },
  },
};

/**
 * Volume chart colors - specific colors for volume bars
 * Using rgba for better SVG compatibility
 */
export const volume = {
  gain: 'rgba(16, 185, 129, 0.9)', // success with 60% opacity
  loss: 'rgba(239, 68, 68, 0.9)',  // danger with 60% opacity
};
// ============================================================================
// SIDEBAR COLORS
// ============================================================================

/**
 * Sidebar colors - specific colors for sidebar navigation
 */
export const sidebar = {
  background: withOpacity('--sidebar', 1),
  foreground: withOpacity('--sidebar-foreground', 1),
  primary: withOpacity('--sidebar-primary', 1),
  primaryForeground: withOpacity('--sidebar-primary-foreground', 1),
  accent: withOpacity('--sidebar-accent', 1),
  accentForeground: withOpacity('--sidebar-accent-foreground', 1),
  border: withOpacity('--sidebar-border', 1),
  ring: withOpacity('--sidebar-ring', 1),
};
