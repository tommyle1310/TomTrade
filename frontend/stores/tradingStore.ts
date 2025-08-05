import { create } from 'zustand';
import { apolloClient } from '../apollo/client';
import {
  PLACE_ORDER,
  PLACE_STOP_ORDER,
  CANCEL_ORDER,
  GET_STOCKS,
  MY_WATCHLISTS,
  CREATE_WATCHLIST,
  ADD_STOCK_TO_WATCHLIST,
  REMOVE_STOCK_FROM_WATCHLIST,
} from '../apollo/queries';
import {
  PlaceOrderInput,
  PlaceStopOrderInput,
  Stock,
  Watchlist,
  CreateWatchlistInput,
  AddStockToWatchlistInput,
} from '../apollo/types';

interface TradingState {
  // Stocks data
  stocks: Stock[];
  watchlists: Watchlist[];

  // Loading states
  stocksLoading: boolean;
  watchlistsLoading: boolean;
  orderLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchStocks: () => Promise<void>;
  fetchWatchlists: () => Promise<void>;
  placeOrder: (input: PlaceOrderInput) => Promise<void>;
  placeStopOrder: (input: PlaceStopOrderInput) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  createWatchlist: (input: CreateWatchlistInput) => Promise<void>;
  addStockToWatchlist: (input: AddStockToWatchlistInput) => Promise<void>;
  removeStockFromWatchlist: (input: AddStockToWatchlistInput) => Promise<void>;
  clearError: () => void;
}

export const useTradingStore = create<TradingState>((set, get) => ({
  // Initial state
  stocks: [],
  watchlists: [],

  // Loading states
  stocksLoading: false,
  watchlistsLoading: false,
  orderLoading: false,

  error: null,

  // Actions
  fetchStocks: async () => {
    try {
      set({ stocksLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: GET_STOCKS,
        fetchPolicy: 'cache-and-network',
      });

      set({
        stocks: data?.stocks || [],
        stocksLoading: false,
      });
    } catch (error: any) {
      set({
        stocksLoading: false,
        error: error.message || 'Failed to fetch stocks',
      });
    }
  },

  fetchWatchlists: async () => {
    try {
      set({ watchlistsLoading: true, error: null });

      const { data } = await apolloClient.query({
        query: MY_WATCHLISTS,
        fetchPolicy: 'cache-and-network',
      });

      set({
        watchlists: data?.myWatchlists || [],
        watchlistsLoading: false,
      });
    } catch (error: any) {
      set({
        watchlistsLoading: false,
        error: error.message || 'Failed to fetch watchlists',
      });
    }
  },

  placeOrder: async (input: PlaceOrderInput) => {
    try {
      set({ orderLoading: true, error: null });

      await apolloClient.mutate({
        mutation: PLACE_ORDER,
        variables: { input },
        refetchQueries: ['MyOrders', 'GetDashboard', 'GetMyBalance'],
      });

      set({ orderLoading: false });
    } catch (error: any) {
      set({
        orderLoading: false,
        error: error.message || 'Failed to place order',
      });
      throw error;
    }
  },

  placeStopOrder: async (input: PlaceStopOrderInput) => {
    try {
      set({ orderLoading: true, error: null });

      await apolloClient.mutate({
        mutation: PLACE_STOP_ORDER,
        variables: { input },
        refetchQueries: ['MyOrders', 'GetDashboard', 'GetMyBalance'],
      });

      set({ orderLoading: false });
    } catch (error: any) {
      set({
        orderLoading: false,
        error: error.message || 'Failed to place stop order',
      });
      throw error;
    }
  },

  cancelOrder: async (orderId: string) => {
    try {
      set({ orderLoading: true, error: null });

      await apolloClient.mutate({
        mutation: CANCEL_ORDER,
        variables: { orderId },
        refetchQueries: ['MyOrders', 'GetDashboard'],
      });

      set({ orderLoading: false });
    } catch (error: any) {
      set({
        orderLoading: false,
        error: error.message || 'Failed to cancel order',
      });
      throw error;
    }
  },

  createWatchlist: async (input: CreateWatchlistInput) => {
    try {
      set({ watchlistsLoading: true, error: null });

      await apolloClient.mutate({
        mutation: CREATE_WATCHLIST,
        variables: { input },
        refetchQueries: ['MyWatchlists'],
      });

      // Refresh watchlists
      await get().fetchWatchlists();
    } catch (error: any) {
      set({
        watchlistsLoading: false,
        error: error.message || 'Failed to create watchlist',
      });
      throw error;
    }
  },

  addStockToWatchlist: async (input: AddStockToWatchlistInput) => {
    try {
      await apolloClient.mutate({
        mutation: ADD_STOCK_TO_WATCHLIST,
        variables: { input },
        refetchQueries: ['MyWatchlists'],
      });

      // Refresh watchlists
      await get().fetchWatchlists();
    } catch (error: any) {
      set({ error: error.message || 'Failed to add stock to watchlist' });
      throw error;
    }
  },

  removeStockFromWatchlist: async (input: AddStockToWatchlistInput) => {
    try {
      await apolloClient.mutate({
        mutation: REMOVE_STOCK_FROM_WATCHLIST,
        variables: { input },
        refetchQueries: ['MyWatchlists'],
      });

      // Refresh watchlists
      await get().fetchWatchlists();
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove stock from watchlist' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
