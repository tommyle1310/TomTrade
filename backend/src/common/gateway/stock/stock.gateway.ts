import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsException,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AlertRuleService } from '../../../alert-rule/alert-rule.service';
import { PrismaService } from 'prisma/prisma.service';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { SocketService } from 'src/core/socket-gateway.service';
import { OrderService } from 'src/order/order.service';
import { PortfolioPnLService } from 'src/portfolio/portfolio-pnl.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StockGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  private logger: Logger = new Logger('StockGateway');

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly socketService: SocketService,
    private readonly alertService: AlertRuleService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly portfolioPnLService: PortfolioPnLService,
  ) {}

  afterInit(server: Server) {
    this.socketService.setServer(server);
    this.logger.log('✅ StockGateway initialized');
  }

  async handleConnection(client: Socket) {
    // Bypass token validation for the mock script
    if (client.handshake.query.isMockClient === 'true') {
      this.logger.log(`✅ Mock script client connected: ${client.id}`);
      return;
    }

    try {
      const decoded = await this.validateToken(client);
      const userId = decoded.sub;
      client.join(userId);
      this.logger.log(`✅ Client ${client.id} joined room ${userId}`);

      // Send a test message to verify the connection
      client.emit('connectionTest', {
        message: 'Connected successfully',
        userId,
      });
      this.logger.log(`✅ Sent connection test to user ${userId}`);
    } catch (e) {
      this.logger.error(`❌ Connection failed for client ${client.id}:`, e);
      client.disconnect();
    }
  }

  private async validateToken(client: Socket): Promise<any> {
    try {
      // Check both auth header and Socket.IO auth object
      let token: string | undefined;

      // Try Socket.IO auth object first
      if (client.handshake.auth?.token) {
        token = client.handshake.auth.token;
        this.logger.log(
          `🔑 Found token in Socket.IO auth: ${token?.substring(0, 20)}...`,
        );
      }
      // Fallback to headers
      else if (client.handshake.headers.auth) {
        const authHeader = client.handshake.headers.auth as string;
        if (authHeader?.startsWith('Bearer ')) {
          token = authHeader.slice(7);
          this.logger.log(
            `🔑 Found token in headers: ${token.substring(0, 20)}...`,
          );
        }
      }

      if (!token) {
        this.logger.error('❌ No token found in WebSocket connection');
        throw new WsException('No token provided');
      }

      this.logger.log(`🔍 Validating token for client ${client.id}...`);
      const decoded = await this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      this.logger.log(`✅ Token validated for user: ${decoded.sub}`);
      return decoded;
    } catch (error: any) {
      this.logger.error(
        '[StockGateway] Token validation error:',
        error.message,
      );
      throw new WsException('Token validation failed');
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('mockMarketData')
  async handleMockMarketData(
    client: Socket,
    payload: { ticker: string; price: number },
  ) {
    this.logger.log(
      `Received mock data from script: ${payload.ticker} @ ${payload.price}`,
    );
    this.eventEmitter.emit('stock.price.update', payload);
    return { event: 'mockDataReceived', data: payload };
  }

  @SubscribeMessage('requestPortfolioUpdate')
  async handleRequestPortfolioUpdate(
    client: Socket,
    payload: { userId: string },
  ) {
    this.logger.log(`Requested portfolio update for user: ${payload.userId}`);

    try {
      const currentPrices: Record<string, number> = {
        AAPL: 300,
        GOOG: 2800,
      };

      const portfolioSummary =
        await this.portfolioPnLService.getPortfolioSummary(
          payload.userId,
          currentPrices,
        );

      this.socketService.sendPortfolioUpdate(payload.userId, {
        totalValue: portfolioSummary.totalValue,
        totalPnL: portfolioSummary.totalPnL,
        positions: portfolioSummary.positions,
      });

      this.socketService.sendBalanceUpdate(payload.userId, {
        balance: portfolioSummary.balance,
        totalAssets: portfolioSummary.totalAssets,
      });

      this.logger.log(
        `✅ Manual portfolio update sent to user ${payload.userId}`,
      );
    } catch (error) {
      this.logger.error(`Error sending manual portfolio update:`, error);
    }
  }

  @OnEvent('stock.price.update')
  public async handleMarketDataUpdate(payload: {
    ticker: string;
    price: number;
  }) {
    try {
      this.logger.log(
        `Handling stock.price.update event for ${payload.ticker}`,
      );

      // Check and trigger alerts
      const alerts = await this.alertService.checkAndTrigger(
        payload.ticker,
        payload.price,
      );

      // Try to match orders
      await this.orderService.tryMatchByPrice(payload.ticker, payload.price);

      this.logger.log(`Found ${alerts.length} alerts to send.`);

      // Send alerts
      for (const alert of alerts) {
        this.socketService.sendAlert(alert);
        this.logger.log(`Sent alert to user ${alert.userId}`);
      }

      // Send portfolio updates to all users who have positions in this ticker
      await this.sendPortfolioUpdates(payload.ticker, payload.price);
    } catch (error) {
      this.logger.error(
        '❌ CRITICAL ERROR in handleMarketDataUpdate:',
        error.stack,
      );
    }
  }

  private async sendPortfolioUpdates(ticker: string, currentPrice: number) {
    try {
      this.logger.log(
        `📊 Sending portfolio updates for ${ticker} @ ${currentPrice}`,
      );

      // Get all users who have positions in this ticker
      const positions = await this.prisma.portfolio.findMany({
        where: { ticker },
        select: { userId: true },
        distinct: ['userId'],
      });

      const userIds = positions.map((p) => p.userId);
      this.logger.log(
        `Found ${userIds.length} users with positions in ${ticker}: ${userIds.join(', ')}`,
      );

      // Get current prices for all tickers (you might want to cache this)
      const currentPrices: Record<string, number> = {
        [ticker]: currentPrice,
        // Add other tickers as needed
        AAPL: 300, // Mock data - replace with real market data
        GOOG: 2800, // Mock data - replace with real market data
      };

      // Send portfolio updates to each user
      for (const userId of userIds) {
        try {
          this.logger.log(`📊 Calculating portfolio for user ${userId}...`);

          const portfolioSummary =
            await this.portfolioPnLService.getPortfolioSummary(
              userId,
              currentPrices,
            );

          this.logger.log(`📊 Sending portfolio update to user ${userId}:`, {
            totalValue: portfolioSummary.totalValue,
            totalPnL: portfolioSummary.totalPnL,
            positionsCount: portfolioSummary.positions.length,
          });

          this.socketService.sendPortfolioUpdate(userId, {
            totalValue: portfolioSummary.totalValue,
            totalPnL: portfolioSummary.totalPnL,
            positions: portfolioSummary.positions,
          });

          this.socketService.sendBalanceUpdate(userId, {
            balance: portfolioSummary.balance,
            totalAssets: portfolioSummary.totalAssets,
          });

          this.logger.log(
            `✅ Portfolio and balance updates sent to user ${userId}`,
          );
        } catch (error) {
          this.logger.error(
            `Error sending portfolio update to user ${userId}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in sendPortfolioUpdates:', error);
    }
  }
}
