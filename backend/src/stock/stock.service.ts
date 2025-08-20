import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SocketService } from '../core/socket-gateway.service';
import { AlertDispatcherService } from 'src/alert-rule/alert-dispatcher.service';

@Injectable()
export class StockService {
  constructor(
    private prisma: PrismaService,
    private alertDispatcherService: AlertDispatcherService,
    private socketService: SocketService,
  ) {}

  async getStock(ticker: string) {
    return this.prisma.stock.findUnique({
      where: { ticker },
    });
  }

  async getAllStocks() {
    return this.prisma.stock.findMany();
  }

  async getStocksWithPagination(input: {
    page: number;
    limit: number;
    ticker?: string;
    companyName?: string;
    exchange?: string;
    status?: string;
    isTradable?: boolean | null;
  }) {
    const { page, limit, ticker, companyName, exchange, status, isTradable } =
      input;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (ticker) where.ticker = { contains: ticker, mode: 'insensitive' };
    if (companyName)
      where.companyName = { contains: companyName, mode: 'insensitive' };
    if (exchange) where.exchange = { contains: exchange, mode: 'insensitive' };
    if (status) where.status = { contains: status, mode: 'insensitive' };
    if (typeof isTradable === 'boolean') where.isTradable = isTradable;

    const [stocks, totalCount] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        orderBy: { ticker: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.stock.count({ where }),
    ]);

    return {
      stocks,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async createStock(input: {
    ticker: string;
    companyName: string;
    exchange: string;
    sector?: string;
    industry?: string;
    country?: string;
    currency?: string;
    status?: string;
    ipoDate?: string;
    isTradable?: boolean;
    suspendReason?: string;
  }) {
    const {
      ticker,
      companyName,
      exchange,
      sector,
      industry,
      country,
      currency,
      status,
      ipoDate,
      isTradable,
      suspendReason,
    } = input;
    return this.prisma.stock.create({
      data: {
        ticker,
        companyName,
        exchange,
        sector,
        industry,
        country,
        currency,
        status,
        ipoDate: ipoDate ? new Date(ipoDate) : undefined,
        isTradable: typeof isTradable === 'boolean' ? isTradable : true,
        suspendReason,
      },
    });
  }

  async updateStock(input: {
    ticker: string;
    companyName?: string;
    exchange?: string;
    sector?: string;
    industry?: string;
    country?: string;
    currency?: string;
    status?: string;
    ipoDate?: string | null;
    isTradable?: boolean;
    suspendReason?: string | null;
  }) {
    const { ticker, ipoDate, ...rest } = input;
    const data: any = { ...rest };
    if (typeof ipoDate !== 'undefined') {
      data.ipoDate = ipoDate ? new Date(ipoDate) : null;
    }
    return this.prisma.stock.update({ where: { ticker }, data });
  }

  async news(ticker: string, limit: number) {
    return this.prisma.news.findMany({
      where: { ticker },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }

  async forecastModels(ticker: string) {
    return this.prisma.forecastModel.findMany({
      where: { ticker },
      orderBy: { trainedAt: 'desc' },
    });
  }

  async dividends(ticker: string, limit: number) {
    return this.prisma.dividend.findMany({
      where: { ticker },
      orderBy: { exDate: 'desc' },
      take: limit,
    });
  }

  async processMarketDataUpdate(data: {
    ticker: string;
    price: number;
    volume: number;
  }) {
    const { ticker, price, volume } = data;

    // 1. Save the new market data
    const marketData = await this.prisma.marketData.create({
      data: {
        ticker,
        timestamp: new Date(),
        interval: '1m', // Assuming 1-minute interval for real-time data
        open: price, // Simplified: using price for open, high, low, close
        high: price,
        low: price,
        close: price,
        volume,
      },
    });
    console.log('check even fall here', ticker, price);

    // 2. Trigger alert evaluation
    await this.alertDispatcherService.handleStockPriceUpdate(ticker, price);

    // 3. Broadcast market data update to all connected clients
    this.socketService.broadcastMarketDataUpdate({
      ticker,
      price,
      volume,
      timestamp: new Date().toISOString(),
    });

    return marketData;
  }
}
