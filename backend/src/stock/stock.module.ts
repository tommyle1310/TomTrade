// src/stock/stock.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { StockResolver } from './stock.resolver';
import { MarketDataResolver } from './market-data/market-data.resolver';
import { StockService } from './stock.service';
import { MarketDataService } from './market-data/market-data.service';
import { AppModule } from '../app.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AlertDispatcherService } from 'src/alert-rule/alert-dispatcher.service';
import { AlertRuleService } from 'src/alert-rule/alert-rule.service';
import { SocketService } from 'src/core/socket-gateway.service';
import { StockGateway } from 'src/common/gateway/stock/stock.gateway';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [EventEmitterModule],
  providers: [
    StockResolver,
    MarketDataResolver,
    StockService,
    MarketDataService,
    AlertRuleService,
    AlertDispatcherService,
    StockGateway, // chỉ nên có ở đây
    // ❌ KHÔNG cần ConfigService, JwtService, SocketService ở đây nữa
  ],
  exports: [StockService],
})
export class StockModule {}

