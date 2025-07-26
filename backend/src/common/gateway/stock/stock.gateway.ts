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
      this.logger.log(`Client ${client.id} joined room ${userId}`);
    } catch (e) {
      client.disconnect();
    }
  }

  private async validateToken(client: Socket): Promise<any> {
    try {
      const authHeader = client.handshake.headers.auth as string;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new WsException('Invalid token');
      }
      const token = authHeader.slice(7);
      if (!token) {
        throw new WsException('No token provided');
      }
      return await this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch (error: any) {
      this.logger.error(
        '[DriversGateway] Token validation error:',
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

  @OnEvent('stock.price.update')
  public async handleMarketDataUpdate(payload: {
    ticker: string;
    price: number;
  }) {
    try {
      this.logger.log(
        `Handling stock.price.update event for ${payload.ticker}`,
      );
      const alerts = await this.alertService.checkAndTrigger(
        payload.ticker,
        payload.price,
      );
      await this.orderService.tryMatchByPrice(payload.ticker, payload.price);
      this.logger.log(`Found ${alerts.length} alerts to send.`);

      for (const alert of alerts) {
        this.socketService.sendAlert(alert);
        this.logger.log(`Sent alert to user ${alert.userId}`);
      }
    } catch (error) {
      this.logger.error(
        '❌ CRITICAL ERROR in handleMarketDataUpdate:',
        error.stack,
      );
    }
  }
}
