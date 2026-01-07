import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class Activity {
  @Field()
  type: string; // "BUY" | "SELL"

  @Field()
  timestamp: Date;

  @Field(() => Float)
  avgPrice: number;

  @Field(() => Float)
  currentPrice: number;

  @Field()
  ticker: string;

  @Field(() => Float)
  shares: number;
}

@ObjectType()
export class ActivityPaginationResponse {
  @Field(() => [Activity])
  data: Activity[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;
}
