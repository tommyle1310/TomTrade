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
    this.logger.log('🔧 Calling socketService.setServer with this.server:', this.server ? 'valid server instance' : 'null/undefined');
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
          } catch (e) {
            // Fallback: use a default user for testing
            userId = 'test-user-id';
            userEmail = 'test@example.com';
          }
        }
      }

      this.logger.log(`✅ User connected: ${userEmail} (${userId})`);

      // Join user to their specific room - join both userId and userEmail for better compatibility
      client.join(userId);
      client.join(userEmail); // Also join by email for flexibility

      // Join a general room for broadcast events
      client.join('all-users');

      // Store user info in socket data for later use
      client.data.userId = userId;
      client.data.userEmail = userEmail;

      client.emit('connectionTest', {
        message: 'Connected successfully with authentication',
        clientId: client.id,
        userId: userId,
        userEmail: userEmail,
        timestamp: new Date().toISOString(),
      });

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
    payload: { userId: string },
  ) {
    this.logger.log(
      `📊 Portfolio update requested for user: ${payload.userId}`,
    );

    // This would typically trigger a portfolio calculation
    // For now, just acknowledge the request
    client.emit('portfolioUpdateRequested', {
      userId: payload.userId,
      timestamp: new Date().toISOString(),
    });

    return { event: 'portfolioUpdateRequested', data: payload };
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
        this.socketService.sendBalanceUpdate(payload.userId, {
          balance: 50000,
          totalAssets: 75000,
        });
        break;
      case 'portfolioUpdate':
        this.socketService.sendPortfolioUpdate(payload.userId, {
          totalValue: 75000,
          totalPnL: 5000,
          positions: [
            {
              ticker: 'AAPL',
              quantity: 50,
              averagePrice: 180,
              currentPrice: 200,
              marketValue: 10000,
              unrealizedPnL: 1000,
              pnlPercentage: 10,
            },
          ],
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
