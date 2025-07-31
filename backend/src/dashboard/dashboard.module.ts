import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResolver } from './dashboard.resolver';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { TransactionModule } from '../transaction/transaction.module';
import { StockModule } from '../stock/stock.module';
import { BalanceModule } from '../balance/balance.module';
import { BalanceService } from 'src/balance/balance.service';

@Module({
  imports: [PortfolioModule, TransactionModule, StockModule, BalanceModule],
  providers: [DashboardService, DashboardResolver, BalanceService],
  exports: [DashboardService],
})
export class DashboardModule {}
