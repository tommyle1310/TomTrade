import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardResolver } from './dashboard.resolver';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { TransactionModule } from '../transaction/transaction.module';
import { StockModule } from '../stock/stock.module';
import { BalanceModule } from '../balance/balance.modue';

@Module({
  imports: [PortfolioModule, TransactionModule, StockModule, BalanceModule],
  providers: [DashboardService, DashboardResolver],
  exports: [DashboardService],
})
export class DashboardModule {}
