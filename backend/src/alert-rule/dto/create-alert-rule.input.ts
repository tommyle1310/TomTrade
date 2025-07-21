import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateAlertRuleInput {
  @Field()
  ticker: string;

  @Field()
  ruleType: string;

  @Field(() => Float)
  targetValue: number;
}
