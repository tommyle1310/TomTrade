import { create } from 'zustand';
import { FetchPolicy } from '@apollo/client';
import { apolloClient } from '../apollo/client';
import {
  GET_DASHBOARD,
  GET_MY_BALANCE,
  MY_PORTFOLIO,
  MY_TRANSACTIONS,
  MY_ORDERS,
} from '../apollo/queries';
import {
  DashboardResult,
  Portfolio,
  Transaction,
  Order,
} from '../apollo/types';

interface PortfolioState {
  // Dashboard data
  dashboard: DashboardResult | null;
  balance: number;

  // Portfolio data
  portfolio: Portfolio[];
  transactions: Transaction[];
  orders: Order[];

  // Loading states
  dashboardLoading: boolean;
  portfolioLoading: boolean;
  transactionsLoading: boolean;
  ordersLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchBalance: () => Promise<void>;
  fetchPortfolio: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;

  // Real-time update actions
  setDashboard: (dashboard: DashboardResult) => void;
  setBalance: (balance: number) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  // Initial state
  dashboard: null,
  balance: 0,
  portfolio: [],
  transactions: [],
  orders: [],

  // Loading states
  dashboardLoading: false,
  portfolioLoading: false,
  transactionsLoading: false,
  ordersLoading: false,

  error: null,

  // Actions
  fetchDashboard: async () => {
    try {
      set({ dashboardLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: GET_DASHBOARD,
        fetchPolicy: 'no-cache', // Always fetch fresh data
      });

      set({
        dashboard: data?.getDashboard || null,
        dashboardLoading: false,
      });
    } catch (error: any) {
      set({
        dashboardLoading: false,
        error: error.message || 'Failed to fetch dashboard',
      });
    }
  },

  fetchBalance: async () => {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_BALANCE,
        fetchPolicy: 'no-cache', // Always fetch fresh data
      });

      set({ balance: data?.getMyBalance || 0 });
    } catch (error: any) {
      console.error('Balance fetch error:', error);
    }
  },

  fetchPortfolio: async () => {
    try {
      set({ portfolioLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: MY_PORTFOLIO,
        fetchPolicy: 'no-cache',
      });

      set({
        portfolio: data?.myPortfolio || [],
        portfolioLoading: false,
      });
    } catch (error: any) {
      set({
        portfolioLoading: false,
        error: error.message || 'Failed to fetch portfolio',
      });
    }
  },

  fetchTransactions: async () => {
    try {
      set({ transactionsLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: MY_TRANSACTIONS,
        fetchPolicy: 'no-cache',
      });

      set({
        transactions: data?.myTransactions || [],
        transactionsLoading: false,
      });
    } catch (error: any) {
      set({
        transactionsLoading: false,
        error: error.message || 'Failed to fetch transactions',
      });
    }
  },

  fetchOrders: async () => {
    try {
      set({ ordersLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: MY_ORDERS,
        fetchPolicy: 'no-cache',
      });

      set({
        orders: data?.myOrders || [],
        ordersLoading: false,
      });
    } catch (error: any) {
      set({
        ordersLoading: false,
        error: error.message || 'Failed to fetch orders',
      });
    }
  },

  refreshAll: async () => {
    const {
      fetchDashboard,
      fetchBalance,
      fetchPortfolio,
      fetchTransactions,
      fetchOrders,
    } = get();

    await Promise.all([
      fetchDashboard(),
      fetchBalance(),
      fetchPortfolio(),
      fetchTransactions(),
      fetchOrders(),
    ]);
  },

  clearError: () => set({ error: null }),

  // Real-time update actions
  setDashboard: (dashboard: DashboardResult) => set({ dashboard }),
  setBalance: (balance: number) => set({ balance }),
}));
