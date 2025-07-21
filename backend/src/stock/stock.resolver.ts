import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { StockService } from './stock.service';
import { Stock } from './entities/stock.entity';
import { MarketDataService } from './market-data/market-data.service';
import { MarketData } from './entities/market-data.entity';
import { Interval } from './enums/interval.enum';
import { News } from './entities/news.entity';
import { Dividend } from './entities/dividend.entity';
import { ForecastModel } from './entities/forecast-model.entity';

@Resolver(() => Stock)
export class StockResolver {
  constructor(
    private stockService: StockService,
    private marketDataService: MarketDataService,
  ) {}

  @Query(() => [Stock])
  async stocks() {
    return this.stockService.getAllStocks();
  }

  @Query(() => Stock, { nullable: true })
  async stock(@Args('ticker') ticker: string) {
    return this.stockService.getStock(ticker);
  }

  @ResolveField('marketData', () => [MarketData])
  async getMarketData(
    @Parent() stock: Stock,
    @Args('interval', { type: () => Interval, defaultValue: Interval._1d })
    interval: string,
  ) {
    return this.marketDataService.getByTicker(stock.ticker, interval);
  }

  @ResolveField(() => [News])
  async news(
    @Parent() stock: Stock,
    @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number,
  ) {
    return this.stockService.news(stock.ticker, limit);
  }

  @ResolveField(() => [Dividend])
  async dividends(
    @Parent() stock: Stock,
    @Args('limit', { type: () => Number, defaultValue: 12 }) limit: number,
  ) {
    return this.stockService.dividends(stock.ticker, limit);
  }

  @ResolveField(() => [ForecastModel])
  async forecastModels(@Parent() stock: Stock) {
    return this.stockService.forecastModels(stock.ticker);
  }
}
