// src/core/core.module.ts
import { Global, Module } from '@nestjs/common';
import { SocketService } from 'src/core/socket-gateway.service';
import { PortfolioModule } from '../portfolio/portfolio.module';
import { BalanceModule } from '../balance/balance.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { BalanceService } from 'src/balance/balance.service';

@Global()
@Module({
  imports: [PortfolioModule, BalanceModule, PrismaModule],
  providers: [SocketService, BalanceService],
  exports: [SocketService],
})
export class CoreModule {}
