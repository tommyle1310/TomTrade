import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Holding {
  @Field()
  symbol: string;

  @Field(() => Float)
  quantity: number;

  @Field(() => Float)
  avgPrice: number;

  @Field(() => Float)
  currentPrice: number;

  @Field(() => Float)
  pnl: number;

  @Field(() => Float)
  pnlPercent: number;

  @Field()
  side: string; // "profit" | "loss" | "neutral"
}

@ObjectType()
export class HoldingPaginationResponse {
  @Field(() => [Holding])
  data: Holding[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;
}
