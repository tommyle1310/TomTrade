import { Module, forwardRef } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { PriceFeedListenerService } from './price-feed-listener.service';
import { TransactionModule } from 'src/transaction/transaction.module';
import { PortfolioModule } from 'src/portfolio/portfolio.module';
import { BalanceModule } from 'src/balance/balance.module';
import { CoreModule } from 'src/core/core.module';
import { BalanceService } from 'src/balance/balance.service';
import { RiskService } from 'src/risk/risk.service';
import { DashboardService } from 'src/dashboard/dashboard.service';
import { StockService } from 'src/stock/stock.service';
import { AlertDispatcherService } from 'src/alert-rule/alert-dispatcher.service';
import { AlertRuleService } from 'src/alert-rule/alert-rule.service';

@Module({
  imports: [
    forwardRef(() => TransactionModule),
    PortfolioModule,
    BalanceModule,
    CoreModule,
  ],
  providers: [
    OrderResolver,
    OrderService,
    PriceFeedListenerService,
    DashboardService,
    StockService,
    AlertDispatcherService,
    AlertRuleService,
    BalanceService,
    RiskService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
