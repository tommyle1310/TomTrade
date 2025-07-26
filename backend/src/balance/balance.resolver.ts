import { Args, Float, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { BalanceService } from 'src/balance/balance.service';
import { UseGuards } from '@nestjs/common';

// balance.resolver.ts
@Resolver(() => User)
export class BalanceResolver {
  constructor(private readonly balanceService: BalanceService) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deposit(@CurrentUser() user: User, @Args('amount') amount: number) {
    return this.balanceService.deposit(user.id, amount);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deduct(
    @CurrentUser() user: User,
    @Args('amount', { type: () => Float }) amount: number,
  ) {
    await this.balanceService.deduct(user.id, amount);
    return true;
  }

  @Query(() => Number)
  async getBalance(@Args('userId') userId: string) {
    return this.balanceService.get(userId);
  }
}
