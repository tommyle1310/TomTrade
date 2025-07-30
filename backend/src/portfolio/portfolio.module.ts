import { Module } from '@nestjs/common';
import { PortfolioResolver } from './portfolio.resolver';
import { PortfolioService } from './portfolio.service';
import { PortfolioPnLService } from './portfolio-pnl.service';
import { PortfolioPnLResolver } from './portfolio-pnl.resolver';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    PortfolioResolver,
    PortfolioService,
    PortfolioPnLService,
    PortfolioPnLResolver,
  ],
  exports: [PortfolioService, PortfolioPnLService],
})
export class PortfolioModule {}
