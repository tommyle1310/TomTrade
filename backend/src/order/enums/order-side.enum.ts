// src/order/enums/order-side.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}
registerEnumType(OrderSide, { name: 'OrderSide' });
