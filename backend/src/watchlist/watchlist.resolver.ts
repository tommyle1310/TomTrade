import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Watchlist } from './entities/watchlist.entity';
import { WatchlistService } from './watchlist.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  AddStockToWatchlistInput,
  CreateWatchlistInput,
} from './dto/watchlist.dto';

@Resolver(() => Watchlist)
export class WatchlistResolver {
  constructor(private service: WatchlistService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Watchlist)
  async createWatchlist(
    @CurrentUser() user: User,
    @Args('input') input: CreateWatchlistInput,
  ) {
    return this.service.create(user.id, input.name);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Watchlist])
  async myWatchlists(@CurrentUser() user: User) {
    return this.service.getAll(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async addStockToWatchlist(@Args('input') input: AddStockToWatchlistInput) {
    await this.service.addStock(input.watchlistId, input.ticker);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async removeStockFromWatchlist(
    @Args('input') input: AddStockToWatchlistInput,
  ) {
    await this.service.removeStock(input.watchlistId, input.ticker);
    return true;
  }
}
