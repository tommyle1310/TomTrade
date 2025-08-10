import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL ||
  'localhost';
const backendPort =
  process.env.EXPO_PUBLIC_BACKEND_PORT ||
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_PORT ||
  '4000';

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
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

    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log(
        '🔑 Token from AsyncStorage:',
        token ? `${token.substring(0, 20)}...` : 'No token found'
      );

      if (!token) {
        throw new Error('No access token found');
      }

      // Disconnect existing socket if any
      if (this.socket) {
        this.socket.disconnect();
      }

      // Create new socket connection
      this.socket = io(`http://${backendUrl}:${backendPort}`, {
        auth: {
          token: `Bearer ${token}`,
        },
        extraHeaders: {
          auth: `Bearer ${token}`,
          Authorization: `Bearer ${token}`,
        },
        transports: ['websocket'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        forceNew: true,
        autoConnect: false,
      });

      // Set up connection event handlers
      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id);
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
        });
        this.isConnecting = false;
      });

      this.socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
        this.isConnecting = false;
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Socket reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Socket reconnection failed');
        this.isConnecting = false;
      });

      this.socket.on('connectionTest', (data) => {
        console.log('✅ Connection test received:', data);
      });

      // Listen for market data updates
      this.socket.on('marketDataUpdate', (data) => {
        console.log('📊 Market data update received:', data);
        // You can emit a custom event here to notify other parts of the app
        // EventEmitter.emit('marketDataUpdate', data);
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

      return this.socket;
    } catch (error) {
      console.error('Failed to connect socket:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Emit events to server
  requestPortfolioUpdate(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('requestPortfolioUpdate', { userId });
    }
  }

  sendMockMarketData(ticker: string, price: number) {
    if (this.socket?.connected) {
      this.socket.emit('mockMarketData', { ticker, price });
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
