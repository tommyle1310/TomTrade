// src/order/entities/order.entity.ts
import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { OrderSide } from '../enums/order-side.enum';
import { OrderType } from '@prisma/client';
import { OrderStatus } from '../enums/order-status.enum';

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  @Field()
  ticker: string;

  @Field(() => OrderSide)
  side: OrderSide;

  @Field(() => OrderType) // 👈 QUAN TRỌNG: thêm dòng này
  type: OrderType;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  quantity: number;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  matchedAt?: Date;
}
