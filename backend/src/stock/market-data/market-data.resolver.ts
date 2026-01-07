// src/stock/market-data/market-data.resolver.ts
import {
  Resolver,
  Parent,
  ResolveField,
  Mutation,
  Args,
  Query,
} from '@nestjs/graphql';
import { Stock } from '../entities/stock.entity';
import { MarketData } from '../entities/market-data.entity';
import { Interval } from '../enums/interval.enum';
import { MarketDataService } from './market-data.service';
import { SocketService } from '../../core/socket-gateway.service';
import { AlertDispatcherService } from '../../alert-rule/alert-dispatcher.service';
import { MarketOverviewPaginationInput } from '../dto/market-overview.input';
import { MarketOverviewPaginationResponse } from '../entities/market-overview.entity';
import { TopMoversPaginationInput } from '../dto/top-movers.input';
import { TopMoversPaginationResponse } from '../entities/top-mover.entity';

@Resolver(() => Stock)
export class MarketDataResolver {
  constructor(
    private marketDataService: MarketDataService,
    private socketService: SocketService,
    private alertDispatcherService: AlertDispatcherService,
  ) {}

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

  @Mutation(() => MarketData)
  async broadcastMarketData(
    @Args('ticker') ticker: string,
    @Args('price') price: number,
  ) {
    const marketData = {
      ticker,
      price,
      volume: 1000000, // Default volume
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all connected clients
    this.socketService.broadcastMarketDataUpdate(marketData);

    return {
      id: `md-${Date.now()}`,
      ticker,
      timestamp: new Date(),
      interval: Interval._1d,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: '1000000',
      afterHours: price,
    };
  }

  @Mutation(() => MarketData)
  async updateMarketData(
    @Args('ticker') ticker: string,
    @Args('price') price: number,
  ) {
    const marketData = {
      ticker,
      price,
      volume: 1000000,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all connected clients
    this.socketService.broadcastMarketDataUpdate(marketData);

    // Trigger price alerts for this ticker and price
    await this.alertDispatcherService.handleStockPriceUpdate(ticker, price);

    return {
      id: `md-${Date.now()}`,
      ticker,
      timestamp: new Date(),
      interval: Interval._1d,
      open: price,
      high: price,
      low: price,
      close: price,
      volume: '1000000',
      afterHours: price,
    };
  }

  @Query(() => MarketOverviewPaginationResponse, { name: 'getMarketOverview' })
  getMarketOverview(@Args('input') input: MarketOverviewPaginationInput) {
    return this.marketDataService.getMarketOverview(input);
  }

  @Query(() => TopMoversPaginationResponse, { name: 'getTopMovers' })
  getTopMovers(@Args('input') input: TopMoversPaginationInput) {
    return this.marketDataService.getTopMovers(input);
  }
}
