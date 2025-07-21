import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class AlertRule {
  @Field(() => ID)
  id: string;

  @Field()
  ticker: string;

  @Field()
  ruleType: string;

  @Field(() => Float)
  targetValue: number;

  @Field()
  createdAt: Date;
}
