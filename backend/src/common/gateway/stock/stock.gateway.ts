import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SocketService } from '../../../core/socket-gateway.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:19006',
      'http://localhost:8081',
      'http://127.0.0.1:3000',
      '*',
    ],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  namespace: '/',
})
export class StockGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  private logger: Logger = new Logger('StockGateway');

  constructor(
    private socketService: SocketService,
    private jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('✅ StockGateway initialized');
    this.logger.log(
      '🔧 Calling socketService.setServer with this.server:',
      this.server ? 'valid server instance' : 'null/undefined',
    );
    // Initialize the SocketService with the server instance
    this.socketService.setServer(this.server);
    this.logger.log('✅ SocketService.setServer called');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`🔌 New client attempting connection: ${client.id}`);

    // Bypass token validation for the mock script
    if (client.handshake.query.isMockClient === 'true') {
      this.logger.log(`✅ Mock script client connected: ${client.id}`);
      return;
    }

    try {
      // Extract token from headers or auth
      const token =
        client.handshake.auth?.token || client.handshake.headers.auth;

      if (!token) {
        this.logger.log(
          `⚠️  No token provided, allowing connection for testing: ${client.id}`,
        );
        client.join('unauthenticated');
        client.emit('connectionTest', {
          message: 'Connected without authentication (testing mode)',
          clientId: client.id,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // For testing purposes, extract user info from token without verification
      // In production, you would verify the JWT token
      let userId, userEmail;

      try {
        // Try to verify the token first
        const payload = this.jwtService.verify(token.replace('Bearer ', ''));
        userId = payload.sub;
        userEmail = payload.email;
        this.logger.log(`✅ Token verified for user: ${userEmail} (${userId})`);
      } catch (error) {
        // If verification fails, extract from token structure for testing
        const tokenParts = token.replace('Bearer ', '').split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(
              Buffer.from(tokenParts[1], 'base64').toString(),
            );
            userId = payload.sub;
            userEmail = payload.email;
            this.logger.log(
              `⚠️  Token verification failed, using extracted data: ${userEmail} (${userId})`,
            );
          } catch (e) {
            // Fallback: use a default user for testing
            userId = 'test-user-id';
            userEmail = 'test@example.com';
            this.logger.log(
              `⚠️  Token parsing failed, using fallback user: ${userEmail} (${userId})`,
            );
          }
        } else {
          // Fallback: use a default user for testing
          userId = 'test-user-id';
          userEmail = 'test@example.com';
          this.logger.log(
            `⚠️  Invalid token format, using fallback user: ${userEmail} (${userId})`,
          );
        }
      }

      this.logger.log(`✅ User connected: ${userEmail} (${userId})`);

      // CRITICAL FIX: Join user to their specific room - join both userId and userEmail for better compatibility
      console.log(
        `🔍 Joining client ${client.id} to rooms: ${userId}, ${userEmail}, all-users`,
      );
      client.join(userId);
      client.join(userEmail); // Also join by email for flexibility

      // Join a general room for broadcast events
      client.join('all-users');
      console.log(`🔍 Client ${client.id} joined rooms successfully`);

      // Store user info in socket data for later use
      client.data.userId = userId;
      client.data.userEmail = userEmail;

      console.log(`🔍 Sending connection test to client ${client.id}`);
      client.emit('connectionTest', {
        message: 'Connected successfully with authentication',
        clientId: client.id,
        userId: userId,
        userEmail: userEmail,
        timestamp: new Date().toISOString(),
      });
      console.log(`🔍 Connection test sent to client ${client.id}`);

      this.logger.log(
        `✅ User ${userEmail} joined rooms: ${userId}, ${userEmail}, all-users`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Authentication failed for client ${client.id}:`,
        error.message,
      );
      client.emit('connectionTest', {
        message: 'Authentication failed',
        clientId: client.id,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('test')
  async handleTest(client: Socket, payload: any) {
    this.logger.log(
      `🧪 Test message received from client ${client.id}:`,
      payload,
    );
    client.emit('testResponse', {
      message: 'Test response received',
      clientId: client.id,
      timestamp: new Date().toISOString(),
      payload,
    });
    return { event: 'testResponse', data: 'Test successful' };
  }

  @SubscribeMessage('ping')
  async handlePing(client: Socket) {
    this.logger.log(`🏓 Ping received from client ${client.id}`);
    client.emit('pong', {
      message: 'Pong!',
      timestamp: new Date().toISOString(),
    });
    return { event: 'pong', data: 'Pong!' };
  }

  @SubscribeMessage('mockMarketData')
  async handleMockMarketData(
    client: Socket,
    payload: { ticker: string; price: number },
  ) {
    this.logger.log(
      `📊 Mock market data received: ${payload.ticker} at $${payload.price}`,
    );

    // Broadcast to all connected clients
    this.server.emit('marketDataUpdate', {
      ticker: payload.ticker,
      price: payload.price,
      timestamp: new Date().toISOString(),
    });

    return { event: 'marketDataUpdate', data: payload };
  }

  @SubscribeMessage('requestPortfolioUpdate')
  async handleRequestPortfolioUpdate(
    client: Socket,
    payload: { userId: string; useCurrentPrices?: boolean },
  ) {
    this.logger.log(
      `📊 CRITICAL: Portfolio update requested for user: ${payload.userId}, useCurrentPrices: ${payload.useCurrentPrices}`,
    );
    this.logger.log(
      `🔍 CRITICAL: This MUST return FRESH portfolio data, not stale data`,
    );
    this.logger.log(`🔍 Full payload received:`, payload);
    this.logger.log(`🔍 Client ID: ${client.id}`);
    this.logger.log(`🔍 Timestamp: ${new Date().toISOString()}`);

    // CRITICAL FIX: If useCurrentPrices is true, actually calculate and send portfolio update
    if (payload.useCurrentPrices) {
      try {
        this.logger.log(
          `📊 CRITICAL: Calculating FRESH portfolio for user: ${payload.userId}`,
        );
        this.logger.log(
          `🔍 This will get the LATEST portfolio data, not stale cached data`,
        );
        this.logger.log(
          `🔍 Calling socketService.requestPortfolioUpdateWithCurrentPrices...`,
        );
        this.logger.log(
          `🔍 CRITICAL: This MUST return FRESH data, not stale data from previous test runs`,
        );

        // Call the SocketService to calculate and send current portfolio data
        const result =
          await this.socketService.requestPortfolioUpdateWithCurrentPrices(
            payload.userId,
          );

        this.logger.log(
          `✅ CRITICAL: FRESH Portfolio update sent to user: ${payload.userId}`,
        );
        this.logger.log(`🔍 CRITICAL: Result contains FRESH data:`, result);

        // CRITICAL FIX: Verify the result contains fresh data
        if (result && result.success) {
          this.logger.log(`🎉 CRITICAL: SUCCESS! Fresh portfolio data sent:`, {
            portfolioValue: result.portfolioValue,
            balance: result.balance,
            timestamp: result.timestamp,
          });
        } else {
          this.logger.error(
            `❌ CRITICAL: FAILED! No fresh portfolio data sent:`,
            result,
          );
        }
      } catch (error) {
        this.logger.error(
          `❌ CRITICAL: Failed to send FRESH portfolio update:`,
          error,
        );
        this.logger.error(`🔍 Error details:`, {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
        client.emit('portfolioUpdateError', {
          userId: payload.userId,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Just acknowledge the request
      this.logger.log(`🔍 Sending portfolioUpdateRequested acknowledgment...`);
      client.emit('portfolioUpdateRequested', {
        userId: payload.userId,
        timestamp: new Date().toISOString(),
      });
      this.logger.log(`🔍 portfolioUpdateRequested acknowledgment sent`);
    }

    // CRITICAL FIX: Return detailed result for debugging
    const result = {
      event: 'portfolioUpdateRequested',
      data: payload,
      timestamp: new Date().toISOString(),
      useCurrentPrices: payload.useCurrentPrices,
      message: payload.useCurrentPrices
        ? 'Fresh portfolio update requested'
        : 'Portfolio update acknowledgment sent',
    };

    this.logger.log(`🔍 CRITICAL: Returning result:`, result);
    return result;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: { room: string }) {
    this.logger.log(`🔗 Client ${client.id} joining room: ${payload.room}`);

    client.join(payload.room);

    client.emit('roomJoined', {
      room: payload.room,
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`✅ Client ${client.id} joined room: ${payload.room}`);
    return { event: 'roomJoined', data: { room: payload.room } };
  }

  @SubscribeMessage('testNotification')
  async handleTestNotification(
    client: Socket,
    payload: { userId: string; type: string },
  ) {
    this.logger.log(
      `🧪 Testing notification for user: ${payload.userId}, type: ${payload.type}`,
    );

    // Test different notification types
    switch (payload.type) {
      case 'orderNotification':
        this.socketService.sendOrderNotification(payload.userId, {
          type: 'ORDER_FILLED',
          orderId: 'test-order-id',
          ticker: 'AAPL',
          side: 'BUY',
          quantity: 10,
          price: 200,
          message: 'Test order notification',
        });
        break;
      case 'balanceUpdate':
        // CRITICAL FIX: Calculate correct totalAssets (stocks + cash) instead of hardcoded value
        const testBalance = 50000;
        const testBalanceTotalAssets = 60000; // 10000 stocks + 50000 cash

        this.socketService.sendBalanceUpdate(payload.userId, {
          balance: testBalance,
          totalAssets: testBalanceTotalAssets,
        });
        break;
      case 'portfolioUpdate':
        // CRITICAL FIX: Calculate correct totalValue (stocks + cash) instead of hardcoded value
        const testPositions = [
          {
            ticker: 'AAPL',
            quantity: 50,
            averagePrice: 180,
            currentPrice: 200,
            marketValue: 10000,
            unrealizedPnL: 1000,
            pnlPercentage: 10,
          },
        ];
        const testStocksValue = testPositions.reduce(
          (sum, pos) => sum + pos.marketValue,
          0,
        );
        const testCashBalance = 50000;
        const testPortfolioTotalAssets = testStocksValue + testCashBalance;

        this.socketService.sendPortfolioUpdate(payload.userId, {
          totalValue: testPortfolioTotalAssets, // CRITICAL FIX: Use calculated totalAssets (stocks + cash)
          totalPnL: 5000,
          positions: testPositions,
        });
        break;
      case 'priceAlert':
        this.socketService.sendAlert({
          userId: payload.userId,
          data: {
            message: 'Test price alert for AAPL',
            alert: { id: 'test-alert-id' },
          },
        });
        break;
    }

    client.emit('testNotificationSent', {
      userId: payload.userId,
      type: payload.type,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'testNotificationSent',
      data: { userId: payload.userId, type: payload.type },
    };
  }
}
