import { ObjectType, Field } from '@nestjs/graphql';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';
import { Transaction } from './transaction.entity';

@ObjectType()
export class BuyStockPayload {
  @Field(() => Portfolio)
  portfolio: Portfolio;

  @Field(() => Transaction)
  transaction: Transaction;
}

@ObjectType()
export class SellStockPayload {
  @Field(() => Portfolio)
  portfolio: Portfolio;

  @Field(() => Transaction)
  transaction: Transaction;
}
