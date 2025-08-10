// src/stock/stock.module.ts
import { Module } from '@nestjs/common';
import { StockResolver } from './stock.resolver';
import { MarketDataResolver } from './market-data/market-data.resolver';
import { StockService } from './stock.service';
import { MarketDataService } from './market-data/market-data.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AlertDispatcherService } from 'src/alert-rule/alert-dispatcher.service';
import { AlertRuleService } from 'src/alert-rule/alert-rule.service';
import { IndicatorService } from './indicator.service';

@Module({
  imports: [EventEmitterModule],
  providers: [
    StockResolver,
    MarketDataResolver,
    StockService,
    MarketDataService,
    IndicatorService,
    AlertRuleService,
    AlertDispatcherService,
  ],
  exports: [StockService],
})
export class StockModule {}
