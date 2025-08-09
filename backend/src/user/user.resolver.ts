import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { BalanceService } from '../balance/balance.service';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly balanceService: BalanceService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => Number)
  async getMyBalance(@CurrentUser() user: User) {
    return this.balanceService.getBalance(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async me(@CurrentUser() user: { id: string }): Promise<User> {
    const userDetails = await this.userService.getUserById(user.id);
    if (!userDetails) {
      throw new Error('User not found');
    }
    return userDetails;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { nullable: true })
  async getUserById(@Args('userId') userId: string): Promise<User | null> {
    return this.userService.getUserById(userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    // This should probably have admin role check
    return this.userService.getAllUsers();
  }
}
