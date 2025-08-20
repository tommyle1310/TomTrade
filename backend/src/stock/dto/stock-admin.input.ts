import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType()
export class StockPaginationInput {
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
  companyName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  exchange?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isTradable?: boolean | null;
}

@InputType()
export class CreateStockInput {
  @Field(() => String)
  @IsString()
  ticker: string;

  @Field(() => String)
  @IsString()
  companyName: string;

  @Field(() => String)
  @IsString()
  exchange: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sector?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ipoDate?: string; // ISO date string

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isTradable?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  suspendReason?: string;
}

@InputType()
export class UpdateStockInput {
  @Field(() => String)
  @IsString()
  ticker: string; // immutable key

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  companyName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  exchange?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sector?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ipoDate?: string | null; // ISO date string

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isTradable?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  suspendReason?: string | null;
}
