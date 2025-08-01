import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StockGateway } from './common/gateway/stock/stock.gateway';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const instanceId = process.env.INSTANCE_ID || 'unknown';
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0', () => {
    console.log(
      `[${instanceId}] Server is running successfully on PORT`,
      process.env.PORT ?? 3000,
    );
  });
}
bootstrap();
