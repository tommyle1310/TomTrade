import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StockGateway } from './common/gateway/stock/stock.gateway';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Set up Socket.IO adapter
    const ioAdapter = new IoAdapter(app);
    app.useWebSocketAdapter(ioAdapter);

    // Enable CORS for all origins and allow credentials
    app.enableCors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Requested-With',
      ],
      exposedHeaders: ['Content-Length'],
    });

    console.log('✅ Socket.IO adapter configured successfully');

    const instanceId = process.env.INSTANCE_ID || 'unknown';
    const port = Number(process.env.PORT) || 4000;
    await app.listen(port, '0.0.0.0', () => {
      console.log(
        `[${instanceId}] Server is running successfully on PORT`,
        port,
        '🚀 TomTrade đã deploy tự động',
      );
      console.log('✅ Socket.IO server should be ready');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}
bootstrap();
