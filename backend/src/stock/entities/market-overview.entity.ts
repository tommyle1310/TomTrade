import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class MarketOverviewItem {
  @Field()
  key: string;

  @Field()
  label: string;

  @Field(() => Float)
  value: number;

  @Field()
  unit: string;

  @Field()
  trend: string; // "up" | "down" | "neutral"
}

@ObjectType()
export class MarketOverviewPaginationResponse {
  @Field(() => [MarketOverviewItem])
  data: MarketOverviewItem[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;
}
