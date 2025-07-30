import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { PortfolioPnLService } from './portfolio-pnl.service';

@Resolver()
export class PortfolioPnLResolver {
  constructor(private portfolioPnLService: PortfolioPnLService) {}

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
}
