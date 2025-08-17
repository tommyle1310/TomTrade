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
        console.log('🔍 Portfolio update data type:', typeof data);
        console.log('🔍 Portfolio update data keys:', Object.keys(data));
        console.log('🔍 Portfolio update totalValue:', data.totalValue);
        // CRITICAL FIX: Ensure portfolio updates trigger immediate UI refresh
        onPortfolioUpdate?.(data);
      });

      // Balance updates
      socket.on('balanceUpdate', (data: BalanceUpdate) => {
        console.log('💰 Balance update received:', data);
        // CRITICAL FIX: Ensure balance updates trigger immediate UI refresh
        onBalanceUpdate?.(data);
      });

      // Connection test
      socket.on('connectionTest', (data: any) => {
        console.log('✅ Connection test received:', data);
        onConnectionTest?.(data);
      });

      // CRITICAL FIX: Listen for connection status changes
      socket.on('connect', () => {
        console.log('🔍 Socket connect event received in useSocket hook');
        console.log('✅ Socket connected in useSocket hook');
        setConnectionStatus('connected');
      });

      socket.on('disconnect', (reason) => {
        console.log('🔍 Socket disconnect event received in useSocket hook');
        console.log('❌ Socket disconnected in useSocket hook:', reason);
        setConnectionStatus('disconnected');
      });

      socket.on('connect_error', (error) => {
        console.log('🔍 Socket connect_error event received in useSocket hook');
        console.error('❌ Socket connection error in useSocket hook:', error);
        setConnectionStatus('error');
      });

      listenersSetupRef.current = true;
      console.log('✅ Socket event listeners set up successfully');
      console.log('🔍 Event listeners configured for:', {
        onPriceAlert: !!onPriceAlert,
        onOrderNotification: !!onOrderNotification,
        onPortfolioUpdate: !!onPortfolioUpdate,
        onBalanceUpdate: !!onBalanceUpdate,
        onConnectionTest: !!onConnectionTest,
      });
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
    console.log('🔍 connect function called');
    console.log('🔍 Authentication check - isAuthenticated:', isAuthenticated, 'user:', !!user);
    
    if (!isAuthenticated || !user) {
      console.log('❌ Cannot connect socket: user not authenticated');
      return null;
    }

    try {
      console.log('🔌 Attempting to connect socket...');
      const socket = await socketService.connect();
      console.log('🔍 Socket connection successful, setting up event listeners...');
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
    console.log('🔍 disconnect function called');
    console.log('🔌 Disconnecting socket in useSocket hook...');
    socketService.disconnect();
    socketRef.current = null;
    listenersSetupRef.current = false;
    setConnectionStatus('disconnected');
    console.log('🔍 Socket disconnection completed');
  }, []);

  const requestPortfolioUpdate = useCallback(() => {
    if (user?.id) {
      console.log(`📊 Requesting portfolio update for user: ${user.id}`);
      socketService.requestPortfolioUpdate(user.id);
    } else {
      console.log('❌ No user ID available for portfolio update request');
    }
  }, [user?.id]);

  // CRITICAL FIX: Add method to request portfolio update with current market prices
  const requestPortfolioUpdateWithCurrentPrices = useCallback(() => {
    if (user?.id) {
      console.log(
        `📊 Requesting portfolio update with current prices for user: ${user.id}`
      );
      console.log('🔍 Calling socketService.requestPortfolioUpdateWithCurrentPrices');
      socketService.requestPortfolioUpdateWithCurrentPrices?.(user.id);
      console.log('✅ socketService.requestPortfolioUpdateWithCurrentPrices called');
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
    console.log('🔍 useEffect [autoConnect, isAuthenticated, user, connect, disconnect] triggered');
    console.log('🔍 Auto-connect check - autoConnect:', autoConnect, 'isAuthenticated:', isAuthenticated, 'user:', !!user, 'socketRef.current?.connected:', socketRef.current?.connected);
    
    if (
      autoConnect &&
      isAuthenticated &&
      user &&
      !socketRef.current?.connected
    ) {
      console.log('🔄 Auto-connecting socket...');
      connect();
    } else {
      console.log('🔍 Auto-connect conditions not met, skipping connection');
    }

    return () => {
      if (!autoConnect) {
        console.log('🔍 Auto-connect disabled, disconnecting on cleanup...');
        disconnect();
      }
    };
  }, [autoConnect, isAuthenticated, user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    console.log('🔍 useEffect [] triggered (cleanup on unmount)');
    return () => {
      console.log('🔍 useSocket hook unmounting, disconnecting socket...');
      disconnect();
    };
  }, [disconnect]);

  // CRITICAL FIX: Return connection status
  console.log('🔍 useSocket hook returning values');
  const returnValue = {
    socket: socketRef.current,
    isConnected: socketService.isConnected(),
    connectionStatus: connectionStatus,
    connect,
    disconnect,
    requestPortfolioUpdate,
    requestPortfolioUpdateWithCurrentPrices,
    sendMockMarketData,
  };
  console.log('🔍 useSocket hook return value:', {
    socket: !!returnValue.socket,
    isConnected: returnValue.isConnected,
    connectionStatus: returnValue.connectionStatus,
  });
  return returnValue;
};
