import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class EquityDrawdownPoint {
  @Field()
  date: string;

  @Field(() => Float)
  equity: number;

  @Field(() => Float)
  maxDrawdown: number;
}

@ObjectType()
export class PnLPoint {
  @Field()
  date: string;

  @Field(() => Float)
  pnl: number;
}

@ObjectType()
export class MostTradedStock {
  @Field()
  ticker: string;

  @Field()
  companyName: string;

  @Field(() => Float)
  volume: number;

  @Field(() => Float)
  shareOfVolume: number;
}

@ObjectType()
export class TopUser {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field(() => Float)
  pnl: number;

  @Field(() => Float)
  totalValue: number;
}

@ObjectType()
export class MetricWithDateRange {
  @Field(() => Float)
  startDate: number;

  @Field(() => Float)
  endDate: number;
}

@ObjectType()
export class SystemDashboardResult {
  @Field(() => MetricWithDateRange)
  totalRevenue: MetricWithDateRange;

  @Field(() => MetricWithDateRange)
  totalTradesExecuted: MetricWithDateRange;

  @Field(() => MetricWithDateRange)
  winRate: MetricWithDateRange;

  @Field(() => MetricWithDateRange)
  maxDrawdown: MetricWithDateRange;

  @Field(() => [EquityDrawdownPoint])
  equityAndDrawdown: EquityDrawdownPoint[];

  @Field(() => [PnLPoint])
  pnlOverTime: PnLPoint[];

  @Field(() => [MostTradedStock])
  mostTradedStocks: MostTradedStock[];

  @Field(() => MetricWithDateRange)
  arpu: MetricWithDateRange;

  @Field(() => MetricWithDateRange)
  churnRate: MetricWithDateRange;

  @Field(() => MetricWithDateRange)
  averageTradeSize: MetricWithDateRange;

  @Field(() => MetricWithDateRange)
  marginCallAlerts: MetricWithDateRange;

  @Field(() => MetricWithDateRange)
  serviceUptime: MetricWithDateRange;

  @Field(() => [TopUser])
  topUsers: TopUser[];
}
