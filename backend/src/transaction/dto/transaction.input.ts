import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class BuyStockInput {
  @Field()
  ticker: string;

  @Field(() => Float)
  shares: number;

  @Field(() => Float)
  price: number;
}

@InputType()
export class SellStockInput {
  @Field()
  ticker: string;

  @Field(() => Float)
  shares: number;

  @Field(() => Float)
  price: number;
}
