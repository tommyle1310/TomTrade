import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ForecastModel {
  @Field() id: string;

  @Field() ticker: string;

  @Field() modelType: string;

  @Field() prediction: number;

  @Field() confidenceScore: number;

  @Field() trainedAt: Date;
}
