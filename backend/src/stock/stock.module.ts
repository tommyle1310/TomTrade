// src/stock/stock.module.ts
import { Module } from '@nestjs/common';
import { StockResolver } from './stock.resolver';
import { MarketDataResolver } from './market-data/market-data.resolver';
import { StockService } from './stock.service';
import { MarketDataService } from './market-data/market-data.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AlertRuleModule } from 'src/alert-rule/alert-rule.module';
import { IndicatorService } from './indicator.service';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [EventEmitterModule, AlertRuleModule, CoreModule],
  providers: [
    StockResolver,
    MarketDataResolver,
    StockService,
    MarketDataService,
    IndicatorService,
  ],
  exports: [StockService],
})
export class StockModule {}
