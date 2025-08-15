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

  // CRITICAL FIX: Add flag to track if data is from socket (real-time)
  lastSocketUpdate: number; // timestamp of last socket update
  isDataFromSocket: boolean; // flag to prevent GraphQL override

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

  // CRITICAL FIX: Add flag to track if data is from socket (real-time)
  lastSocketUpdate: 0, // timestamp of last socket update
  isDataFromSocket: false, // flag to prevent GraphQL override

  // Actions
  fetchDashboard: async () => {
    try {
      set({ dashboardLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: GET_DASHBOARD,
        fetchPolicy: 'no-cache', // Always fetch fresh data
      });

      // CRITICAL FIX: Only update if no recent socket update (within 10 seconds)
      const currentTime = Date.now();
      const { lastSocketUpdate, isDataFromSocket } = get();

      if (isDataFromSocket && currentTime - lastSocketUpdate < 10000) {
        console.log(
          '🔄 Skipping GraphQL dashboard update - recent socket data available (within 10s)'
        );
        set({ dashboardLoading: false });
        return;
      }

      console.log('🔄 GraphQL dashboard update - no recent socket data');
      set({
        dashboard: data?.getDashboard || null,
        dashboardLoading: false,
        isDataFromSocket: false, // Mark as GraphQL data
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

      // CRITICAL FIX: Only update if no recent socket update (within 10 seconds)
      const currentTime = Date.now();
      const { lastSocketUpdate, isDataFromSocket } = get();

      if (isDataFromSocket && currentTime - lastSocketUpdate < 10000) {
        console.log(
          '🔄 Skipping GraphQL balance update - recent socket data available (within 10s)'
        );
        return;
      }

      console.log('🔄 GraphQL balance update - no recent socket data');
      set({
        balance: data?.getMyBalance || 0,
        isDataFromSocket: false, // Mark as GraphQL data
      });
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

    // CRITICAL FIX: Force refresh by clearing socket flags first
    console.log('🔄 Force refresh - clearing socket flags');
    set({
      isDataFromSocket: false,
      lastSocketUpdate: 0,
    });

    // CRITICAL FIX: Clear ALL Apollo cache to ensure fresh data
    console.log('🔄 Clearing Apollo cache...');
    apolloClient.cache.reset();
    apolloClient.cache.gc();

    // CRITICAL FIX: Add a small delay to ensure cache is cleared
    await new Promise((resolve) => setTimeout(resolve, 100));

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
  setDashboard: (dashboard: DashboardResult) => {
    console.log('📊 Socket dashboard update:', dashboard);

    // CRITICAL FIX: Clear Apollo cache to ensure fresh GraphQL data
    apolloClient.cache.evict({ fieldName: 'getDashboard' });
    apolloClient.cache.gc();

    set({
      dashboard,
      isDataFromSocket: true,
      lastSocketUpdate: Date.now(),
    });
  },
  setBalance: (balance: number) => {
    console.log('💰 Socket balance update:', balance);

    // CRITICAL FIX: Clear Apollo cache to ensure fresh GraphQL data
    apolloClient.cache.evict({ fieldName: 'getMyBalance' });
    apolloClient.cache.gc();

    set({
      balance,
      isDataFromSocket: true,
      lastSocketUpdate: Date.now(),
    });
  },
}));
