import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  '127.0.0.1'; // CRITICAL FIX: Use 127.0.0.1 instead of localhost
const backendPort =
  process.env.EXPO_PUBLIC_BACKEND_PORT ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_PORT ||
  '4000';

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionStatus = 'disconnected'; // CRITICAL FIX: Track connection status

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('⏳ Socket connection already in progress...');
      // Wait for existing connection attempt
      return new Promise((resolve, reject) => {
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve(this.socket);
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    this.isConnecting = true;
    this.connectionStatus = 'connecting';

    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log(
        '🔑 Token from AsyncStorage:',
        token ? `${token.substring(0, 20)}...` : 'No token found'
      );

      if (!token) {
        console.log(
          '⚠️ No access token found, connecting without authentication'
        );
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      const socketUrl = `http://${backendUrl}:${backendPort}`;
      console.log(`🔌 Connecting to socket server: ${socketUrl}`);

      // Create new socket connection
      this.socket = io(socketUrl, {
        auth: token ? { token: `Bearer ${token}` } : undefined,
        extraHeaders: token
          ? {
              auth: `Bearer ${token}`,
              Authorization: `Bearer ${token}`,
            }
          : undefined,
        transports: ['websocket', 'polling'], // CRITICAL FIX: Allow fallback to polling
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        forceNew: true,
        autoConnect: false,
      });

      // Set up connection event handlers
      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully:', this.socket?.id);
        this.isConnecting = false;
        this.connectionStatus = 'connected';
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        this.isConnecting = false;
        this.connectionStatus = 'disconnected';
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
        });
        this.isConnecting = false;
        this.connectionStatus = 'error';
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        this.isConnecting = false;
        this.connectionStatus = 'error';
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        this.connectionStatus = 'connected';
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Socket reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Socket reconnection failed');
        this.isConnecting = false;
        this.connectionStatus = 'failed';
      });

      // CRITICAL FIX: Listen for all socket events and log them
      this.socket.on('connectionTest', (data) => {
        console.log('✅ Connection test received:', data);
      });

      // Listen for market data updates
      this.socket.on('marketDataUpdate', (data) => {
        console.log('📊 Market data update received:', data);
      });

      // Listen for portfolio updates
      this.socket.on('portfolioUpdate', (data) => {
        console.log('📊 Portfolio update received:', data);
      });

      // Listen for balance updates
      this.socket.on('balanceUpdate', (data) => {
        console.log('💰 Balance update received:', data);
      });

      // Listen for order notifications
      this.socket.on('orderNotification', (data) => {
        console.log('🔔 Order notification received:', data);
      });

      // Listen for price alerts
      this.socket.on('priceAlert', (data) => {
        console.log('🚨 Price alert received:', data);
      });

      // Connect manually since autoConnect is false
      this.socket.connect();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 20000);

        const onConnect = () => {
          clearTimeout(timeout);
          this.socket!.off('connect', onConnect);
          this.socket!.off('connect_error', onError);
          resolve();
        };

        const onError = (error: any) => {
          clearTimeout(timeout);
          this.socket!.off('connect', onConnect);
          this.socket!.off('connect_error', onError);
          reject(error);
        };

        this.socket!.on('connect', onConnect);
        this.socket!.on('connect_error', onError);
      });

      console.log('✅ Socket connection established successfully');
      return this.socket;
    } catch (error) {
      console.error('❌ Failed to connect socket:', error);
      this.connectionStatus = 'error';
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = 'disconnected';
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    const connected = this.socket?.connected || false;
    console.log(
      `🔍 Socket connection status: ${connected ? 'connected' : 'disconnected'}`
    );
    return connected;
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  // Emit events to server
  requestPortfolioUpdate(userId: string) {
    if (this.socket?.connected) {
      console.log(`📊 Requesting portfolio update for user: ${userId}`);
      this.socket.emit('requestPortfolioUpdate', { userId });
    } else {
      console.log('❌ Socket not connected, cannot request portfolio update');
    }
  }

  // CRITICAL FIX: Add method to request portfolio update with current market prices
  requestPortfolioUpdateWithCurrentPrices(userId: string) {
    if (this.socket?.connected) {
      console.log(
        `📊 Requesting portfolio update with current prices for user: ${userId}`
      );
      this.socket.emit('requestPortfolioUpdate', {
        userId,
        useCurrentPrices: true,
      });
    } else {
      console.log('❌ Socket not connected, cannot request portfolio update');
    }
  }

  sendMockMarketData(ticker: string, price: number) {
    if (this.socket?.connected) {
      console.log(`📊 Sending mock market data: ${ticker} @ $${price}`);
      this.socket.emit('mockMarketData', { ticker, price });
    } else {
      console.log('❌ Socket not connected, cannot send mock market data');
    }
  }

  // Test methods for debugging
  testConnection() {
    if (this.socket?.connected) {
      console.log('🧪 Testing connection...');
      this.socket.emit('test', { message: 'Hello from frontend!' });

      // Listen for test response
      this.socket.once('testResponse', (data) => {
        console.log('✅ Test response received:', data);
      });
    } else {
      console.log('❌ Socket not connected for testing');
    }
  }

  pingServer() {
    if (this.socket?.connected) {
      console.log('🏓 Pinging server...');
      this.socket.emit('ping');

      // Listen for pong response
      this.socket.once('pong', (data) => {
        console.log('🏓 Pong received:', data);
      });
    } else {
      console.log('❌ Socket not connected for ping');
    }
  }
}

export const socketService = new SocketService();
