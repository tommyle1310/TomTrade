import { InputType, Field } from '@nestjs/graphql';
import { IsDateString, IsOptional } from 'class-validator';

@InputType()
export class SystemDashboardInput {
  @Field()
  @IsDateString()
  startDate: string;

  @Field()
  @IsDateString()
  endDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  compareStartDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  compareEndDate?: string;
}
