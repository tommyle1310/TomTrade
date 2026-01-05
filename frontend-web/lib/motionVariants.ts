import { Variants, TargetAndTransition } from 'motion/react';

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Fade in with slight upward movement
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Fade in with slight downward movement
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Scale up animation
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
};

// Slide in from left
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Slide in from right
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Stagger children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Stagger item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
};

// Button hover animation
export const buttonHover: TargetAndTransition = {
  scale: 1.02,
  transition: { duration: 0.15, ease: 'easeOut' as const },
};

export const buttonTap: TargetAndTransition = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// Card hover animation
export const cardHover: TargetAndTransition = {
  y: -2,
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

// Nav item hover
export const navItemHover: TargetAndTransition = {
  x: 4,
  transition: { duration: 0.15, ease: 'easeOut' as const },
};

// Sidebar animation
export const sidebarVariants: Variants = {
  hidden: { x: -240, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

// Page transition
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

// Skeleton pulse animation (for loading states)
export const skeletonPulse = {
  opacity: [0.5, 1, 0.5],
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Notification bell shake
export const bellShake: Variants = {
  idle: { rotate: 0 },
  shake: {
    rotate: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// Reduced motion preference wrapper
export const respectReducedMotion = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };
  }
  return variants;
};
