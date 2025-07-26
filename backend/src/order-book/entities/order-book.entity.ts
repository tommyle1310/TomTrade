import { Field, ObjectType } from '@nestjs/graphql';
import { Order } from 'src/order/entities/order.entity';

@ObjectType()
export class OrderBook {
  @Field(() => [Order])
  buyOrders: Order[];

  @Field(() => [Order])
  sellOrders: Order[];
}
