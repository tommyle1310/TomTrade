import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { BalanceService } from '../balance/balance.service';

@Module({
  providers: [UserResolver, UserService, BalanceService],
  exports: [UserService],
})
export class UserModule {}
