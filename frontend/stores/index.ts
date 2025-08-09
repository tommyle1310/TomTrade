// Export all Zustand stores
export { useAuthStore } from './authStore';
export { usePortfolioStore } from './portfolioStore';
export { useTradingStore } from './tradingStore';
export { useUserStore } from './userStore';

// Re-export types for convenience
export type { User, LoginInput, SignUpInput } from '../apollo/types';
