import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { AlertRuleType } from '../dto/create-alert-rule.input';

@ObjectType()
export class AlertRule {
  @Field(() => ID)
  id: string;

  @Field()
  ticker: string;

  @Field(() => AlertRuleType)
  ruleType: AlertRuleType;

  @Field(() => Float)
  targetValue: number;

  @Field()
  createdAt: Date;
}
