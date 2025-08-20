import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class TradeTick {
  @Field(() => Float)
  tradeId: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  quantity: number;

  @Field(() => String)
  side: 'BUY' | 'SELL';

  @Field(() => Float)
  timestamp: number;
}
