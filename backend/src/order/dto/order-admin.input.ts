import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

@InputType()
export class OrderPaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ticker?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  side?: 'BUY' | 'SELL';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;
}

@InputType()
export class UserOrderPaginationInput {
  @Field(() => String)
  @IsString()
  userId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ticker?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  side?: 'BUY' | 'SELL';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: 'OPEN' | 'PARTIAL' | 'FILLED' | 'CANCELLED';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;
}
