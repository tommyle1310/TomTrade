import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class HoldingSlice {
  @Field()
  symbol: string;

  @Field(() => Float)
  value: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class EquityPoint {
  @Field(() => Float)
  timestamp: number;

  @Field(() => Float)
  value: number;
}

@ObjectType()
export class PortfolioChart {
  @Field(() => Float)
  totalValue: number;

  @Field(() => [HoldingSlice])
  holdings: HoldingSlice[];

  @Field(() => [EquityPoint])
  equityCurve: EquityPoint[];
}
