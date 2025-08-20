import {
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Float,
  Mutation,
} from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { StockService } from './stock.service';
import { Stock } from './entities/stock.entity';
import { MarketDataService } from './market-data/market-data.service';
import { MarketData } from './entities/market-data.entity';
import { Interval } from './enums/interval.enum';
import { News } from './entities/news.entity';
import { Dividend } from './entities/dividend.entity';
import { ForecastModel } from './entities/forecast-model.entity';
import { IndicatorService } from './indicator.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/admin/guards/roles.guard';
import { Roles } from 'src/admin/decorators/roles.decorator';
import {
  StockPaginationInput,
  CreateStockInput,
  UpdateStockInput,
} from './dto/stock-admin.input';
import { StockPaginationResponse } from './entities/stock-admin.entity';
import { Candle } from './entities/candle.entity';
import { PrismaService } from 'prisma/prisma.service';
import { IndicatorSeries } from './entities/indicator-series.entity';

@Resolver(() => Stock)
export class StockResolver {
  constructor(
    private stockService: StockService,
    private marketDataService: MarketDataService,
    private indicatorService: IndicatorService,
    private prisma: PrismaService,
  ) {}

  @Query(() => [Stock])
  async stocks() {
    return this.stockService.getAllStocks();
  }

  @Query(() => [IndicatorSeries])
  async indicators(
    @Args('symbol') symbol: string,
    @Args('interval') interval: string,
    @Args({ name: 'indicators', type: () => [String], nullable: true })
    indicators?: string[],
    @Args('period', { type: () => Number, nullable: true }) period?: number,
  ) {
    const available =
      indicators && indicators.length > 0 ? indicators : ['SMA_14', 'RSI_14'];
    const results: IndicatorSeries[] = [];
    for (const name of available) {
      if (name.startsWith('SMA')) {
        const p = Number(name.split('_')[1] || period || 14);
        const values = await this.indicatorService.getSMA(symbol, p, interval);
        const md = await this.prisma.marketData.findMany({
          where: { ticker: symbol, interval },
          orderBy: { timestamp: 'desc' },
          take: values.length,
        });
        const points = values
          .map((v, i) => ({
            timestamp: md[values.length - 1 - i]?.timestamp.getTime() ?? 0,
            value: v,
          }))
          .reverse();
        results.push({ name: `SMA_${p}`, values: points });
      } else if (name.startsWith('RSI')) {
        const p = Number(name.split('_')[1] || period || 14);
        const values = await this.indicatorService.getRSI(symbol, p, interval);
        const md = await this.prisma.marketData.findMany({
          where: { ticker: symbol, interval },
          orderBy: { timestamp: 'desc' },
          take: values.length,
        });
        const points = values
          .map((v, i) => ({
            timestamp: md[values.length - 1 - i]?.timestamp.getTime() ?? 0,
            value: v,
          }))
          .reverse();
        results.push({ name: `RSI_${p}`, values: points });
      }
    }
    return results;
  }

  // Admin management
  @Query(() => StockPaginationResponse, { name: 'adminStocks' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminStocks(@Args('input') input: StockPaginationInput) {
    return this.stockService.getStocksWithPagination(input);
  }

  @Mutation(() => Stock, { name: 'adminCreateStock' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminCreateStock(@Args('input') input: CreateStockInput) {
    return this.stockService.createStock(input);
  }

  @Mutation(() => Stock, { name: 'adminUpdateStock' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUpdateStock(@Args('input') input: UpdateStockInput) {
    return this.stockService.updateStock(input);
  }

  @Query(() => Stock, { nullable: true })
  async stock(@Args('ticker') ticker: string) {
    return this.stockService.getStock(ticker);
  }

  @ResolveField('avatar', () => String, { nullable: true })
  async getAvatar(@Parent() stock: Stock) {
    // Return existing avatar or fallback to Financial Modeling Prep image
    return (
      stock.avatar ||
      `https://financialmodelingprep.com/image-stock/${stock.ticker}.png`
    );
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
    const [norm] = this.toDbIntervals(interval);
    try {
      return await this.indicatorService.getSMA(ticker, period, norm);
    } catch {
      return [];
    }
  }

  @Query(() => [Float])
  async getEMA(
    @Args('ticker') ticker: string,
    @Args('period', { type: () => Number, defaultValue: 20 }) period: number,
    @Args('interval', { type: () => Interval, defaultValue: Interval._1d })
    interval: string,
  ) {
    const [norm] = this.toDbIntervals(interval);
    try {
      return await this.indicatorService.getEMA(ticker, period, norm);
    } catch {
      return [];
    }
  }

  @Query(() => [Float])
  async getRSI(
    @Args('ticker') ticker: string,
    @Args('period', { type: () => Number, defaultValue: 14 }) period: number,
    @Args('interval', { type: () => Interval, defaultValue: Interval._1d })
    interval: string,
  ) {
    const [norm] = this.toDbIntervals(interval);
    try {
      return await this.indicatorService.getRSI(ticker, period, norm);
    } catch {
      return [];
    }
  }

  @Query(() => [Float])
  async getBollingerBands(
    @Args('ticker') ticker: string,
    @Args('period', { type: () => Number, defaultValue: 20 }) period: number,
    @Args('stdDev', { type: () => Number, defaultValue: 2 }) stdDev: number,
    @Args('interval', { type: () => Interval, defaultValue: Interval._1d })
    interval: string,
  ) {
    const [norm] = this.toDbIntervals(interval);
    const bands = await this.indicatorService.getBollingerBands(
      ticker,
      period,
      stdDev,
      norm,
    );
    return bands.upper; // Return upper band as example, can be extended to return all bands
  }

  // Candlesticks for charts
  @Query(() => [Candle])
  async candles(
    @Args('symbol') symbol: string,
    @Args('interval') interval: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    const intervals = this.toDbIntervals(interval);
    const rows = await this.prisma.marketData.findMany({
      where: { ticker: symbol, interval: { in: intervals } },
      orderBy: { timestamp: 'desc' },
      take: limit ?? 200,
    });
    return rows.reverse().map((r) => ({
      timestamp: r.timestamp.getTime(),
      open: r.open,
      high: r.high,
      low: r.low,
      close: r.close,
      volume: Number(r.volume),
    }));
  }

  private toDbIntervals(input: string): string[] {
    const map: Record<string, string[]> = {
      _1d: ['1D', '1d'],
      _1h: ['1h'],
      _1m: ['1m'],
      _5m: ['5m'],
      '1D': ['1D', '1d'],
      '1d': ['1D', '1d'],
      '1h': ['1h'],
      '1m': ['1m'],
      '5m': ['5m'],
    };
    return map[input] ?? [input];
  }
}
