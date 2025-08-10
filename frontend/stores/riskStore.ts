import { create } from 'zustand';
import { apolloClient } from '../apollo/client';
import {
  GET_RISK_CONFIG,
  GET_RISK_REPORT,
  UPDATE_RISK_CONFIG,
  VALIDATE_POSITION_SIZE,
  VALIDATE_RISK_PER_TRADE,
  VALIDATE_PORTFOLIO_RISK,
  CALCULATE_RECOMMENDED_STOP_LOSS,
} from '../apollo/queries';
import {
  RiskConfig,
  RiskReport,
  UpdateRiskConfigInput,
  PositionValidation,
  RiskValidation,
} from '../apollo/types';

interface RiskState {
  // Risk data
  riskConfig: RiskConfig | null;
  riskReport: RiskReport | null;

  // Loading states
  configLoading: boolean;
  reportLoading: boolean;
  updateLoading: boolean;
  validationLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchRiskConfig: () => Promise<void>;
  fetchRiskReport: () => Promise<void>;
  updateRiskConfig: (input: UpdateRiskConfigInput) => Promise<void>;
  validatePositionSize: (
    ticker: string,
    quantity: number,
    price: number
  ) => Promise<PositionValidation>;
  validateRiskPerTrade: (
    ticker: string,
    quantity: number,
    price: number,
    stopLossPrice?: number
  ) => Promise<RiskValidation>;
  validatePortfolioRisk: () => Promise<RiskValidation>;
  calculateRecommendedStopLoss: (
    ticker: string,
    entryPrice: number,
    side: 'BUY' | 'SELL'
  ) => Promise<number>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
}

export const useRiskStore = create<RiskState>((set, get) => ({
  // Initial state
  riskConfig: null,
  riskReport: null,

  // Loading states
  configLoading: false,
  reportLoading: false,
  updateLoading: false,
  validationLoading: false,

  error: null,

  // Actions
  fetchRiskConfig: async () => {
    try {
      set({ configLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: GET_RISK_CONFIG,
        fetchPolicy: 'cache-first',
      });

      set({
        riskConfig: data?.getRiskConfig || null,
        configLoading: false,
      });
    } catch (error: any) {
      set({
        configLoading: false,
        error: error.message || 'Failed to fetch risk configuration',
      });
    }
  },

  fetchRiskReport: async () => {
    try {
      set({ reportLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: GET_RISK_REPORT,
        fetchPolicy: 'no-cache', // Always fetch fresh data
      });

      set({
        riskReport: data?.getRiskReport || null,
        reportLoading: false,
      });
    } catch (error: any) {
      set({
        reportLoading: false,
        error: error.message || 'Failed to fetch risk report',
      });
    }
  },

  updateRiskConfig: async (input: UpdateRiskConfigInput) => {
    try {
      set({ updateLoading: true, error: null });

      const { data } = await apolloClient.mutate({
        mutation: UPDATE_RISK_CONFIG,
        variables: { input },
        refetchQueries: ['GetRiskConfig', 'GetRiskReport'],
      });

      set({
        riskConfig: data?.updateRiskConfig || null,
        updateLoading: false,
      });

      // Refresh risk report to get updated calculations
      get().fetchRiskReport();
    } catch (error: any) {
      set({
        updateLoading: false,
        error: error.message || 'Failed to update risk configuration',
      });
      throw error;
    }
  },

  validatePositionSize: async (
    ticker: string,
    quantity: number,
    price: number
  ): Promise<PositionValidation> => {
    try {
      set({ validationLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: VALIDATE_POSITION_SIZE,
        variables: { ticker, quantity, price },
        fetchPolicy: 'no-cache',
      });

      set({ validationLoading: false });
      return (
        data?.validatePositionSize || {
          isValid: false,
          message: 'Validation failed',
        }
      );
    } catch (error: any) {
      set({
        validationLoading: false,
        error: error.message || 'Failed to validate position size',
      });
      return { isValid: false, message: error.message || 'Validation failed' };
    }
  },

  validateRiskPerTrade: async (
    ticker: string,
    quantity: number,
    price: number,
    stopLossPrice?: number
  ): Promise<RiskValidation> => {
    try {
      set({ validationLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: VALIDATE_RISK_PER_TRADE,
        variables: { ticker, quantity, price, stopLossPrice },
        fetchPolicy: 'no-cache',
      });

      set({ validationLoading: false });
      return (
        data?.validateRiskPerTrade || {
          isValid: false,
          message: 'Validation failed',
        }
      );
    } catch (error: any) {
      set({
        validationLoading: false,
        error: error.message || 'Failed to validate trade risk',
      });
      return { isValid: false, message: error.message || 'Validation failed' };
    }
  },

  validatePortfolioRisk: async (): Promise<RiskValidation> => {
    try {
      set({ validationLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: VALIDATE_PORTFOLIO_RISK,
        fetchPolicy: 'no-cache',
      });

      set({ validationLoading: false });
      return (
        data?.validatePortfolioRisk || {
          isValid: false,
          message: 'Validation failed',
        }
      );
    } catch (error: any) {
      set({
        validationLoading: false,
        error: error.message || 'Failed to validate portfolio risk',
      });
      return { isValid: false, message: error.message || 'Validation failed' };
    }
  },

  calculateRecommendedStopLoss: async (
    ticker: string,
    entryPrice: number,
    side: 'BUY' | 'SELL'
  ): Promise<number> => {
    try {
      const { data } = await apolloClient.query({
        query: CALCULATE_RECOMMENDED_STOP_LOSS,
        variables: { ticker, entryPrice, side },
        fetchPolicy: 'no-cache',
      });

      return data?.calculateRecommendedStopLoss || 0;
    } catch (error: any) {
      console.error('Failed to calculate recommended stop loss:', error);
      return 0;
    }
  },

  refreshAll: async () => {
    await Promise.all([get().fetchRiskConfig(), get().fetchRiskReport()]);
  },

  clearError: () => {
    set({ error: null });
  },
}));
