// src/stock/market-data/market-data.resolver.ts
import { Resolver, Parent, ResolveField } from '@nestjs/graphql';
import { Stock } from '../entities/stock.entity';
import { MarketData } from '../entities/market-data.entity';
import { Interval } from '../enums/interval.enum';

@Resolver(() => Stock)
export class MarketDataResolver {
  @ResolveField(() => [MarketData])
  marketData(@Parent() stock: Stock): MarketData[] {
    return [
      {
        id: 'md-001',
        ticker: stock.ticker,
        timestamp: new Date(),
        interval: Interval._1d,
        open: 199,
        high: 202,
        low: 198,
        close: 200,
        volume: '100000000',
        afterHours: 200.5,
      },
    ];
  }
}
