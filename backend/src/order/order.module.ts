import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { PortfolioService } from 'src/portfolio/portfolio.service';
import { BalanceService } from 'src/balance/balance.service';

@Module({
  imports: [PrismaModule, forwardRef(() => TransactionModule)],
  providers: [OrderResolver, OrderService, PortfolioService, BalanceService],
  exports: [OrderService],
})
export class OrderModule {}
