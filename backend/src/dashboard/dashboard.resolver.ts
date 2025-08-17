import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardResult } from './entities/dashboard-result.entity';
import { StockPosition } from './entities/stock-position.entity';

@Resolver()
@UseGuards(GqlAuthGuard)
export class DashboardResolver {
  constructor(private dashboardService: DashboardService) {}

  @Query(() => DashboardResult)
  async getDashboard(
    @CurrentUser() user: { id: string },
  ): Promise<DashboardResult> {
    console.log(
      `🔍 DashboardResolver.getDashboard called for user: ${user.id}`,
    );
    const result = await this.dashboardService.getDashboard(user.id);
    return result;
  }

  @Query(() => StockPosition, { nullable: true })
  async getStockPosition(
    @CurrentUser() user: { id: string },
    @Args('ticker') ticker: string,
  ): Promise<StockPosition | null> {
    return this.dashboardService.getStockPosition(user.id, ticker);
  }
}
