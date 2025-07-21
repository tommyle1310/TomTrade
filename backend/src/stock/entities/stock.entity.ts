// src/stock/entities/stock.entity.ts
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { MarketData } from './market-data.entity';

@ObjectType()
export class Stock {
  @Field(() => String)
  ticker: string;

  @Field(() => String)
  companyName: string;

  @Field(() => String)
  exchange: string;

  @Field({ nullable: true })
  sector?: string;

  @Field({ nullable: true })
  industry?: string;

  @Field(() => String, { nullable: true })
  currency?: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => Float, { nullable: true })
  insiderHolding?: number;

  @Field(() => Float, { nullable: true })
  institutionalHolding?: number;

  @Field(() => String, { nullable: true })
  ipoDate?: string;

  @Field(() => String, { nullable: true })
  marketCap?: string;

  @Field(() => String, { nullable: true })
  outstandingShares?: string;

  // Liên kết dữ liệu giá
  @Field(() => [MarketData], { nullable: 'itemsAndList' })
  marketData?: MarketData[];
}
