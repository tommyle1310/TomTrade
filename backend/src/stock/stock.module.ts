// src/stock/stock.module.ts
import { Module } from '@nestjs/common';
import { StockResolver } from './stock.resolver';
import { MarketDataResolver } from './market-data/market-data.resolver';
import { StockService } from './stock.service';
import { MarketDataService } from './market-data/market-data.service';

@Module({
  providers: [StockResolver, MarketDataResolver, StockService, MarketDataService],
})
export class StockModule {}
