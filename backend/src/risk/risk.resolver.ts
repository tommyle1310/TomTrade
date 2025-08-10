import { Resolver, Query, Mutation, Args, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { RiskService } from './risk.service';
import {
  RiskConfig,
  RiskReport,
  UpdateRiskConfigInput,
  PositionValidation,
  RiskValidation,
} from './risk.dto';

@Resolver()
@UseGuards(GqlAuthGuard)
export class RiskResolver {
  constructor(private readonly riskService: RiskService) {}

  @Query(() => RiskConfig)
  async getRiskConfig(@CurrentUser() user: User): Promise<RiskConfig> {
    return this.riskService.getRiskConfig(user.id);
  }

  @Query(() => RiskReport)
  async getRiskReport(@CurrentUser() user: User): Promise<RiskReport> {
    return this.riskService.getRiskReport(user.id);
  }

  @Mutation(() => RiskConfig)
  async updateRiskConfig(
    @Args('input') input: UpdateRiskConfigInput,
    @CurrentUser() user: User,
  ): Promise<RiskConfig> {
    return this.riskService.updateRiskConfig(user.id, input);
  }

  @Query(() => PositionValidation)
  async validatePositionSize(
    @Args('ticker') ticker: string,
    @Args('quantity') quantity: number,
    @Args('price') price: number,
    @CurrentUser() user: User,
  ): Promise<PositionValidation> {
    return this.riskService.validatePositionSize(
      user.id,
      ticker,
      quantity,
      price,
    );
  }

  @Query(() => RiskValidation)
  async validateRiskPerTrade(
    @Args('ticker') ticker: string,
    @Args('quantity') quantity: number,
    @Args('price') price: number,
    @CurrentUser() user: User,
    @Args('stopLossPrice', { nullable: true }) stopLossPrice?: number,
  ): Promise<RiskValidation> {
    const result = await this.riskService.validateRiskPerTrade(
      user.id,
      ticker,
      quantity,
      price,
      stopLossPrice,
    );
    return {
      isValid: result.isValid,
      message: result.message,
    };
  }

  @Query(() => RiskValidation)
  async validatePortfolioRisk(
    @CurrentUser() user: User,
  ): Promise<RiskValidation> {
    const result = await this.riskService.validatePortfolioRisk(user.id);
    return {
      isValid: result.isValid,
      message: result.message,
      currentRisk: result.currentRisk,
    };
  }

  @Query(() => Float)
  async calculateRecommendedStopLoss(
    @Args('ticker') ticker: string,
    @Args('entryPrice') entryPrice: number,
    @Args('side') side: 'BUY' | 'SELL',
    @CurrentUser() user: User,
  ): Promise<number> {
    return this.riskService.calculateRecommendedStopLoss(
      user.id,
      ticker,
      entryPrice,
      side,
    );
  }
}
