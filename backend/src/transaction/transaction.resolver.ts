import { Query, Resolver, Mutation, Args } from '@nestjs/graphql';
import { Transaction } from './entities/transaction.entity';
import { TransactionService } from './transaction.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BuyStockInput, SellStockInput } from './dto/transaction.input';
import { BuyStockPayload, SellStockPayload } from './entities/transaction.payload';
import { User } from '@prisma/client';

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Query(() => [Transaction], { name: 'myTransactions' })
  @UseGuards(GqlAuthGuard)
  myTransactions(@CurrentUser() user: User) {
    return this.transactionService.getByUser(user.id);
  }

  @Mutation(() => BuyStockPayload)
  @UseGuards(GqlAuthGuard)
  buyStock(
    @CurrentUser() user: User,
    @Args('input') input: BuyStockInput,
  ) {
    return this.transactionService.buyStock(user.id, input);
  }

  @Mutation(() => SellStockPayload)
  @UseGuards(GqlAuthGuard)
  sellStock(
    @CurrentUser() user: User,
    @Args('input') input: SellStockInput,
  ) {
    return this.transactionService.sellStock(user.id, input);
  }
}
