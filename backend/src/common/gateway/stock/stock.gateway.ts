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

  constructor(private socketService: SocketService) {}

  afterInit(server: Server) {
    this.logger.log('✅ StockGateway initialized');
    // Initialize the SocketService with the server instance
    this.socketService.setServer(server);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`🔌 New client attempting connection: ${client.id}`);
    this.logger.log(`🔌 Client headers:`, client.handshake.headers);
    this.logger.log(`🔌 Client auth:`, client.handshake.auth);
    this.logger.log(`🔌 Client query:`, client.handshake.query);

    // Bypass token validation for the mock script
    if (client.handshake.query.isMockClient === 'true') {
      this.logger.log(`✅ Mock script client connected: ${client.id}`);
      return;
    }

    // TEMPORARY: Allow unauthenticated connections for testing
    if (!client.handshake.auth?.token && !client.handshake.headers.auth) {
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

    // For now, just allow all connections
    this.logger.log(`✅ Client ${client.id} connected successfully`);
    client.emit('connectionTest', {
      message: 'Connected successfully (simplified mode)',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
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
}
