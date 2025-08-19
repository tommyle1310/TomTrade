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

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      for (const stock of stocks) {
        // Create more realistic price progression with trends and volatility
        const basePrice = 100 + Math.random() * 400;
        const trend = (Math.random() - 0.5) * 0.02; // Small daily trend
        const volatility = 0.05; // 5% daily volatility

        // Calculate price with trend and volatility
        const daysFromStart = Math.floor(
          (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
        );
        const trendEffect = 1 + trend * daysFromStart;
        const randomEffect = 1 + (Math.random() - 0.5) * volatility;

        const adjustedPrice = basePrice * trendEffect * randomEffect;

        const open = adjustedPrice + (Math.random() * 10 - 5);
        const high = open + Math.random() * 20;
        const low = open - Math.random() * 20;
        const close = low + Math.random() * (high - low);
        const volume = Math.floor(Math.random() * 1000000) + 100000;

        await this.prisma.marketData.create({
          data: {
            ticker: stock.ticker,
            timestamp: currentDate,
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

      currentDate.setDate(currentDate.getDate() + 1);
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
