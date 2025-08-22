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

    // Generate realistic daily OHLC with highly variable body sizes
    const open = basePrice + (Math.random() - 0.5) * 20;

    // Create highly variable body sizes (0.1% to 8% of price)
    const bodySizeMultiplier = 0.001 + Math.random() * 0.079; // 0.1% to 8%
    const direction = Math.random() > 0.5 ? 1 : -1;
    const close = open + direction * open * bodySizeMultiplier;

    // Generate asymmetric wicks with realistic patterns
    const bodyRange = Math.abs(close - open);

    // NEW: Randomize body-to-total-range ratio (10% to 90% of total candle range)
    const bodyToTotalRatio = 0.1 + Math.random() * 0.8; // 10% to 90%

    // Calculate total candle range based on body ratio
    const totalRange = bodyRange / bodyToTotalRatio;

    // Distribute remaining range to wicks (sometimes very small wicks)
    const remainingRange = totalRange - bodyRange;
    const upperWickRatio = Math.random(); // 0 to 1
    const lowerWickRatio = 1 - upperWickRatio;

    const upperWick = remainingRange * upperWickRatio;
    const lowerWick = remainingRange * lowerWickRatio;

    const high = Math.max(open, close) + upperWick;
    const low = Math.min(open, close) - lowerWick;

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
    _stocks: { ticker: string }[],
  ) {
    // Generate hourly bars aligned to exact top-of-hour UTC timestamps
    // Market hours approximated from 9:00 to 16:00 (7 hours)
    const start = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        9,
        0,
        0,
        0,
      ),
    );
    const endHour = 16;

    let currentPrice = basePrice;
    for (let hour = 9; hour < endHour; hour++) {
      const timestamp = new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          hour,
          0,
          0,
          0,
        ),
      );

      // Check for duplicate bar
      const existingData = await this.prisma.marketData.findFirst({
        where: { ticker: stock.ticker, timestamp, interval: '1h' },
      });
      if (existingData) continue;

      const open = currentPrice;

      // Create highly variable body sizes (0.05% to 4% of price)
      const bodySizeMultiplier = 0.0005 + Math.random() * 0.0395; // 0.05% to 4%
      const direction = Math.random() > 0.5 ? 1 : -1;
      const close = open + direction * open * bodySizeMultiplier;

      // Generate asymmetric wicks with realistic patterns
      const bodyRange = Math.abs(close - open);

      // NEW: Randomize body-to-total-range ratio (15% to 85% of total candle range)
      const bodyToTotalRatio = 0.15 + Math.random() * 0.7; // 15% to 85%

      // Calculate total candle range based on body ratio
      const totalRange = bodyRange / bodyToTotalRatio;

      // Distribute remaining range to wicks (sometimes very small wicks)
      const remainingRange = totalRange - bodyRange;
      const upperWickRatio = Math.random(); // 0 to 1
      const lowerWickRatio = 1 - upperWickRatio;

      const upperWick = remainingRange * upperWickRatio;
      const lowerWick = remainingRange * lowerWickRatio;

      const high = Math.max(open, close) + upperWick;
      const low = Math.min(open, close) - lowerWick;
      const volume = Math.floor(200000 + Math.random() * 800000);

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

      currentPrice = close;
    }
  }

  private async generateMinuteData(
    date: Date,
    stock: { ticker: string },
    basePrice: number,
    stocks: { ticker: string }[],
  ) {
    // Generate aligned minute-based intervals with exact boundaries in UTC
    const intervals = [
      { name: '30m', stepMinutes: 30 },
      { name: '15m', stepMinutes: 15 },
      { name: '5m', stepMinutes: 5 },
      { name: '1m', stepMinutes: 1 },
    ];

    for (const interval of intervals) {
      await this.generateAlignedIntervalData(
        date,
        stock,
        basePrice,
        interval.name,
        interval.stepMinutes,
      );
    }
  }

  private async generateAlignedIntervalData(
    date: Date,
    stock: { ticker: string },
    basePrice: number,
    intervalName: string,
    stepMinutes: number,
  ) {
    // Generate from 9:00 to 16:00 UTC aligned by stepMinutes
    let currentPrice = basePrice;
    const start = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        9,
        0,
        0,
        0,
      ),
    );
    const end = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        16,
        0,
        0,
        0,
      ),
    );

    for (
      let ts = new Date(start);
      ts < end;
      ts = new Date(ts.getTime() + stepMinutes * 60 * 1000)
    ) {
      const timestamp = new Date(ts); // aligned

      // Use upsert to prevent duplicates with unique constraint
      const open = currentPrice;

      // Create highly variable body sizes by interval
      let bodySizeMultiplier: number;
      switch (stepMinutes) {
        case 1: // 1m - very small bodies (0.02% to 1%)
          bodySizeMultiplier = 0.0002 + Math.random() * 0.0098;
          break;
        case 5: // 5m - small bodies (0.05% to 2%)
          bodySizeMultiplier = 0.0005 + Math.random() * 0.0195;
          break;
        case 15: // 15m - medium bodies (0.1% to 3%)
          bodySizeMultiplier = 0.001 + Math.random() * 0.029;
          break;
        case 30: // 30m - larger bodies (0.2% to 4%)
          bodySizeMultiplier = 0.002 + Math.random() * 0.038;
          break;
        default:
          bodySizeMultiplier = 0.001 + Math.random() * 0.019;
      }

      const direction = Math.random() > 0.5 ? 1 : -1;
      const close = open + direction * open * bodySizeMultiplier;

      // Generate asymmetric wicks with realistic patterns
      const bodyRange = Math.abs(close - open);

      // NEW: Randomize body-to-total-range ratio by interval
      let bodyToTotalRatio: number;
      switch (stepMinutes) {
        case 1: // 1m - body can be 20% to 80% of total range
          bodyToTotalRatio = 0.2 + Math.random() * 0.6;
          break;
        case 5: // 5m - body can be 25% to 85% of total range
          bodyToTotalRatio = 0.25 + Math.random() * 0.6;
          break;
        case 15: // 15m - body can be 30% to 90% of total range
          bodyToTotalRatio = 0.3 + Math.random() * 0.6;
          break;
        case 30: // 30m - body can be 35% to 95% of total range
          bodyToTotalRatio = 0.35 + Math.random() * 0.6;
          break;
        default:
          bodyToTotalRatio = 0.25 + Math.random() * 0.6;
      }

      // Calculate total candle range based on body ratio
      const totalRange = bodyRange / bodyToTotalRatio;

      // Distribute remaining range to wicks (sometimes very small wicks)
      const remainingRange = totalRange - bodyRange;
      const upperWickRatio = Math.random(); // 0 to 1
      const lowerWickRatio = 1 - upperWickRatio;

      const upperWick = remainingRange * upperWickRatio;
      const lowerWick = remainingRange * lowerWickRatio;

      const high = Math.max(open, close) + upperWick;
      const low = Math.min(open, close) - lowerWick;
      const volume = Math.floor(50000 + Math.random() * 300000);

      // Use upsert to handle potential duplicates gracefully
      await this.prisma.marketData.upsert({
        where: {
          ticker_interval_timestamp: {
            ticker: stock.ticker,
            interval: intervalName,
            timestamp,
          },
        },
        update: {
          open,
          high,
          low,
          close,
          volume: BigInt(volume),
          afterHours: close + (Math.random() * 5 - 2.5),
        },
        create: {
          ticker: stock.ticker,
          timestamp,
          interval: intervalName,
          open,
          high,
          low,
          close,
          volume: BigInt(volume),
          afterHours: close + (Math.random() * 5 - 2.5),
        },
      });

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
