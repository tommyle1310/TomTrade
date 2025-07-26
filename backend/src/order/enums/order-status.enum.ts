// src/order/enums/order-status.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  PARTIAL = 'PARTIAL', // 👈 THÊM DÒNG NÀY
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});
