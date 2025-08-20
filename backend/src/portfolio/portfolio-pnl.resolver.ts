import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { PortfolioPnLService } from './portfolio-pnl.service';
import { PortfolioChart } from './entities/portfolio-chart.entity';
import { PrismaService } from 'prisma/prisma.service';

@Resolver()
export class PortfolioPnLResolver {
  constructor(
    private portfolioPnLService: PortfolioPnLService,
    private prisma: PrismaService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => String)
  async getPortfolioSummary(@CurrentUser() user: User) {
    // Mock current prices - replace with real market data service
    const currentPrices: Record<string, number> = {
      AAPL: 300,
      GOOG: 2800,
    };

    const summary = await this.portfolioPnLService.getPortfolioSummary(
      user.id,
      currentPrices,
    );

    return JSON.stringify(summary);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => String)
  async getPositionPnL(
    @CurrentUser() user: User,
    @Args('ticker') ticker: string,
  ) {
    // Mock current price - replace with real market data service
    const currentPrice = ticker === 'AAPL' ? 300 : 2800;

    const positionPnL = await this.portfolioPnLService.getPositionPnL(
      user.id,
      ticker,
      currentPrice,
    );

    return JSON.stringify(positionPnL);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => String)
  async getTotalPnL(@CurrentUser() user: User) {
    // Mock current prices - replace with real market data service
    const currentPrices: Record<string, number> = {
      AAPL: 300,
      GOOG: 2800,
    };

    const pnlData = await this.portfolioPnLService.calculatePortfolioPnL(
      user.id,
      currentPrices,
    );

    return JSON.stringify({
      totalPnL: pnlData.totalPnL,
      totalUnrealizedPnL: pnlData.totalUnrealizedPnL,
      totalRealizedPnL: pnlData.totalRealizedPnL,
      totalAssets: pnlData.totalAssets,
      balance: pnlData.balance,
    });
  }

  // Aggregated portfolio for charts
  @UseGuards(GqlAuthGuard)
  @Query(() => PortfolioChart)
  async portfolio(@CurrentUser() user: User) {
    // Fetch current prices from latest MarketData per ticker
    const positions = await this.prisma.portfolio.findMany({
      where: { userId: user.id },
    });
    const tickers = positions.map((p) => p.ticker);
    const latestByTicker: Record<string, number> = {};
    for (const t of tickers) {
      const md = await this.prisma.marketData.findFirst({
        where: { ticker: t },
        orderBy: { timestamp: 'desc' },
        select: { close: true },
      });
      latestByTicker[t] = md?.close ?? 0;
    }

    const totals = await this.portfolioPnLService.calculatePortfolioPnL(
      user.id,
      latestByTicker,
    );

    const totalValue = totals.totalPortfolioValue;
    const holdings = positions.map((p) => {
      const value = p.quantity * (latestByTicker[p.ticker] ?? p.averagePrice);
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
      return { symbol: p.ticker, value, percentage };
    });

    // Simple synthetic equity curve based on last 10 days using market data of first holding
    const equityCurve: { timestamp: number; value: number }[] = [];
    const now = Date.now();
    for (let i = 9; i >= 0; i--) {
      const ts = now - i * 24 * 60 * 60 * 1000;
      // naive: assume constant portfolio for demo
      equityCurve.push({
        timestamp: ts,
        value: totalValue * (1 - (9 - i) * 0.002),
      });
    }

    return { totalValue, holdings, equityCurve };
  }
}
