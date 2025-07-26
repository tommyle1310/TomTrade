import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { OrderSide } from '../enums/order-side.enum';
import { OrderType } from '@prisma/client';

registerEnumType(OrderType, {
  name: 'OrderType',
});

@InputType()
export class PlaceOrderInput {
  @Field()
  ticker: string;

  @Field()
  price: number;

  @Field()
  quantity: number;

  @Field(() => OrderSide)
  side: OrderSide;

  @Field(() => OrderType, { defaultValue: OrderType.LIMIT })
  type: OrderType;
}
