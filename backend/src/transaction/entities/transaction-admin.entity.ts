import {
  ObjectType,
  Field,
  Float,
  ID,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { GraphQLString } from 'graphql';
import { TransactionAction } from '@prisma/client';

@ObjectType()
export class UserInfo {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => GraphQLString, { nullable: true })
  name: string | null;

  @Field()
  role: string;
}

@ObjectType()
export class TransactionWithUser {
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

  @Field(() => Float)
  totalAmount: number;

  @Field(() => UserInfo)
  user: UserInfo;
}

@ObjectType()
export class TransactionPaginationMeta {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  totalBuyAmount: number;

  @Field(() => Float)
  totalSellAmount: number;

  @Field(() => Int)
  totalBuyCount: number;

  @Field(() => Int)
  totalSellCount: number;
}

@ObjectType()
export class TransactionPaginationResponse {
  @Field(() => [TransactionWithUser])
  transactions: TransactionWithUser[];

  @Field(() => TransactionPaginationMeta)
  meta: TransactionPaginationMeta;
}

@ObjectType()
export class TransactionStats {
  @Field(() => Int)
  totalTransactions: number;

  @Field(() => Float)
  totalVolume: number;

  @Field(() => Float)
  totalBuyVolume: number;

  @Field(() => Float)
  totalSellVolume: number;

  @Field(() => Int)
  uniqueUsers: number;

  @Field(() => Int)
  uniqueStocks: number;

  @Field(() => Float)
  averagePrice: number;
}

registerEnumType(TransactionAction, {
  name: 'TransactionAction',
});
