import { Module } from '@nestjs/common';
import { BalanceService } from '../balance/balance.service';
import { BalanceResolver } from './balance.resolver';

@Module({
  providers: [BalanceResolver, BalanceService],
  // exports: [BalanceService], // nếu chỗ khác cần xài nữa
})
export class BalanceModule {}
