import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { BalanceService } from '../balance/balance.service';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly balanceService: BalanceService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => Number)
  async getMyBalance(@CurrentUser() user: User) {
    return this.balanceService.getBalance(user.id);
  }
}
