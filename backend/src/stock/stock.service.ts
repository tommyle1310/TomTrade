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
