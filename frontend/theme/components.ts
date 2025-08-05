/**
 * Component Theme Styles
 * Pre-defined styles for common UI components
 */

import { ViewStyle, TextStyle } from 'react-native';
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

// Button Component Styles
export const button = {
  // Base button styles
  base: {
    alignItems: 'center' as ViewStyle['alignItems'],
    justifyContent: 'center' as ViewStyle['justifyContent'],
    flexDirection: 'row' as ViewStyle['flexDirection'],
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },

  // Button variants
  variants: {
    primary: {
      backgroundColor: colors.primary,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: colors.surface.secondary,
      borderWidth: 1,
      borderColor: colors.border.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    danger: {
      backgroundColor: colors.status.error,
      borderWidth: 0,
    },
  },

  // Button sizes
  sizes: {
    small: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      minHeight: 32,
    },
    medium: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      minHeight: 40,
    },
    large: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      minHeight: 48,
    },
  },

  // Button text styles
  text: {
    primary: {
      ...typography.button.medium,
      color: colors.text.inverse,
    },
    secondary: {
      ...typography.button.medium,
      color: colors.text.primary,
    },
    outline: {
      ...typography.button.medium,
      color: colors.primary,
    },
    ghost: {
      ...typography.button.medium,
      color: colors.primary,
    },
    danger: {
      ...typography.button.medium,
      color: colors.text.inverse,
    },
  },

  // Button states
  states: {
    disabled: {
      backgroundColor: colors.interactive.disabled,
      opacity: 0.6,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
  },
} as const;

// Input Component Styles
export const input = {
  // Base input styles
  base: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.surface.primary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    ...typography.input.medium,
    color: colors.text.primary,
  },

  // Input variants
  variants: {
    default: {
      borderColor: colors.border.primary,
    },
    focused: {
      borderColor: colors.border.focus,
      borderWidth: 2,
      ...shadows.sm,
    },
    error: {
      borderColor: colors.border.error,
      borderWidth: 2,
    },
    disabled: {
      backgroundColor: colors.surface.secondary,
      color: colors.text.disabled,
      opacity: 0.6,
    },
  },

  // Input sizes
  sizes: {
    small: {
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[2],
      ...typography.input.small,
      minHeight: 32,
    },
    medium: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[3],
      ...typography.input.medium,
      minHeight: 40,
    },
    large: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[4],
      ...typography.input.large,
      minHeight: 48,
    },
  },

  // Label styles
  label: {
    ...typography.label.medium,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },

  // Helper text styles
  helper: {
    ...typography.caption.medium,
    color: colors.text.tertiary,
    marginTop: spacing[1],
  },

  // Error text styles
  error: {
    ...typography.caption.medium,
    color: colors.status.error,
    marginTop: spacing[1],
  },
} as const;

// Card Component Styles
export const card = {
  // Base card styles
  base: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.base,
  },

  // Card variants
  variants: {
    default: {
      backgroundColor: colors.surface.primary,
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: colors.surface.primary,
      borderWidth: 1,
      borderColor: colors.border.primary,
      ...shadows.none,
    },
    elevated: {
      backgroundColor: colors.surface.elevated,
      ...shadows.lg,
    },
  },

  // Card sections
  header: {
    marginBottom: spacing[3],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },

  body: {
    flex: 1,
  },

  footer: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },

  // Card title
  title: {
    ...typography.heading.h5,
    color: colors.text.primary,
    marginBottom: spacing[1],
  },

  // Card subtitle
  subtitle: {
    ...typography.body.small,
    color: colors.text.secondary,
  },
} as const;

// Modal Component Styles
export const modal = {
  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center' as ViewStyle['justifyContent'],
    alignItems: 'center' as ViewStyle['alignItems'],
    padding: spacing[4],
  },

  // Modal container
  container: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    maxWidth: '90%',
    maxHeight: '80%',
    ...shadows.xl,
  },

  // Modal header
  header: {
    flexDirection: 'row' as ViewStyle['flexDirection'],
    justifyContent: 'space-between' as ViewStyle['justifyContent'],
    alignItems: 'center' as ViewStyle['alignItems'],
    marginBottom: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },

  // Modal title
  title: {
    ...typography.heading.h4,
    color: colors.text.primary,
    flex: 1,
  },

  // Modal body
  body: {
    flex: 1,
    marginBottom: spacing[4],
  },

  // Modal footer
  footer: {
    flexDirection: 'row' as ViewStyle['flexDirection'],
    justifyContent: 'flex-end' as ViewStyle['justifyContent'],
    gap: spacing[2],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
} as const;

// List Component Styles
export const list = {
  // List container
  container: {
    backgroundColor: colors.surface.primary,
  },

  // List item
  item: {
    flexDirection: 'row' as ViewStyle['flexDirection'],
    alignItems: 'center' as ViewStyle['alignItems'],
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    backgroundColor: colors.surface.primary,
  },

  // List item states
  itemPressed: {
    backgroundColor: colors.surface.secondary,
  },

  // List item content
  itemContent: {
    flex: 1,
    marginLeft: spacing[3],
  },

  // List item title
  itemTitle: {
    ...typography.body.medium,
    color: colors.text.primary,
    marginBottom: spacing[0.5],
  },

  // List item subtitle
  itemSubtitle: {
    ...typography.body.small,
    color: colors.text.secondary,
  },

  // List section header
  sectionHeader: {
    backgroundColor: colors.surface.secondary,
    padding: spacing[3],
    paddingHorizontal: spacing[4],
  },

  sectionHeaderText: {
    ...typography.label.small,
    color: colors.text.secondary,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
} as const;

// Tab Bar Component Styles
export const tabBar = {
  // Container
  container: {
    position: 'absolute' as ViewStyle['position'],
    bottom: spacing[6],
    left: spacing[5],
    right: spacing[5],
    alignItems: 'center' as ViewStyle['alignItems'],
  },

  // Tab bar
  bar: {
    flexDirection: 'row' as ViewStyle['flexDirection'],
    backgroundColor: 'transparent',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    gap: spacing[2],
  },

  // Individual tab
  tab: {
    flex: 1,
    alignItems: 'center' as ViewStyle['alignItems'],
    justifyContent: 'center' as ViewStyle['justifyContent'],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.xl,
    minWidth: 60,
    backgroundColor: colors.surface.primary,
    ...shadows.sm,
  },

  // Active tab
  activeTab: {
    backgroundColor: colors.primary,
  },

  // Title container
  titleContainer: {
    position: 'absolute' as ViewStyle['position'],
    backgroundColor: colors.background.blur,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.xl,
    ...shadows.sm,
    alignItems: 'center' as ViewStyle['alignItems'],
  },

  // Title text
  titleText: {
    ...typography.navigation.tab,
    color: colors.primary,
    textAlign: 'center' as TextStyle['textAlign'],
  },
} as const;

// Toast Component Styles
export const toast = {
  // Base toast
  base: {
    flexDirection: 'row' as ViewStyle['flexDirection'],
    alignItems: 'center' as ViewStyle['alignItems'],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing[4],
    marginVertical: spacing[2],
    ...shadows.lg,
  },

  // Toast variants
  variants: {
    success: {
      backgroundColor: colors.status.success,
    },
    error: {
      backgroundColor: colors.status.error,
    },
    warning: {
      backgroundColor: colors.status.warning,
    },
    info: {
      backgroundColor: colors.status.info,
    },
  },

  // Toast text
  text: {
    ...typography.body.medium,
    color: colors.text.inverse,
    flex: 1,
    marginLeft: spacing[2],
  },
} as const;

export type ButtonTheme = typeof button;
export type InputTheme = typeof input;
export type CardTheme = typeof card;
export type ModalTheme = typeof modal;
export type ListTheme = typeof list;
export type TabBarTheme = typeof tabBar;
export type ToastTheme = typeof toast;
