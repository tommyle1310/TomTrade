import {
  ObjectType,
  Field,
  Float,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { GraphQLString } from 'graphql';
import { OrderSide } from '../enums/order-side.enum';
import { OrderType } from '../enums/order-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { TimeInForce } from '../enums/time-in-force.enum';

@ObjectType()
export class OrderUserInfo {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field(() => GraphQLString, { nullable: true })
  name: string | null;

  @Field()
  role: string;
}

@ObjectType()
export class OrderWithUser {
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

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  matchedAt?: Date | null;

  @Field(() => Float, { nullable: true })
  triggerPrice?: number | null;

  @Field(() => OrderUserInfo)
  user: OrderUserInfo;
}

@ObjectType()
export class OrderPaginationMeta {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  limit: number;
}

@ObjectType()
export class OrderPaginationResponse {
  @Field(() => [OrderWithUser])
  orders: OrderWithUser[];

  @Field(() => OrderPaginationMeta)
  meta: OrderPaginationMeta;
}
