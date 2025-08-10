import { InputType, Field, ObjectType, Float } from '@nestjs/graphql';

@InputType()
export class UpdateRiskConfigInput {
  @Field(() => Float, { nullable: true })
  maxPositionSizePercent?: number;

  @Field(() => Float, { nullable: true })
  maxRiskPerTrade?: number;

  @Field(() => Float, { nullable: true })
  maxPortfolioRisk?: number;

  @Field(() => Float, { nullable: true })
  stopLossPercent?: number;

  @Field(() => Float, { nullable: true })
  maxLeverage?: number;
}

@ObjectType()
export class RiskConfig {
  @Field(() => Float)
  maxPositionSizePercent: number;

  @Field(() => Float)
  maxRiskPerTrade: number;

  @Field(() => Float)
  maxPortfolioRisk: number;

  @Field(() => Float)
  stopLossPercent: number;

  @Field(() => Float)
  maxLeverage: number;
}

@ObjectType()
export class RiskReport {
  @Field(() => Float)
  portfolioValue: number;

  @Field(() => Float)
  portfolioRisk: number;

  @Field(() => Float)
  maxPositionSize: number;

  @Field(() => RiskConfig)
  riskConfig: RiskConfig;
}

@ObjectType()
export class PositionValidation {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Float, { nullable: true })
  maxQuantity?: number;
}

@ObjectType()
export class RiskValidation {
  @Field(() => Boolean)
  isValid: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Float, { nullable: true })
  currentRisk?: number;
}
