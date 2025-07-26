import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { BalanceService } from '../balance/balance.service';

@Module({
  providers: [UserResolver, BalanceService],
  // exports: [BalanceService], // nếu chỗ khác cần xài nữa
})
export class UserModule {}
