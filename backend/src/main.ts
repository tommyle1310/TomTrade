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
    
    console.log('✅ Socket.IO adapter configured successfully');
    
    const instanceId = process.env.INSTANCE_ID || 'unknown';
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0', () => {
      console.log(
        `[${instanceId}] Server is running successfully on PORT`,
        process.env.PORT ?? 3000,
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
