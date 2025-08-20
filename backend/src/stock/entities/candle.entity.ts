import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Candle {
  @Field(() => Float)
  timestamp: number; // epoch ms

  @Field(() => Float)
  open: number;

  @Field(() => Float)
  high: number;

  @Field(() => Float)
  low: number;

  @Field(() => Float)
  close: number;

  @Field(() => Float)
  volume: number;
}
