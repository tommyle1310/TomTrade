// src/order/enums/order-side.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}
registerEnumType(OrderSide, { name: 'OrderSide' });

// src/order/enums/order-status.enum.ts
export enum OrderStatus {
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
}
registerEnumType(OrderStatus, { name: 'OrderStatus' });
