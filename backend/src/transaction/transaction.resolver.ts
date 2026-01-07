import { Query, Resolver, Mutation, Args, Int } from '@nestjs/graphql';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BuyStockInput, SellStockInput } from './dto/transaction.input';
import {
  BuyStockPayload,
  SellStockPayload,
} from './entities/transaction.payload';
import { User } from '@prisma/client';
import { RolesGuard } from '../admin/guards/roles.guard';
import { Roles } from '../admin/decorators/roles.decorator';
import {
  TransactionPaginationInput,
  UserTransactionPaginationInput,
} from './dto/transaction-admin.input';
import {
  TransactionPaginationResponse,
  TransactionStats,
} from './entities/transaction-admin.entity';
import { TradeTick } from './entities/trade-tick.entity';
import { PrismaService } from 'prisma/prisma.service';
import { ActivityPaginationInput } from './dto/activity.input';
import { ActivityPaginationResponse } from './entities/activity.entity';

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [Transaction], { name: 'myTransactions' })
  @UseGuards(GqlAuthGuard)
  myTransactions(@CurrentUser() user: User) {
    return this.transactionService.getByUser(user.id);
  }

  @Query(() => ActivityPaginationResponse, { name: 'getRecentActivities' })
  @UseGuards(GqlAuthGuard)
  getRecentActivities(
    @CurrentUser() user: User,
    @Args('input') input: ActivityPaginationInput,
  ) {
    return this.transactionService.getRecentActivities(user.id, input);
  }

  // Admin queries for transaction monitoring
  @Query(() => TransactionPaginationResponse, { name: 'adminTransactions' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminTransactions(@Args('input') input: TransactionPaginationInput) {
    return this.transactionService.getAllTransactionsWithPagination(input);
  }

  @Query(() => TransactionPaginationResponse, { name: 'adminUserTransactions' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminUserTransactions(@Args('input') input: UserTransactionPaginationInput) {
    return this.transactionService.getUserTransactionsWithPagination(input);
  }

  @Query(() => TransactionStats, { name: 'transactionStats' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles('ADMIN')
  transactionStats() {
    return this.transactionService.getTransactionStats();
  }

  @Query(() => [TradeTick])
  async trades(
    @Args('symbol') symbol: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    const rows = await this.prisma.transaction.findMany({
      where: { ticker: symbol },
      orderBy: { timestamp: 'desc' },
      take: limit ?? 100,
    });
    return rows.reverse().map((t, idx) => ({
      tradeId: t.timestamp.getTime() + idx,
      price: t.price,
      quantity: t.shares,
      side: t.action as any,
      timestamp: t.timestamp.getTime(),
    }));
  }

  @Mutation(() => BuyStockPayload)
  @UseGuards(GqlAuthGuard)
  buyStock(@CurrentUser() user: User, @Args('input') input: BuyStockInput) {
    return this.transactionService.buyStock(user.id, input);
  }

  @Mutation(() => SellStockPayload)
  @UseGuards(GqlAuthGuard)
  sellStock(@CurrentUser() user: User, @Args('input') input: SellStockInput) {
    return this.transactionService.sellStock(user.id, input);
  }
}
