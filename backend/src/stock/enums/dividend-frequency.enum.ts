import { registerEnumType } from "@nestjs/graphql";

export enum DividendFrequency {
    QUARTERLY = 'QUARTERLY',
    ANNUAL = 'ANNUAL',
  }
  
  registerEnumType(DividendFrequency, {
    name: 'DividendFrequency',
  });
  