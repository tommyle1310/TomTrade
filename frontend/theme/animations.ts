/**
 * Animation System
 * Consistent timing, easing, and animation presets
 */

// Animation Durations (in milliseconds)
export const duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
  slowest: 1000,
} as const;

// Easing Functions
export const easing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Custom cubic-bezier curves
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

// Common Animation Presets
export const animations = {
  // Fade Animations
  fadeIn: {
    duration: duration.normal,
    easing: easing.easeOut,
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    duration: duration.normal,
    easing: easing.easeIn,
    from: { opacity: 1 },
    to: { opacity: 0 },
  },

  // Scale Animations
  scaleIn: {
    duration: duration.fast,
    easing: easing.spring,
    from: { opacity: 0, transform: [{ scale: 0.8 }] },
    to: { opacity: 1, transform: [{ scale: 1 }] },
  },
  scaleOut: {
    duration: duration.fast,
    easing: easing.easeIn,
    from: { opacity: 1, transform: [{ scale: 1 }] },
    to: { opacity: 0, transform: [{ scale: 0.8 }] },
  },

  // Slide Animations
  slideInUp: {
    duration: duration.normal,
    easing: easing.smooth,
    from: { opacity: 0, transform: [{ translateY: 20 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  slideInDown: {
    duration: duration.normal,
    easing: easing.smooth,
    from: { opacity: 0, transform: [{ translateY: -20 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  slideInLeft: {
    duration: duration.normal,
    easing: easing.smooth,
    from: { opacity: 0, transform: [{ translateX: -20 }] },
    to: { opacity: 1, transform: [{ translateX: 0 }] },
  },
  slideInRight: {
    duration: duration.normal,
    easing: easing.smooth,
    from: { opacity: 0, transform: [{ translateX: 20 }] },
    to: { opacity: 1, transform: [{ translateX: 0 }] },
  },

  // Bounce Animation
  bounce: {
    duration: duration.slow,
    easing: easing.bounce,
    from: { transform: [{ scale: 0.3 }] },
    to: { transform: [{ scale: 1 }] },
  },

  // Pulse Animation
  pulse: {
    duration: duration.slow,
    easing: easing.easeInOut,
    from: { opacity: 1 },
    to: { opacity: 0.5 },
    loop: true,
    direction: 'alternate',
  },

  // Shake Animation
  shake: {
    duration: duration.slow,
    easing: easing.easeInOut,
    keyframes: [
      { transform: [{ translateX: 0 }] },
      { transform: [{ translateX: -10 }] },
      { transform: [{ translateX: 10 }] },
      { transform: [{ translateX: -10 }] },
      { transform: [{ translateX: 10 }] },
      { transform: [{ translateX: 0 }] },
    ],
  },

  // Tab Bar Specific Animations
  tabPress: {
    duration: duration.fast,
    easing: easing.spring,
    from: { transform: [{ scale: 1 }] },
    to: { transform: [{ scale: 0.95 }] },
  },
  tabRelease: {
    duration: duration.fast,
    easing: easing.spring,
    from: { transform: [{ scale: 0.95 }] },
    to: { transform: [{ scale: 1 }] },
  },

  // Modal Animations
  modalSlideUp: {
    duration: duration.normal,
    easing: easing.smooth,
    from: { opacity: 0, transform: [{ translateY: 100 }] },
    to: { opacity: 1, transform: [{ translateY: 0 }] },
  },
  modalSlideDown: {
    duration: duration.normal,
    easing: easing.smooth,
    from: { opacity: 1, transform: [{ translateY: 0 }] },
    to: { opacity: 0, transform: [{ translateY: 100 }] },
  },

  // Loading Animations
  spin: {
    duration: duration.slowest,
    easing: easing.linear,
    from: { transform: [{ rotate: '0deg' }] },
    to: { transform: [{ rotate: '360deg' }] },
    loop: true,
  },

  // Button Animations
  buttonPress: {
    duration: duration.fast,
    easing: easing.easeOut,
    from: { transform: [{ scale: 1 }], opacity: 1 },
    to: { transform: [{ scale: 0.98 }], opacity: 0.8 },
  },
  buttonRelease: {
    duration: duration.fast,
    easing: easing.spring,
    from: { transform: [{ scale: 0.98 }], opacity: 0.8 },
    to: { transform: [{ scale: 1 }], opacity: 1 },
  },
} as const;

// Transition Presets
export const transitions = {
  // Screen Transitions
  screen: {
    duration: duration.normal,
    easing: easing.smooth,
  },

  // Modal Transitions
  modal: {
    duration: duration.normal,
    easing: easing.emphasized,
  },

  // Tab Transitions
  tab: {
    duration: duration.fast,
    easing: easing.spring,
  },

  // Overlay Transitions
  overlay: {
    duration: duration.normal,
    easing: easing.easeOut,
  },

  // Toast Transitions
  toast: {
    duration: duration.fast,
    easing: easing.smooth,
  },
} as const;

// Animation Utilities
export const animationUtils = {
  // Create a spring animation config
  spring: (tension = 300, friction = 30) => ({
    type: 'spring',
    tension,
    friction,
    useNativeDriver: true,
  }),

  // Create a timing animation config
  timing: (duration: number, easing: string = easing.smooth) => ({
    type: 'timing',
    duration,
    easing,
    useNativeDriver: true,
  }),

  // Create a sequence of animations
  sequence: (animations: any[]) => ({
    type: 'sequence',
    animations,
  }),

  // Create parallel animations
  parallel: (animations: any[]) => ({
    type: 'parallel',
    animations,
  }),

  // Create a loop animation
  loop: (animation: any, iterations = -1) => ({
    type: 'loop',
    animation,
    iterations,
  }),
} as const;

export type Duration = typeof duration;
export type Easing = typeof easing;
export type Animations = typeof animations;
export type Transitions = typeof transitions;
export type AnimationUtils = typeof animationUtils;
