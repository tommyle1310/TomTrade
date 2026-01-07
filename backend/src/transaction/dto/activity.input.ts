import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, Min, Max } from 'class-validator';

@InputType()
export class ActivityPaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
