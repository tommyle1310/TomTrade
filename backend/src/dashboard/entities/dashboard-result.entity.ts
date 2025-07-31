import { ObjectType, Field, Float } from '@nestjs/graphql';
import { StockPosition } from './stock-position.entity';

@ObjectType()
export class DashboardResult {
  @Field(() => Float)
  totalPortfolioValue: number;

  @Field(() => Float)
  totalRealizedPnL: number;

  @Field(() => Float)
  totalUnrealizedPnL: number;

  @Field(() => Float)
  totalPnL: number;

  @Field(() => Float)
  cashBalance: number;

  @Field(() => [StockPosition])
  stockPositions: StockPosition[];
}
