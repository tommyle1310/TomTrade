import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class IndicatorPoint {
  @Field(() => Float)
  timestamp: number;

  @Field(() => Float)
  value: number;
}

@ObjectType()
export class IndicatorSeries {
  @Field()
  name: string;

  @Field(() => [IndicatorPoint])
  values: IndicatorPoint[];
}
