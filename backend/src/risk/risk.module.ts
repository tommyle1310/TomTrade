import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskResolver } from './risk.resolver';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RiskService, RiskResolver],
  exports: [RiskService],
})
export class RiskModule {}
