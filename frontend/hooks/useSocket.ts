import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores';

// Types for socket events
export interface PriceAlert {
  alert: {
    id: string;
    ticker: string;
    ruleType: string;
    targetValue: number;
    createdAt: string;
  };
  currentPrice: number;
  message: string;
}

export interface OrderNotification {
  type: 'ORDER_FILLED' | 'ORDER_PARTIAL' | 'ORDER_CANCELLED';
  orderId: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  message: string;
}

export interface PortfolioUpdate {
  totalValue: number;
  totalPnL: number;
  positions: Array<{
    ticker: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    marketValue: number;
    unrealizedPnL: number;
    pnlPercentage: number;
  }>;
}

export interface BalanceUpdate {
  balance: number;
  totalAssets: number;
}

interface UseSocketOptions {
  onPriceAlert?: (data: PriceAlert) => void;
  onOrderNotification?: (data: OrderNotification) => void;
  onPortfolioUpdate?: (data: PortfolioUpdate) => void;
  onBalanceUpdate?: (data: BalanceUpdate) => void;
  onConnectionTest?: (data: any) => void;
  autoConnect?: boolean;
}

export const useSocket = (options: UseSocketOptions = {}) => {
  const {
    onPriceAlert,
    onOrderNotification,
    onPortfolioUpdate,
    onBalanceUpdate,
    onConnectionTest,
    autoConnect = true,
  } = options;

  const { user, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const listenersSetupRef = useRef(false);

  const setupEventListeners = useCallback(
    (socket: Socket) => {
      if (listenersSetupRef.current) return;

      // Price alerts
      socket.on('priceAlert', (data: PriceAlert) => {
        console.log('📢 Price alert received:', data);
        onPriceAlert?.(data);
      });

      // Order notifications
      socket.on('orderNotification', (data: OrderNotification) => {
        console.log('🔔 Order notification received:', data);
        onOrderNotification?.(data);
      });

      // Portfolio updates
      socket.on('portfolioUpdate', (data: PortfolioUpdate) => {
        console.log('📊 Portfolio update received:', data);
        onPortfolioUpdate?.(data);
      });

      // Balance updates
      socket.on('balanceUpdate', (data: BalanceUpdate) => {
        console.log('💰 Balance update received:', data);
        onBalanceUpdate?.(data);
      });

      // Connection test
      socket.on('connectionTest', (data: any) => {
        console.log('✅ Connection test received:', data);
        onConnectionTest?.(data);
      });

      listenersSetupRef.current = true;
    },
    [
      onPriceAlert,
      onOrderNotification,
      onPortfolioUpdate,
      onBalanceUpdate,
      onConnectionTest,
    ]
  );

  const connect = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('❌ Cannot connect socket: user not authenticated');
      return null;
    }

    try {
      const socket = await socketService.connect();
      socketRef.current = socket;
      setupEventListeners(socket);
      return socket;
    } catch (error) {
      console.error('❌ Failed to connect socket:', error);
      return null;
    }
  }, [isAuthenticated, user, setupEventListeners]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    socketRef.current = null;
    listenersSetupRef.current = false;
  }, []);

  const requestPortfolioUpdate = useCallback(() => {
    if (user?.id) {
      socketService.requestPortfolioUpdate(user.id);
    }
  }, [user?.id]);

  const sendMockMarketData = useCallback((ticker: string, price: number) => {
    socketService.sendMockMarketData(ticker, price);
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (
      autoConnect &&
      isAuthenticated &&
      user &&
      !socketRef.current?.connected
    ) {
      connect();
    }

    return () => {
      if (!autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, isAuthenticated, user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    isConnected: socketService.isConnected(),
    connect,
    disconnect,
    requestPortfolioUpdate,
    sendMockMarketData,
  };
};
