// src/order/entities/order.entity.ts
import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { OrderSide } from '../enums/order-side.enum';
import { OrderType } from '@prisma/client';
import { OrderStatus } from '../enums/order-status.enum';
import { TimeInForce } from '../enums/time-in-force.enum';

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field()
  ticker: string;

  @Field(() => OrderSide)
  side: OrderSide;

  @Field(() => OrderType)
  type: OrderType;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  quantity: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => TimeInForce)
  timeInForce: TimeInForce;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  matchedAt?: Date;
}
