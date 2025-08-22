import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SystemDashboardSeederService {
  private readonly logger = new Logger(SystemDashboardSeederService.name);
  private isSeeding = false;
  private seedingInterval: NodeJS.Timeout | null = null;
  private currentDateRange: { startDate: Date; endDate: Date } | null = null;

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async startSeeding(startDate: string, endDate: string) {
    if (this.isSeeding) {
      return {
        status: 'already_seeding',
        message: 'Data seeding is already in progress',
      };
    }

    this.isSeeding = true;
    this.currentDateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    this.logger.log(
      `Starting system dashboard data seeding from ${startDate} to ${endDate}...`,
    );

    // Clear existing data to prevent overlap issues
    await this.clearExistingData();

    // Clear Redis cache to prevent old data
    await this.clearRedisCache();

    // Start seeding immediately
    await this.generateSeedingData();

    // Set up interval to continue seeding every 2 seconds
    this.seedingInterval = setInterval(async () => {
      if (this.isSeeding) {
        await this.generateSeedingData();
      }
    }, 2000); // 2 seconds

    return {
      status: 'started',
      message: `Data seeding started successfully for ${startDate} to ${endDate}`,
    };
  }

  async stopSeeding() {
    if (!this.isSeeding) {
      return {
        status: 'not_seeding',
        message: 'No seeding process is currently running',
      };
    }

    this.isSeeding = false;
    this.currentDateRange = null;

    if (this.seedingInterval) {
      clearInterval(this.seedingInterval);
      this.seedingInterval = null;
    }

    this.logger.log('Stopped system dashboard data seeding');
    return {
      status: 'stopped',
      message: 'Data seeding stopped successfully',
    };
  }

  getSeedingStatus() {
    return {
      isSeeding: this.isSeeding,
      status: this.isSeeding ? 'active' : 'inactive',
      dateRange: this.currentDateRange
        ? {
            startDate: this.currentDateRange.startDate
              .toISOString()
              .split('T')[0],
            endDate: this.currentDateRange.endDate.toISOString().split('T')[0],
          }
        : null,
    };
  }

  private async clearRedisCache() {
    try {
      // Clear all system dashboard related cache keys using the correct method
      await this.redisService.deleteByPattern('system_dashboard:*');
      this.logger.log('Cleared system dashboard Redis cache keys');
    } catch (error) {
      this.logger.error('Error clearing Redis cache:', error);
    }
  }

  private async clearExistingData() {
    try {
      // Clear existing market data to prevent overlap issues
      const deletedMarketData = await this.prisma.marketData.deleteMany({});
      this.logger.log(
        `Cleared ${deletedMarketData.count} existing market data records`,
      );

      // Clear existing transactions
      const deletedTransactions = await this.prisma.transaction.deleteMany({});
      this.logger.log(
        `Cleared ${deletedTransactions.count} existing transaction records`,
      );

      // Clear existing orders
      const deletedOrders = await this.prisma.order.deleteMany({});
      this.logger.log(`Cleared ${deletedOrders.count} existing order records`);

      this.logger.log('All existing data cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing existing data:', error);
    }
  }

  private async generateSeedingData() {
    try {
      if (!this.currentDateRange) {
        this.logger.error('No date range set for seeding');
        return;
      }

      const { startDate, endDate } = this.currentDateRange;

      // Generate transactions for the specified date range
      await this.generateTransactions(startDate, endDate);

      // Generate market data
      await this.generateMarketData(startDate, endDate);

      // Generate orders
      await this.generateOrders(startDate, endDate);

      // Update portfolios
      await this.updatePortfolios();

      this.logger.log(
        `Generated seeding data for ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
      );
    } catch (error) {
      this.logger.error('Error generating seeding data:', error);
    }
  }

  private async generateTransactions(startDate: Date, endDate: Date) {
    const users = await this.prisma.user.findMany({
      select: { id: true },
      take: 10,
    });

    const stocks = await this.prisma.stock.findMany({
      select: { ticker: true },
      take: 5,
    });

    if (users.length === 0 || stocks.length === 0) return;

    // Generate 5-15 transactions per day
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const transactionsCount = Math.floor(Math.random() * 10) + 5; // 5-15 transactions

      for (let i = 0; i < transactionsCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const stock = stocks[Math.floor(Math.random() * stocks.length)];
        const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const shares = Math.floor(Math.random() * 100) + 10; // 10-110 shares
        const basePrice = 100 + Math.random() * 400; // $100-$500
        const price = basePrice + (Math.random() * 20 - 10); // ±$10 variation
        const timestamp = new Date(
          currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000,
        );

        await this.prisma.transaction.create({
          data: {
            userId: user.id,
            ticker: stock.ticker,
            action,
            price,
            shares,
            timestamp,
          },
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private async generateMarketData(startDate: Date, endDate: Date) {
    const stocks = await this.prisma.stock.findMany({
      select: { ticker: true },
      take: 5,
    });

    if (stocks.length === 0) return;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      for (const stock of stocks) {
        // Generate data for ALL intervals: 1D, 1H, 30M, 15M, 5M, 1M

        // Start with a realistic base price for this stock
        const basePrice = 50 + Math.random() * 450; // $50-$500 base price

        // 1. Generate DAILY data (1D interval) - one point per day
        await this.generateDailyData(currentDate, stock, basePrice);

        // 2. Generate HOURLY data (1H interval) - multiple points per day
        await this.generateHourlyData(currentDate, stock, basePrice, stocks);

        // 3. Generate MINUTE data (30M, 15M, 5M, 1M intervals) - many points per day
        await this.generateMinuteData(currentDate, stock, basePrice, stocks);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private async generateDailyData(
    date: Date,
    stock: { ticker: string },
    basePrice: number,
  ) {
    // One data point per day at market close (4:00 PM)
    const timestamp = new Date(date);
    timestamp.setHours(16, 0, 0, 0); // 4:00 PM market close

    // Add stock offset to prevent conflicts
    const stockOffset = Math.floor(Math.random() * 1000);
    timestamp.setMilliseconds(timestamp.getMilliseconds() + stockOffset);

    // Check for duplicates
    const existingData = await this.prisma.marketData.findFirst({
      where: { ticker: stock.ticker, timestamp, interval: '1d' },
    });

    if (existingData) return;

    // Generate realistic daily OHLC
    const open = basePrice + (Math.random() - 0.5) * 20;
    const close = open + (Math.random() - 0.5) * 40; // ±$20 change

    // Create REALISTIC shadows (wicks) - much larger than body
    const bodyRange = Math.abs(close - open);
    const shadowRange = bodyRange * (2 + Math.random() * 3); // 2x to 5x body size

    const high = Math.max(open, close) + Math.random() * shadowRange;
    const low = Math.min(open, close) - Math.random() * shadowRange;

    const volume = Math.floor(500000 + Math.random() * 1500000); // 500k to 2M

    await this.prisma.marketData.create({
      data: {
        ticker: stock.ticker,
        timestamp,
        interval: '1d',
        open,
        high,
        low,
        close,
        volume: BigInt(volume),
        afterHours: close + (Math.random() * 5 - 2.5),
      },
    });
  }

  private async generateHourlyData(
    date: Date,
    stock: { ticker: string },
    basePrice: number,
    stocks: { ticker: string }[],
  ) {
    // Generate 8-12 hourly data points per day
    const dataPointsPerDay = Math.floor(Math.random() * 4) + 8; // 8-12 points

    // Market hours: 9:30 AM to 4:00 PM (6.5 hours)
    const marketHours = 6.5;
    const timeInterval = (marketHours * 60 * 60 * 1000) / dataPointsPerDay;

    let currentPrice = basePrice;

    for (let i = 0; i < dataPointsPerDay; i++) {
      // Create timestamp with PROPER spacing (no overlap)
      const timestamp = new Date(date);
      timestamp.setHours(9, 30, 0, 0); // Start at 9:30 AM
      timestamp.setMilliseconds(timestamp.getMilliseconds() + i * timeInterval);

      // Add stock offset to prevent conflicts
      const stockOffset = stocks.indexOf(stock) * 1000;
      timestamp.setMilliseconds(timestamp.getMilliseconds() + stockOffset);

      // Check for duplicates
      const existingData = await this.prisma.marketData.findFirst({
        where: { ticker: stock.ticker, timestamp, interval: '1h' },
      });

      if (existingData) continue;

      // Generate realistic hourly OHLC with gradual progression
      const open = currentPrice;
      const priceChange = currentPrice * (Math.random() - 0.5) * 0.02; // ±1% change
      const close = open + priceChange;

      // Create VARIED body sizes (not uniform!)
      const bodyRange = Math.abs(close - open);
      const bodyVariation = 0.5 + Math.random() * 2; // 0.5x to 2.5x variation
      const adjustedBodyRange = bodyRange * bodyVariation;

      // Create REALISTIC shadows (wicks) - much larger than body
      const shadowRange = adjustedBodyRange * (1.5 + Math.random() * 2); // 1.5x to 3.5x body size

      const high = Math.max(open, close) + Math.random() * shadowRange;
      const low = Math.min(open, close) - Math.random() * shadowRange;

      const volume = Math.floor(200000 + Math.random() * 800000); // 200k to 1M

      await this.prisma.marketData.create({
        data: {
          ticker: stock.ticker,
          timestamp,
          interval: '1h',
          open,
          high,
          low,
          close,
          volume: BigInt(volume),
          afterHours: close + (Math.random() * 5 - 2.5),
        },
      });

      // Update price for next iteration
      currentPrice = close;
    }
  }

  private async generateMinuteData(
    date: Date,
    stock: { ticker: string },
    basePrice: number,
    stocks: { ticker: string }[],
  ) {
    // Generate MINIMAL data points to prevent overlap
    const intervals = [
      { name: '30m', points: 4, offset: 0 }, // 4 points per day (every 1.5 hours)
      { name: '15m', points: 6, offset: 1000 }, // 6 points per day (every 1 hour)
      { name: '5m', points: 8, offset: 2000 }, // 8 points per day (every 45 min)
      { name: '1m', points: 12, offset: 3000 }, // 12 points per day (every 30 min)
    ];

    for (const interval of intervals) {
      await this.generateIntervalData(date, stock, basePrice, interval, stocks);
    }
  }

  private async generateIntervalData(
    date: Date,
    stock: { ticker: string },
    basePrice: number,
    interval: { name: string; points: number; offset: number },
    stocks: { ticker: string }[],
  ) {
    const dataPointsPerDay = interval.points;

    // Market hours: 9:30 AM to 4:00 PM (6.5 hours)
    const marketHours = 6.5;
    const timeInterval = (marketHours * 60 * 60 * 1000) / dataPointsPerDay;

    let currentPrice = basePrice;

    for (let i = 0; i < dataPointsPerDay; i++) {
      // Create timestamp with PROPER spacing (no overlap)
      const timestamp = new Date(date);
      timestamp.setHours(9, 30, 0, 0); // Start at 9:30 AM
      timestamp.setMilliseconds(timestamp.getMilliseconds() + i * timeInterval);

      // Add stock offset + interval offset to prevent conflicts
      const stockOffset = stocks.indexOf(stock) * 1000;
      const totalOffset = stockOffset + interval.offset;
      timestamp.setMilliseconds(timestamp.getMilliseconds() + totalOffset);

      // Check for duplicates
      const existingData = await this.prisma.marketData.findFirst({
        where: { ticker: stock.ticker, timestamp, interval: interval.name },
      });

      if (existingData) continue;

      // Generate realistic minute-level OHLC with gradual progression
      const open = currentPrice;
      const priceChange = currentPrice * (Math.random() - 0.5) * 0.01; // ±0.5% change
      const close = open + priceChange;

      // Create VARIED body sizes (not uniform!)
      const bodyRange = Math.abs(close - open);
      const bodyVariation = 0.3 + Math.random() * 3; // 0.3x to 3.3x variation
      const adjustedBodyRange = bodyRange * bodyVariation;

      // Create REALISTIC shadows (wicks) - much larger than body
      const shadowRange = adjustedBodyRange * (2 + Math.random() * 3); // 2x to 5x body size

      const high = Math.max(open, close) + Math.random() * shadowRange;
      const low = Math.min(open, close) - Math.random() * shadowRange;

      const volume = Math.floor(50000 + Math.random() * 300000); // 50k to 350k

      await this.prisma.marketData.create({
        data: {
          ticker: stock.ticker,
          timestamp,
          interval: interval.name,
          open,
          high,
          low,
          close,
          volume: BigInt(volume),
          afterHours: close + (Math.random() * 5 - 2.5),
        },
      });

      // Update price for next iteration
      currentPrice = close;
    }
  }

  private async generateOrders(startDate: Date, endDate: Date) {
    const users = await this.prisma.user.findMany({
      select: { id: true },
      take: 10,
    });

    const stocks = await this.prisma.stock.findMany({
      select: { ticker: true },
      take: 5,
    });

    if (users.length === 0 || stocks.length === 0) return;

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const ordersCount = Math.floor(Math.random() * 5) + 2; // 2-7 orders

      for (let i = 0; i < ordersCount; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const stock = stocks[Math.floor(Math.random() * stocks.length)];
        const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const type = Math.random() > 0.7 ? 'MARKET' : 'LIMIT';
        const quantity = Math.floor(Math.random() * 50) + 5;
        const price = type === 'MARKET' ? 0 : 100 + Math.random() * 400;
        const status = Math.random() > 0.8 ? 'FILLED' : 'OPEN';

        await this.prisma.order.create({
          data: {
            userId: user.id,
            ticker: stock.ticker,
            side,
            type,
            price,
            quantity,
            status,
            createdAt: new Date(
              currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000,
            ),
            ...(status === 'FILLED' && {
              matchedAt: new Date(
                currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000,
              ),
            }),
          },
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private async updatePortfolios() {
    const users = await this.prisma.user.findMany({
      select: { id: true },
      take: 10,
    });

    const stocks = await this.prisma.stock.findMany({
      select: { ticker: true },
      take: 5,
    });

    for (const user of users) {
      // Each user gets 2-4 different stocks
      const numStocks = Math.floor(Math.random() * 3) + 2;
      const selectedStocks = stocks
        .sort(() => 0.5 - Math.random())
        .slice(0, numStocks);

      for (const stock of selectedStocks) {
        const quantity = Math.floor(Math.random() * 1000) + 100; // 100-1100 shares
        const averagePrice = 150 + Math.random() * 350; // $150-$500
        const now = new Date();

        await this.prisma.portfolio.upsert({
          where: {
            userId_ticker: {
              userId: user.id,
              ticker: stock.ticker,
            },
          },
          update: {
            quantity,
            averagePrice,
            updatedAt: now,
          },
          create: {
            userId: user.id,
            ticker: stock.ticker,
            quantity,
            averagePrice,
            positionType: 'LONG',
            updatedAt: now,
          },
        });
      }
    }
  }

  async onModuleDestroy() {
    if (this.seedingInterval) {
      clearInterval(this.seedingInterval);
    }
  }
}
