import { ObjectType, Field } from '@nestjs/graphql';
import { DividendFrequency } from '../enums/dividend-frequency.enum';

@ObjectType()
export class Dividend {
  @Field() ticker: string;

  @Field() exDate: Date;

  @Field() payDate: Date;

  @Field() amount: number;

  @Field(() => DividendFrequency)
  frequency: DividendFrequency;
}
