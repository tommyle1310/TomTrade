import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrderModule } from '../order/order.module';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { BalanceModule } from '../balance/balance.module';
import { StockModule } from '../stock/stock.module';
import { CoreModule } from '../core/core.module';
import { BalanceService } from 'src/balance/balance.service';
import { SimulationService } from './simulation.service';
import { SimulationController } from './simulation.controller';

@Module({
  imports: [
    PrismaModule,
    OrderModule,
    PortfolioModule,
    BalanceModule,
    StockModule,
    CoreModule,
  ],
  controllers: [],
  providers: [SimulationService, BalanceService, SimulationController],
  exports: [SimulationService],
})
export class SimulationModule {}
