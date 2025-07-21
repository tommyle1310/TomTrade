import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Portfolio {
  @Field()
  ticker: string;

  @Field(() => Float)
  quantity: number;

  @Field(() => Float)
  averagePrice: number;
}
