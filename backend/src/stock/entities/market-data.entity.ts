// src/stock/entities/market-data.entity.ts
import { ObjectType, Field, ID, Float, registerEnumType } from '@nestjs/graphql';
import { Interval } from 'src/stock/enums/interval.enum';

@ObjectType()
export class MarketData {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  ticker: string;

  @Field(() => String)
  timestamp: Date;

  @Field(() => Interval)
  interval: Interval;

  @Field(() => Float)
  open: number;

  @Field(() => Float)
  high: number;

  @Field(() => Float)
  low: number;

  @Field(() => Float)
  close: number;

  @Field(() => String)
  volume: string;

  @Field(() => Float, { nullable: true })
  afterHours?: number;
}
