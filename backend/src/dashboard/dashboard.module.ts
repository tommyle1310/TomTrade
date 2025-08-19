import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResolver } from './dashboard.resolver';
import { SystemDashboardService } from './system-dashboard.service';
import { SystemDashboardResolver } from './system-dashboard.resolver';
import { SystemDashboardSeederService } from './system-dashboard-seeder.service';
import { SystemDashboardSeederResolver } from './system-dashboard-seeder.resolver';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { TransactionModule } from '../transaction/transaction.module';
import { StockModule } from '../stock/stock.module';
import { BalanceModule } from '../balance/balance.module';
import { BalanceService } from 'src/balance/balance.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PortfolioModule,
    TransactionModule,
    StockModule,
    BalanceModule,
    RedisModule,
  ],
  providers: [
    DashboardService,
    DashboardResolver,
    SystemDashboardService,
    SystemDashboardResolver,
    SystemDashboardSeederService,
    SystemDashboardSeederResolver,
    BalanceService,
  ],
  exports: [
    DashboardService,
    SystemDashboardService,
    SystemDashboardSeederService,
  ],
})
export class DashboardModule {}
