import { registerEnumType } from '@nestjs/graphql';

export enum TimeInForce {
  GTC = 'GTC', // Good Till Cancelled (default)
  IOC = 'IOC', // Immediate or Cancel
  FOK = 'FOK', // Fill or Kill
}

registerEnumType(TimeInForce, { name: 'TimeInForce' });
