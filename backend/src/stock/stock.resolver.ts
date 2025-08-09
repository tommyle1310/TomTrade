import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Float,
} from '@nestjs/graphql';
import { StockService } from './stock.service';
import { Stock } from './entities/stock.entity';
import { MarketDataService } from './market-data/market-data.service';
import { MarketData } from './entities/market-data.entity';
import { Interval } from './enums/interval.enum';
import { News } from './entities/news.entity';
import { Dividend } from './entities/dividend.entity';
import { ForecastModel } from './entities/forecast-model.entity';
import { IndicatorService } from './indicator.service';

@Resolver(() => Stock)
export class StockResolver {
  constructor(
    private stockService: StockService,
    private marketDataService: MarketDataService,
    private indicatorService: IndicatorService,
  ) {}

  @Query(() => [Stock])
  async stocks() {
    return this.stockService.getAllStocks();
  }

  @Query(() => Stock, { nullable: true })
  async stock(@Args('ticker') ticker: string) {
    return this.stockService.getStock(ticker);
  }

  @ResolveField('avatar', () => String, { nullable: true })
  async getAvatar(@Parent() stock: Stock) {
    // Return existing avatar or fallback to Financial Modeling Prep image
    return stock.avatar || `https://financialmodelingprep.com/image-stock/${stock.ticker}.png`;
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

  @Query(() => [Float])
  async getSMA(
    @Args('ticker') ticker: string,
    @Args('period', { type: () => Number, defaultValue: 20 }) period: number,
    @Args('interval', { type: () => Interval, defaultValue: Interval._1d })
    interval: string,
  ) {
    return this.indicatorService.getSMA(ticker, period, interval);
  }

  @Query(() => [Float])
  async getEMA(
    @Args('ticker') ticker: string,
    @Args('period', { type: () => Number, defaultValue: 20 }) period: number,
    @Args('interval', { type: () => Interval, defaultValue: Interval._1d })
    interval: string,
  ) {
    return this.indicatorService.getEMA(ticker, period, interval);
  }

  @Query(() => [Float])
  async getRSI(
    @Args('ticker') ticker: string,
    @Args('period', { type: () => Number, defaultValue: 14 }) period: number,
    @Args('interval', { type: () => Interval, defaultValue: Interval._1d })
    interval: string,
  ) {
    return this.indicatorService.getRSI(ticker, period, interval);
  }

  @Query(() => [Float])
  async getBollingerBands(
    @Args('ticker') ticker: string,
    @Args('period', { type: () => Number, defaultValue: 20 }) period: number,
    @Args('stdDev', { type: () => Number, defaultValue: 2 }) stdDev: number,
    @Args('interval', { type: () => Interval, defaultValue: Interval._1d })
    interval: string,
  ) {
    const bands = await this.indicatorService.getBollingerBands(
      ticker,
      period,
      stdDev,
      interval,
    );
    return bands.upper; // Return upper band as example, can be extended to return all bands
  }
}
