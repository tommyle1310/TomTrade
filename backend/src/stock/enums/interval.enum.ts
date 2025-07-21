// src/stock/enums/interval.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum Interval {
  _1m = '_1m',
  _5m = '_5m',
  _1h = '_1h',
  _1d = '_1d',
}

registerEnumType(Interval, {
  name: 'Interval',
});
