import { InputType, Field, Float, registerEnumType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Length,
} from 'class-validator';

export enum AlertRuleType {
  PRICE_ABOVE = 'PRICE_ABOVE',
  PRICE_BELOW = 'PRICE_BELOW',
  VOLUME_SPIKE = 'VOLUME_SPIKE',
  PERCENT_CHANGE = 'PERCENT_CHANGE',
}

registerEnumType(AlertRuleType, {
  name: 'AlertRuleType',
  description: 'The type of alert rule',
});

@InputType()
export class CreateAlertRuleInput {
  @Field()
  @IsNotEmpty()
  @Length(1, 10)
  ticker: string;

  @Field(() => AlertRuleType)
  @IsEnum(AlertRuleType)
  ruleType: AlertRuleType;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  targetValue: number;
}
