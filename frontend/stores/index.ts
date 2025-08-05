// Export all Zustand stores
export { useAuthStore } from './authStore';
export { usePortfolioStore } from './portfolioStore';
export { useTradingStore } from './tradingStore';

// Re-export types for convenience
export type { User, LoginInput, SignUpInput } from '../apollo/types';
