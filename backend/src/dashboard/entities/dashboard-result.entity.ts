import { ObjectType, Field, Float } from '@nestjs/graphql';
import { StockPosition } from './stock-position.entity';

@ObjectType()
export class DashboardResult {
  @Field(() => Float)
  totalPortfolioValue: number; // Total assets (stocks + cash)

  @Field(() => Float)
  stocksOnlyValue: number; // Stocks only (excluding cash)

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
