import { Module } from '@nestjs/common';
import { StockGateway } from './stock/stock.gateway';
import { CoreModule } from '../../core/core.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [CoreModule],
  providers: [StockGateway, JwtService],
  exports: [StockGateway],
})
export class GatewayModule {}
