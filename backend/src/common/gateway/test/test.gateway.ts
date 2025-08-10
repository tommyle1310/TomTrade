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

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/test',
})
export class TestGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  public server: Server;

  private logger: Logger = new Logger('TestGateway');

  afterInit(server: Server) {
    this.logger.log('✅ TestGateway initialized');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`🔌 Test client connected: ${client.id}`);
    
    client.emit('connectionTest', {
      message: 'Connected to test gateway',
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Test client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  async handlePing(client: Socket) {
    this.logger.log(`🏓 Ping received from test client ${client.id}`);
    client.emit('pong', {
      message: 'Pong from test gateway!',
      timestamp: new Date().toISOString(),
    });
    return { event: 'pong', data: 'Pong!' };
  }
}
