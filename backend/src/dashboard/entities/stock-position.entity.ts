import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class StockPosition {
  @Field()
  ticker: string;

  @Field()
  companyName: string;

  @Field(() => Float)
  quantity: number;

  @Field(() => Float)
  averageBuyPrice: number;

  @Field(() => Float)
  currentPrice: number;

  @Field(() => Float)
  marketValue: number;

  @Field(() => Float)
  unrealizedPnL: number;

  @Field(() => Float)
  unrealizedPnLPercent: number;
}
