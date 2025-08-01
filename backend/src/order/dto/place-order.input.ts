import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { OrderSide } from '../enums/order-side.enum';
import { OrderType } from '../enums/order-type.enum';
import { TimeInForce } from '../enums/time-in-force.enum';

registerEnumType(TimeInForce, {
  name: 'TimeInForce',
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

  @Field(() => TimeInForce, { defaultValue: TimeInForce.GTC })
  timeInForce: TimeInForce;
}
