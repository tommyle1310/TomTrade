// src/order/dto/place-order.input.ts
import { InputType, Field, Float } from '@nestjs/graphql';
import { OrderSide } from '../enums/order-side.enum';

@InputType()
export class PlaceOrderInput {
  @Field()
  ticker: string;

  @Field(() => OrderSide)
  side: OrderSide;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  quantity: number;
}
