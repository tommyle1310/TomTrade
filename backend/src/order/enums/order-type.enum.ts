import { registerEnumType } from '@nestjs/graphql';

export enum OrderType {
  LIMIT = 'LIMIT',
  MARKET = 'MARKET',
  STOP_LIMIT = 'STOP_LIMIT',
  STOP_MARKET = 'STOP_MARKET',
}

registerEnumType(OrderType, {
  name: 'OrderType',
  description: 'The type of order',
});
