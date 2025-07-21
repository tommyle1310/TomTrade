import { ObjectType, Field, Float, ID, registerEnumType } from '@nestjs/graphql';
import { TransactionAction } from '../enums/transaction-action';

@ObjectType()
export class Transaction {
  @Field(() => ID)
  id: string;

  @Field()
  ticker: string;

  @Field(() => TransactionAction)
  action: TransactionAction;

  @Field(() => Float)
  shares: number;

  @Field(() => Float)
  price: number;

  @Field()
  timestamp: Date;
}

registerEnumType(TransactionAction, {
  name: 'TransactionAction',
});
