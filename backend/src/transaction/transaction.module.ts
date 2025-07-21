import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionResolver } from './transaction.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { PortfolioModule } from '../portfolio/portfolio.module';

@Module({
  imports: [PrismaModule, PortfolioModule],
  providers: [TransactionService, TransactionResolver],
  exports: [TransactionService],
})
export class TransactionModule {}
