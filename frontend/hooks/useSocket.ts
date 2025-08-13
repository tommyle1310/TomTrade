import { useEffect, useRef, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../services/socketService';
import { useAuthStore } from '../stores';

// Types for socket events
export interface PriceAlert {
  alert: {
    id: string;
    ticker: string;
    ruleId: string;
    userId: string;
    sentAt: string;
    deliveryMethod: string;
  };
  currentPrice: number;
  message: string;
  createdAt: string;
}

export interface OrderNotification {
  type: 'ORDER_FILLED' | 'ORDER_PARTIAL' | 'ORDER_CANCELLED';
  orderId: string;
  ticker: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  message: string;
  createdAt: string;
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
  createdAt: string;
}

export interface BalanceUpdate {
  balance: number;
  totalAssets: number;
  createdAt: string;
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
  const [connectionStatus, setConnectionStatus] =
    useState<string>('disconnected');

  const setupEventListeners = useCallback(
    (socket: Socket) => {
      if (listenersSetupRef.current) {
        console.log('⚠️ Event listeners already set up, skipping...');
        return;
      }

      console.log('🔧 Setting up socket event listeners...');

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

      // CRITICAL FIX: Listen for connection status changes
      socket.on('connect', () => {
        console.log('✅ Socket connected in useSocket hook');
        setConnectionStatus('connected');
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected in useSocket hook:', reason);
        setConnectionStatus('disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error in useSocket hook:', error);
        setConnectionStatus('error');
      });

      listenersSetupRef.current = true;
      console.log('✅ Socket event listeners set up successfully');
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
      console.log('🔌 Attempting to connect socket...');
      const socket = await socketService.connect();
      socketRef.current = socket;
      setupEventListeners(socket);
      setConnectionStatus('connected');
      console.log('✅ Socket connected successfully in useSocket hook');
      return socket;
    } catch (error) {
      console.error('❌ Failed to connect socket in useSocket hook:', error);
      setConnectionStatus('error');
      return null;
    }
  }, [isAuthenticated, user, setupEventListeners]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting socket in useSocket hook...');
    socketService.disconnect();
    socketRef.current = null;
    listenersSetupRef.current = false;
    setConnectionStatus('disconnected');
  }, []);

  const requestPortfolioUpdate = useCallback(() => {
    if (user?.id) {
      console.log(`📊 Requesting portfolio update for user: ${user.id}`);
      socketService.requestPortfolioUpdate(user.id);
    } else {
      console.log('❌ No user ID available for portfolio update request');
    }
  }, [user?.id]);

  const sendMockMarketData = useCallback((ticker: string, price: number) => {
    console.log(`📊 Sending mock market data: ${ticker} @ $${price}`);
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
      console.log('🔄 Auto-connecting socket...');
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

  // CRITICAL FIX: Return connection status
  return {
    socket: socketRef.current,
    isConnected: socketService.isConnected(),
    connectionStatus: connectionStatus,
    connect,
    disconnect,
    requestPortfolioUpdate,
    sendMockMarketData,
  };
};
